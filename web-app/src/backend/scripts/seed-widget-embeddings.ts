/**
 * Seed Widget Embeddings Script
 *
 * Why this exists: Pre-embeds all 30 widgets from onboarding-flow.json
 * into Supabase for RAG-powered widget selection.
 *
 * Prerequisites:
 * 1. Create .env.local with SUPABASE_SERVICE_ROLE_KEY and OPENAI_API_KEY
 * 2. Run the migration: 001_widget_embeddings.sql
 *
 * Run with: npx tsx --env-file=.env.local src/backend/scripts/seed-widget-embeddings.ts
 */

import { openai } from '@ai-sdk/openai';
import { createClient } from '@supabase/supabase-js';
import { embed, embedMany } from 'ai';

// Import the onboarding flow
import onboardingFlow from '../../content/onboarding-flow.json';

// Supabase configuration with fallbacks
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zvpudxinbcsrfyojrhhv.supabase.co';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  console.error('');
  console.error('Create a .env.local file with:');
  console.error('  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  console.error('  OPENAI_API_KEY=your_openai_key');
  console.error('');
  console.error(
    'Then run: npx tsx --env-file=.env.local src/backend/scripts/seed-widget-embeddings.ts'
  );
  process.exit(1);
}

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY is required for embeddings');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const embeddingModel = openai.embedding('text-embedding-3-small');

interface WidgetDefinition {
  id: string;
  name: string;
  condition_picker: {
    question: string;
    suggested: string;
    alternatives?: string[];
    allow_multiple?: boolean;
  };
  main_widget: {
    type: string;
    question?: string;
    [key: string]: unknown;
  };
  captures: string[];
  q4_value: string;
}

interface WidgetToEmbed {
  widgetId: string;
  q2Key: string;
  condition: string;
  embeddingContent: string;
  metadata: {
    widgetName: string;
    widgetType: string;
    question: string;
    q4Value: string;
    captures: string[];
  };
}

/**
 * Extract all widgets from onboarding-flow.json
 */
function extractWidgets(): WidgetToEmbed[] {
  const widgets: WidgetToEmbed[] = [];
  const q3Widgets = onboardingFlow.q3_widgets as Record<
    string,
    WidgetDefinition | string
  >;

  for (const [q2Key, widgetOrComment] of Object.entries(q3Widgets)) {
    if (q2Key.startsWith('_')) continue; // Skip comments
    if (typeof widgetOrComment === 'string') continue; // Skip string values

    const widget = widgetOrComment as WidgetDefinition;

    const condition = widget.condition_picker.suggested;
    const question =
      widget.main_widget.question ||
      (widget.main_widget as { part1?: { question: string } }).part1
        ?.question ||
      '';

    // Create rich embedding content
    const embeddingContent = [
      `Widget: ${widget.name}`,
      `Question: ${question}`,
      `Condition: ${condition}`,
      `Value: ${widget.q4_value}`,
      `Captures: ${widget.captures.join(', ')}`,
      `Type: ${widget.main_widget.type}`,
      `Q2 Option: ${q2Key.replace(/_/g, ' ')}`,
    ].join('. ');

    widgets.push({
      widgetId: widget.id,
      q2Key,
      condition,
      embeddingContent,
      metadata: {
        widgetName: widget.name,
        widgetType: widget.main_widget.type,
        question,
        q4Value: widget.q4_value,
        captures: widget.captures,
      },
    });
  }

  return widgets;
}

/**
 * Generate embeddings for all widgets
 */
async function generateWidgetEmbeddings(
  widgets: WidgetToEmbed[]
): Promise<(WidgetToEmbed & { embedding: number[] })[]> {
  console.log(`Generating embeddings for ${widgets.length} widgets...`);

  // Batch embed all widgets at once for efficiency
  const contents = widgets.map((w) => w.embeddingContent);

  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: contents,
  });

  return widgets.map((widget, i) => ({
    ...widget,
    embedding: embeddings[i],
  }));
}

/**
 * Store all embeddings in Supabase
 */
async function storeEmbeddings(
  widgetsWithEmbeddings: (WidgetToEmbed & { embedding: number[] })[]
): Promise<void> {
  console.log('Storing embeddings in Supabase...');

  const rows = widgetsWithEmbeddings.map((w) => ({
    widget_id: w.widgetId,
    q2_key: w.q2Key,
    condition: w.condition,
    embedding_content: w.embeddingContent,
    embedding: w.embedding,
    widget_name: w.metadata.widgetName,
    widget_type: w.metadata.widgetType,
    question: w.metadata.question,
    q4_value: w.metadata.q4Value,
    captures: w.metadata.captures,
  }));

  // Upsert to handle re-runs
  const { error } = await supabase
    .from('widget_embeddings')
    .upsert(rows, { onConflict: 'widget_id' });

  if (error) {
    throw new Error(`Failed to store embeddings: ${error.message}`);
  }
}

/**
 * Main seeding function
 */
async function seed(): Promise<void> {
  console.log('🌱 Starting widget embedding seed...\n');

  try {
    // 1. Extract widgets
    const widgets = extractWidgets();
    console.log(
      `📦 Extracted ${widgets.length} widgets from onboarding-flow.json`
    );

    // 2. Generate embeddings
    const widgetsWithEmbeddings = await generateWidgetEmbeddings(widgets);
    console.log('✅ Generated embeddings');

    // 3. Store in Supabase
    await storeEmbeddings(widgetsWithEmbeddings);
    console.log('✅ Stored in Supabase');

    // 4. Verify
    const { count, error } = await supabase
      .from('widget_embeddings')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    console.log(`\n🎉 Success! ${count} widgets embedded and stored.`);

    // 5. Test query
    console.log('\n🔍 Testing similarity search...');
    const testQuery =
      'I want to understand my energy levels throughout the day';
    const testEmbedding = await embed({
      model: embeddingModel,
      value: testQuery,
    });

    const { data: testResults, error: testError } = await supabase.rpc(
      'match_widgets',
      {
        query_embedding: testEmbedding.embedding,
        match_threshold: 0.3,
        match_count: 3,
      }
    );

    if (testError) {
      console.log('⚠️ Test query failed:', testError.message);
    } else {
      console.log(`Query: "${testQuery}"`);
      console.log('Top matches:');
      testResults.forEach(
        (
          r: {
            widget_id: string;
            similarity: number;
            metadata: { widgetName: string };
          },
          i: number
        ) => {
          console.log(
            `  ${i + 1}. ${r.metadata.widgetName} (${(r.similarity * 100).toFixed(1)}%)`
          );
        }
      );
    }
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// Run the seed
seed();

'use server';

/**
 * Clue Agent Router
 *
 * Why this exists: Main orchestrator that routes user messages to specialized
 * sub-agents. Uses OpenAI for routing decisions and tool-calling.
 *
 * Architecture:
 * 1. Assemble full message context
 * 2. Route to appropriate sub-agent(s)
 * 3. Execute sub-agents (potentially in parallel)
 * 4. Compose final response with widgets/clues
 */

import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

import { assembleMessageContext } from './context/assembler';
import type {
  AgentState,
  ChatMessage,
  MessageContext,
  RouterDecision,
} from './types';

// Router prompt that decides which sub-agent(s) to invoke
const ROUTER_SYSTEM_PROMPT = `You are Clue, a symptom tracking companion for people with chronic conditions.

Your job is to route user messages to the appropriate specialized agent:
- intake: For logging symptoms, check-ins, capturing structured data from free text
- timeline: For questions about history, "when did this happen", day cards
- trend: For metrics, averages, patterns over time
- insight: For generating clues, correlations, evidence-based observations
- widget_planner: For deciding next actions, what to track, recommendations
- doctor_pack: For generating doctor reports, exports

CONTEXT about this user:
{{context}}

RULES:
1. In low_energy or flare state, minimize follow-up questions
2. When user is logging, route to intake first
3. When user asks "why" or "what's causing", route to insight
4. When user asks about history/timeline, route to timeline
5. When user seems lost, route to widget_planner for next actions
6. Multiple agents can run in parallel when tasks are independent

Respond with JSON:
{
  "primaryAgent": "agent_name",
  "parallelAgents": ["optional", "agents"],
  "reason": "brief explanation"
}`;

/**
 * Routes a message to the appropriate sub-agent(s)
 */
export async function routeMessage(
  message: string,
  context: MessageContext
): Promise<RouterDecision> {
  // For simple, obvious cases, use rules first (no LLM call)
  const quickRoute = quickRouteRules(message, context);
  if (quickRoute) {
    return quickRoute;
  }

  // Otherwise, use LLM routing
  const prompt = ROUTER_SYSTEM_PROMPT.replace(
    '{{context}}',
    formatContextForRouter(context)
  );

  const result = await generateText({
    model: openai('gpt-4o-mini'),
    system: prompt,
    prompt: message,
  });

  try {
    const decision = JSON.parse(result.text) as RouterDecision;
    return decision;
  } catch {
    // Fallback to widget_planner if parsing fails
    return {
      primaryAgent: 'widget_planner',
      reason: 'Routing fallback - could not parse decision',
    };
  }
}

/**
 * Quick routing rules for obvious cases (no LLM call needed)
 */
function quickRouteRules(
  message: string,
  context: MessageContext
): RouterDecision | null {
  const lowerMessage = message.toLowerCase();

  // Logging/check-in keywords → intake
  if (
    lowerMessage.includes('log') ||
    lowerMessage.includes('feeling') ||
    lowerMessage.includes('pain is') ||
    lowerMessage.includes('today') ||
    lowerMessage.includes('/10')
  ) {
    return {
      primaryAgent: 'intake',
      reason: 'Detected logging intent',
    };
  }

  // History keywords → timeline
  if (
    lowerMessage.includes('when did') ||
    lowerMessage.includes('last time') ||
    lowerMessage.includes('history') ||
    lowerMessage.includes('yesterday')
  ) {
    return {
      primaryAgent: 'timeline',
      reason: 'Detected history/timeline query',
    };
  }

  // Doctor/export keywords → doctor_pack
  if (
    lowerMessage.includes('doctor') ||
    lowerMessage.includes('export') ||
    lowerMessage.includes('report') ||
    lowerMessage.includes('appointment')
  ) {
    return {
      primaryAgent: 'doctor_pack',
      reason: 'Detected doctor/export intent',
    };
  }

  // Insight/why keywords → insight
  if (
    lowerMessage.includes('why') ||
    lowerMessage.includes('causing') ||
    lowerMessage.includes('trigger') ||
    lowerMessage.includes('pattern')
  ) {
    return {
      primaryAgent: 'insight',
      parallelAgents: ['trend'],
      reason: 'Detected insight/causation query',
    };
  }

  // Low energy state → minimize interaction
  if (context.agentState.energyState === 'low_energy') {
    return {
      primaryAgent: 'intake',
      reason: 'Low energy mode - minimal baseline capture only',
    };
  }

  return null; // Use LLM routing
}

/**
 * Format context for router prompt
 */
function formatContextForRouter(context: MessageContext): string {
  const parts: string[] = [];

  parts.push(`Mode: ${context.agentState.mode}`);
  parts.push(`Energy: ${context.agentState.energyState}`);

  if (context.focus) {
    parts.push(
      `Focus: "${context.focus.featureLabel} → ${context.focus.outcomeLabel}" (Day ${context.focus.dayCount}/7)`
    );
  }

  if (context.today) {
    parts.push(`Today: ${context.today.isFlare ? 'FLARE' : 'normal'}`);
    parts.push(
      `Completion: ${Math.round(context.today.completionScore * 100)}%`
    );
  }

  if (context.missingFields.fields.length > 0) {
    parts.push(
      `Missing: ${context.missingFields.fields.map((f) => f.fieldLabel).join(', ')}`
    );
  }

  return parts.join('\n');
}

/**
 * Process a full message and return response
 * This is the main entry point for chat interactions
 */
export async function processMessage(
  userMessage: string,
  state: AgentState
): Promise<ChatMessage> {
  // 1. Assemble full context
  const context = await assembleMessageContext(state);

  // 2. Route to appropriate agent(s)
  const routing = await routeMessage(userMessage, context);

  // 3. Execute sub-agent(s)
  // TODO: Implement sub-agent execution
  // For now, return placeholder
  const response: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: `[Routed to ${routing.primaryAgent}${
      routing.parallelAgents?.length
        ? ` + ${routing.parallelAgents.join(', ')}`
        : ''
    }]\n\nReason: ${routing.reason}`,
    timestamp: new Date(),
  };

  return response;
}

'use client';

import { useCallback, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * DoctorSummaryPanel - Generates and displays doctor-friendly health reports
 *
 * Why this exists: Spoonies consistently report that sharing tracked data with
 * doctors is a major pain point. Promoted from a desktop-only right-panel to a
 * full-width standalone view accessible on all screen sizes. Lets users generate
 * structured summaries that clinicians can scan quickly.
 */

type DateRange = '14d' | '30d' | '90d';

export function DoctorSummaryPanel() {
  const [report, setReport] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>('30d');
  const [copied, setCopied] = useState(false);

  const rangeLabels: Record<DateRange, string> = {
    '14d': '2 weeks',
    '30d': '30 days',
    '90d': '3 months',
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setReport(null);

    try {
      const daysBack = selectedRange === '14d' ? 14 : selectedRange === '90d' ? 90 : 30;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              id: 'gen-report',
              role: 'user',
              content: `Generate a doctor summary for the last ${daysBack} days.`,
              parts: [{ type: 'text', text: `Generate a doctor summary for the last ${daysBack} days.` }],
              createdAt: new Date(),
            },
          ],
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error('Failed to generate report');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const event = JSON.parse(payload);
            if (event.type === 'text-delta' && event.delta) {
              fullText += event.delta;
            }
          } catch { /* skip */ }
        }
      }

      setReport(fullText || 'No report data available yet. Start tracking symptoms, medications, and moods to generate a summary.');
    } catch {
      setReport('Unable to generate report. Please try again later.');
    } finally {
      setIsGenerating(false);
    }
  }, [selectedRange]);

  const handleCopy = useCallback(() => {
    if (report) {
      navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [report]);

  return (
    <div className="flex flex-col flex-1 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-primary/6">
        <div className="flex items-center gap-2 mb-1">
          <MaterialIcon name="stethoscope" size="sm" className="text-primary/70" />
          <h2 className="text-[16px] font-semibold text-primary">Doctor Summary</h2>
        </div>
        <p className="text-[12px] text-text-muted leading-relaxed">
          Generate a structured report to share with your healthcare provider.
        </p>
      </div>

      {/* Range selector */}
      <div className="px-6 py-4">
        <p className="text-[11px] font-medium text-text-muted mb-2 uppercase tracking-wider">
          Report Period
        </p>
        <div className="flex gap-2">
          {(Object.keys(rangeLabels) as DateRange[]).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setSelectedRange(range)}
              className={`px-4 py-2 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
                selectedRange === range
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-text-muted hover:bg-gray-200'
              }`}
            >
              {rangeLabels[range]}
            </button>
          ))}
        </div>
      </div>

      {/* Generate button */}
      <div className="px-6 pb-4">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium text-[14px] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <MaterialIcon name="description" size="sm" />
              Generate {rangeLabels[selectedRange]} Report
            </>
          )}
        </button>
      </div>

      {/* Report content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {report ? (
          <div>
            {/* Copy button */}
            <div className="flex justify-end mb-3">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 text-[12px] text-text-muted hover:text-primary transition-colors cursor-pointer"
              >
                <MaterialIcon name={copied ? 'check' : 'content_copy'} size="xs" />
                {copied ? 'Copied' : 'Copy report'}
              </button>
            </div>

            {/* Report text */}
            <div className="prose prose-sm max-w-none text-[13px] text-primary leading-relaxed whitespace-pre-wrap">
              {report}
            </div>
          </div>
        ) : !isGenerating ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mb-4">
              <MaterialIcon name="stethoscope" className="text-primary/30 text-[28px]" />
            </div>
            <p className="text-[14px] text-text-muted mb-1">Nothing here yet.</p>
            <p className="text-[12px] text-text-muted/80 max-w-xs leading-relaxed">
              Pick a date range above when you&apos;re ready. We&apos;ll pull together a clean
              summary you can hand to your clinician — no need to re-tell the story.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

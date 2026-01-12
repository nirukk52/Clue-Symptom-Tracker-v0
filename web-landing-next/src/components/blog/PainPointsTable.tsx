'use client';

import { useState } from 'react';

import { citations, painPointsTable } from '@/content/blog/spoonies-data';

/**
 * PainPointsTable - Interactive table showing pain points and solutions
 *
 * Why this exists: Presents the research findings in a scannable,
 * interactive format. Mobile-friendly with expandable cards.
 */

function Cite({ n }: { n: string }) {
  const cite = citations[n];
  if (!cite) return <sup className="text-accent-purple">[{n}]</sup>;
  return (
    <a
      href={cite.url}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 inline-flex items-center justify-center rounded px-1 py-0.5 text-[10px] font-semibold no-underline transition-colors"
      title={cite.text}
    >
      [{n}]
    </a>
  );
}

export function PainPointsTable() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {/* Desktop Table */}
      <div className="border-primary/10 hidden overflow-hidden rounded-2xl border bg-white lg:block">
        <table className="w-full text-left">
          <thead className="bg-primary/5">
            <tr>
              <th className="text-primary px-6 py-4 text-sm font-semibold">
                Pain Point / Struggle
              </th>
              <th className="text-primary px-6 py-4 text-sm font-semibold">
                Desired Feature or Solution
              </th>
            </tr>
          </thead>
          <tbody className="divide-primary/5 divide-y">
            {painPointsTable.map((row, index) => (
              <tr
                key={index}
                className="hover:bg-primary/[0.02] transition-colors"
              >
                <td className="w-1/2 px-6 py-4 align-top">
                  <p className="text-text-muted text-sm leading-relaxed">
                    <strong className="text-primary">
                      {row.painPoint.split('(')[0]}
                    </strong>
                    {row.painPoint.includes('(') && (
                      <span className="text-text-muted/70">
                        ({row.painPoint.split('(')[1]}
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {row.citations.map((c) => (
                      <Cite key={c} n={c} />
                    ))}
                  </div>
                </td>
                <td className="w-1/2 px-6 py-4 align-top">
                  <p className="text-text-muted text-sm leading-relaxed">
                    {row.solution}
                  </p>
                  {row.solutionCitations.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {row.solutionCitations.map((c) => (
                        <Cite key={c} n={c} />
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="space-y-3 lg:hidden">
        {painPointsTable.map((row, index) => (
          <div
            key={index}
            className="border-primary/10 overflow-hidden rounded-xl border bg-white"
          >
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="flex w-full items-start justify-between gap-3 px-5 py-4 text-left"
            >
              <div>
                <p className="text-primary text-sm font-medium leading-tight">
                  {row.painPoint.split('(')[0].trim()}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {row.citations.slice(0, 2).map((c) => (
                    <Cite key={c} n={c} />
                  ))}
                  {row.citations.length > 2 && (
                    <span className="text-text-muted text-xs">
                      +{row.citations.length - 2}
                    </span>
                  )}
                </div>
              </div>
              <span
                className={`text-primary transition-transform ${
                  expandedIndex === index ? 'rotate-180' : ''
                }`}
              >
                ↓
              </span>
            </button>

            {expandedIndex === index && (
              <div className="border-primary/5 border-t px-5 pb-4 pt-0">
                <p className="text-text-muted/70 mb-2 text-xs">
                  {row.painPoint.includes('(') &&
                    `(${row.painPoint.split('(')[1]}`}
                </p>
                <div className="bg-accent-mint/10 rounded-lg p-4">
                  <p className="text-primary mb-1 text-xs font-semibold">
                    Solution:
                  </p>
                  <p className="text-text-muted text-sm leading-relaxed">
                    {row.solution}
                  </p>
                  {row.solutionCitations.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {row.solutionCitations.map((c) => (
                        <Cite key={c} n={c} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

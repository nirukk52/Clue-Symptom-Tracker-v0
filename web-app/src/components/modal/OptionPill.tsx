'use client';

/**
 * OptionPill - Selectable option in modal questions
 *
 * Why this exists: Reusable pill component for Q1-Q4 options
 * with hover and selected states.
 *
 * Design:
 * - Q1: Short label (bold) + description (muted subtext)
 * - Q2+: Long descriptive label only
 * - NO EMOJIS (per frontend-design skill)
 */

interface OptionPillProps {
  label: string;
  /** Optional description shown below label (used in Q1) */
  description?: string;
  value: string;
  isSelected: boolean;
  onSelect: (value: string, label: string) => void;
}

export function OptionPill({
  label,
  description,
  value,
  isSelected,
  onSelect,
}: OptionPillProps) {
  const hasDescription = Boolean(description);

  return (
    <button
      type="button"
      className={`option-pill ${isSelected ? 'selected' : ''} ${hasDescription ? 'with-description' : ''}`}
      onClick={() => onSelect(value, label)}
    >
      <div className="option-pill-text">
        <span className="option-pill-label">{label}</span>
        {hasDescription && (
          <span className="option-pill-description">{description}</span>
        )}
      </div>
    </button>
  );
}

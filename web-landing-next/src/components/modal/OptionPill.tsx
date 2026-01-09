'use client';

/**
 * OptionPill - Selectable option in modal questions
 *
 * Why this exists: Reusable pill component for Q1-Q4 options
 * with hover and selected states.
 */

interface OptionPillProps {
  label: string;
  value: string;
  isSelected: boolean;
  onSelect: (value: string) => void;
}

export function OptionPill({ label, value, isSelected, onSelect }: OptionPillProps) {
  return (
    <button
      type="button"
      className={`option-pill ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(value)}
    >
      {label}
    </button>
  );
}

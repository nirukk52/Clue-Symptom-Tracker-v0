'use client';

/**
 * ConditionPills - Glassmorphic condition tags on hero
 *
 * Why this exists: Shows relevant chronic conditions with hover effects.
 * Extracted from hero HTML that was duplicated across pages.
 */

interface ConditionPillsProps {
  conditions: string[];
  className?: string;
}

export function ConditionPills({ conditions, className = '' }: ConditionPillsProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {conditions.map((condition) => (
        <span key={condition} className="condition-pill">
          {condition}
        </span>
      ))}
    </div>
  );
}

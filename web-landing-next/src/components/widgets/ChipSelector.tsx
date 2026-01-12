'use client';

/**
 * ChipSelector - Single or multi-select chip group
 *
 * Why this exists: Low-effort selection for triggers, symptoms, etc.
 * Taps are easier than typing, especially with brain fog.
 *
 * Design Philosophy:
 * - Large touch targets (min 48px height)
 * - Clear selected state with accent-purple
 * - Wraps naturally on small screens
 * - NO EMOJIS (per frontend-design skill)
 */

interface ChipOption {
  value: string;
  label: string;
}

interface ChipSelectorProps {
  /** Question shown above chips */
  label: string;
  /** Optional instruction text */
  instruction?: string;
  /** Available options */
  options: ChipOption[];
  /** Currently selected value(s) */
  selected: string | string[];
  /** Callback when selection changes */
  onChange: (selected: string | string[]) => void;
  /** Allow multiple selections */
  allowMultiple?: boolean;
  /** Maximum selections (for multi-select) */
  maxSelect?: number;
}

export function ChipSelector({
  label,
  instruction,
  options,
  selected,
  onChange,
  allowMultiple = false,
  maxSelect,
}: ChipSelectorProps) {
  const selectedArray = Array.isArray(selected) ? selected : [selected];

  const handleSelect = (value: string) => {
    if (allowMultiple) {
      const isSelected = selectedArray.includes(value);

      if (isSelected) {
        // Deselect
        onChange(selectedArray.filter((v) => v !== value));
      } else {
        // Select (check max)
        if (maxSelect && selectedArray.length >= maxSelect) {
          return; // At max
        }
        onChange([...selectedArray, value]);
      }
    } else {
      // Single select
      onChange(value);
    }
  };

  return (
    <div className="chip-selector-container">
      <label className="chip-selector-label">{label}</label>
      {instruction && (
        <p className="chip-selector-instruction">{instruction}</p>
      )}

      <div className="chip-selector-grid">
        {options.map((option) => {
          const isSelected = selectedArray.includes(option.value);

          return (
            <button
              key={option.value}
              type="button"
              className={`chip-selector-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

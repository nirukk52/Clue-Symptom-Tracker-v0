'use client';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * QuickEntryPickerOption represents one selectable row in the curated add/edit
 * sheets used by the Bearable-style quick-entry cards.
 */
export interface QuickEntryPickerOption {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  selected?: boolean;
}

interface QuickEntryPickerSheetProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  options: QuickEntryPickerOption[];
  onClose: () => void;
  onToggle: (optionId: string) => void;
}

/**
 * QuickEntryPickerSheet provides one consistent bottom-sheet pattern for
 * revealing hidden curated categories, factors, and metrics.
 */
export function QuickEntryPickerSheet({
  isOpen,
  title,
  subtitle,
  options,
  onClose,
  onToggle,
}: QuickEntryPickerSheetProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-primary/35 backdrop-blur-sm sm:items-center">
      <div
        className="absolute inset-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div className="relative z-10 flex max-h-[88dvh] w-full max-w-xl flex-col overflow-hidden rounded-t-[28px] border border-primary/10 bg-[#1f1f23] text-white shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4 border-b border-white/8 px-5 py-4">
          <div>
            <p className="text-[17px] font-semibold tracking-tight">{title}</p>
            {subtitle ? (
              <p className="mt-1 text-[12px] leading-relaxed text-white/65">{subtitle}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/6 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label={`Close ${title}`}
          >
            <MaterialIcon name="close" size="sm" />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4">
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggle(option.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                  option.selected
                    ? 'border-accent-mint/60 bg-accent-mint/15'
                    : 'border-white/8 bg-white/4 hover:border-white/16 hover:bg-white/7'
                }`}
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/8 text-accent-mint">
                  <MaterialIcon name={option.icon || 'add_circle'} size="sm" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium text-white">{option.label}</span>
                  {option.description ? (
                    <span className="mt-1 block text-[12px] leading-relaxed text-white/60">
                      {option.description}
                    </span>
                  ) : null}
                </span>
                <span
                  className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                    option.selected
                      ? 'border-accent-mint bg-accent-mint text-primary'
                      : 'border-white/20 text-transparent'
                  }`}
                >
                  <MaterialIcon name="check" size="xs" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

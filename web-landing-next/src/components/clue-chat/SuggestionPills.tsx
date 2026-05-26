import type { ChatSuggestionOption } from './types';

interface SuggestionPillsProps {
  options: ChatSuggestionOption[];
  disabled?: boolean;
  onSelect: (option: ChatSuggestionOption) => void;
}

/**
 * SuggestionPills keeps ranked follow-up prompts visually lightweight so Clue
 * can surface likely next logging paths without interrupting the chat flow.
 */
export function SuggestionPills({ options, disabled = false, onSelect }: SuggestionPillsProps) {
  return (
    <div className="w-full max-w-[92%] rounded-2xl border border-primary/10 bg-white/80 p-3 shadow-sm backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-text-muted">
        Suggested Next Logs
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(option)}
            className="rounded-full border border-primary/15 bg-bg-cream px-3 py-2 text-left text-[13px] font-medium text-primary transition hover:border-primary/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

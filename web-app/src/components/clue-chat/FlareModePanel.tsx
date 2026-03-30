'use client';

import { useCallback, useEffect, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * FlareModePanel - Modal overlay for ultra-minimal logging on bad days
 *
 * Why this exists: During flares, every tap costs a "spoon". Promoted from
 * a desktop-only right-panel to a modal so it is accessible on all screen sizes.
 * Provides the absolute minimum interface: one-tap severity, optional one-line note.
 * Large touch targets, muted colors, zero cognitive load.
 */

type FlareLevel = 'mild' | 'moderate' | 'severe';

interface FlareModeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FlareModePanel({ isOpen, onClose }: FlareModeProps) {
  const [selectedLevel, setSelectedLevel] = useState<FlareLevel | null>(null);
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [flareActive, setFlareActive] = useState(false);

  const severityMap: Record<FlareLevel, { label: string; severity: number; color: string; bg: string; border: string }> = {
    mild: { label: 'Mild', severity: 3, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    moderate: { label: 'Moderate', severity: 6, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    severe: { label: 'Severe', severity: 9, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  };

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleSave = useCallback(async () => {
    if (!selectedLevel) return;
    setIsSaving(true);
    setSaved(false);

    try {
      const level = severityMap[selectedLevel];
      const message = `I'm having a ${selectedLevel} flare day. Severity ${level.severity}/10.${note.trim() ? ` ${note.trim()}` : ''}`;

      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id: `flare-${Date.now()}`,
            role: 'user',
            content: message,
            parts: [{ type: 'text', text: message }],
            createdAt: new Date(),
          }],
        }),
      });

      setSaved(true);
      setFlareActive(true);
      setSelectedLevel(null);
      setNote('');
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1800);
    } catch {
      console.error('Flare entry save failed');
    } finally {
      setIsSaving(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLevel, note, onClose]);

  const handleDeactivate = useCallback(async () => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id: `flare-off-${Date.now()}`,
            role: 'user',
            content: "I'm feeling better, deactivate flare mode.",
            parts: [{ type: 'text', text: "I'm feeling better, deactivate flare mode." }],
            createdAt: new Date(),
          }],
        }),
      });
      setFlareActive(false);
    } catch {
      console.error('Flare deactivation failed');
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-primary/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal panel — bottom-sheet on mobile, centered card on sm+ */}
      <div className="relative z-10 w-full sm:max-w-sm bg-white sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-primary/6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <MaterialIcon name="local_fire_department" size="sm" className="text-red-400/70" />
              <h2 className="text-[16px] font-semibold text-primary">Flare Mode</h2>
            </div>
            <p className="text-[12px] text-text-muted mt-0.5">Minimal logging for tough days. One tap is enough.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
            aria-label="Close"
          >
            <MaterialIcon name="close" size="sm" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto flex flex-col items-center px-5 py-6 gap-5">
          {saved && (
            <div className="py-3 px-4 bg-teal-50 border border-teal-200 rounded-xl text-[13px] text-teal-700 text-center font-medium w-full">
              Logged. Take care of yourself.
            </div>
          )}

          {flareActive && !saved && (
            <div className="py-3 px-4 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-700 text-center w-full">
              <p className="font-medium mb-2">Flare mode is active</p>
              <p className="text-[11px] mb-3">I&apos;ll keep things minimal until you&apos;re ready.</p>
              <button
                type="button"
                onClick={handleDeactivate}
                className="text-[12px] underline cursor-pointer hover:text-amber-900 transition-colors"
              >
                I&apos;m feeling better — exit flare mode
              </button>
            </div>
          )}

          {/* Severity buttons - large tap targets */}
          <div className="w-full">
            <p className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-3 text-center">
              How bad is it?
            </p>
            <div className="flex flex-col gap-3">
              {(Object.keys(severityMap) as FlareLevel[]).map((level) => {
                const config = severityMap[level];
                const isSelected = selectedLevel === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSelectedLevel(isSelected ? null : level)}
                    className={`py-5 px-6 rounded-2xl text-[16px] font-semibold transition-all cursor-pointer border-2 ${
                      isSelected
                        ? `${config.bg} ${config.border} ${config.color} shadow-sm`
                        : 'bg-gray-50 border-gray-200 text-text-muted hover:bg-gray-100'
                    }`}
                  >
                    {config.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Optional note */}
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One line if you want (optional)"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-primary placeholder:text-gray-400 focus:outline-none focus:border-primary/30"
          />

          {/* Save button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={!selectedLevel || isSaving}
            className="w-full py-4 px-4 bg-primary text-white rounded-2xl font-medium text-[15px] hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {isSaving ? 'Saving...' : 'Log & Rest'}
          </button>
        </div>
      </div>
    </div>
  );
}

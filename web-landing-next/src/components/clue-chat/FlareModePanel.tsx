'use client';

import { useCallback, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * FlareModePanel - Ultra-minimal logging for bad days
 *
 * Why this exists: During flares, every tap costs a "spoon". This panel
 * provides the absolute minimum interface: one-tap severity, optional
 * one-line note. Large touch targets, muted colors, zero cognitive load.
 * Captures data even on the worst days.
 */

type FlareLevel = 'mild' | 'moderate' | 'severe';

export function FlareModePanel() {
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
          messages: [
            {
              id: `flare-${Date.now()}`,
              role: 'user',
              content: message,
              parts: [{ type: 'text', text: message }],
              createdAt: new Date(),
            },
          ],
        }),
      });

      setSaved(true);
      setFlareActive(true);
      setSelectedLevel(null);
      setNote('');
      setTimeout(() => setSaved(false), 3000);
    } catch {
      console.error('Flare entry save failed');
    } finally {
      setIsSaving(false);
    }
  }, [selectedLevel, note]);

  const handleDeactivate = useCallback(async () => {
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              id: `flare-off-${Date.now()}`,
              role: 'user',
              content: 'I\'m feeling better, deactivate flare mode.',
              parts: [{ type: 'text', text: 'I\'m feeling better, deactivate flare mode.' }],
              createdAt: new Date(),
            },
          ],
        }),
      });
      setFlareActive(false);
    } catch {
      console.error('Flare deactivation failed');
    }
  }, []);

  return (
    <div className="hidden lg:flex flex-col flex-1 bg-white border-l border-primary/6 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-primary/6">
        <div className="flex items-center gap-2 mb-1">
          <MaterialIcon name="local_fire_department" size="sm" className="text-red-400/70" />
          <h2 className="text-[16px] font-semibold text-primary">Flare Mode</h2>
        </div>
        <p className="text-[12px] text-text-muted leading-relaxed">
          Minimal logging for tough days. One tap is enough.
        </p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-6">
        {saved && (
          <div className="py-3 px-4 bg-teal-50 border border-teal-200 rounded-xl text-[13px] text-teal-700 text-center font-medium w-full max-w-xs">
            Logged. Take care of yourself.
          </div>
        )}

        {flareActive && !saved && (
          <div className="py-3 px-4 bg-amber-50 border border-amber-200 rounded-xl text-[13px] text-amber-700 text-center w-full max-w-xs">
            <p className="font-medium mb-2">Flare mode is active</p>
            <p className="text-[11px] mb-3">I&apos;ll keep things minimal until you&apos;re ready.</p>
            <button
              type="button"
              onClick={handleDeactivate}
              className="text-[12px] underline cursor-pointer hover:text-amber-900 transition-colors"
            >
              I&apos;m feeling better -- exit flare mode
            </button>
          </div>
        )}

        {/* Severity buttons - large tap targets */}
        <div className="w-full max-w-xs">
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
        <div className="w-full max-w-xs">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="One line if you want (optional)"
            maxLength={100}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-[13px] text-primary placeholder:text-gray-400 focus:outline-none focus:border-primary/30"
          />
        </div>

        {/* Save button */}
        <button
          type="button"
          onClick={handleSave}
          disabled={!selectedLevel || isSaving}
          className="w-full max-w-xs py-4 px-4 bg-primary text-white rounded-2xl font-medium text-[15px] hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {isSaving ? 'Saving...' : 'Log & Rest'}
        </button>
      </div>
    </div>
  );
}

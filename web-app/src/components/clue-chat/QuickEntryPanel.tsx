'use client';

import { useCallback, useEffect, useState } from 'react';

import { MaterialIcon } from '@/components/ui/MaterialIcon';

/**
 * QuickEntryPanel - Modal overlay for rapid symptom logging
 *
 * Why this exists: Spoonies need a low-effort alternative to chatting.
 * Promoted from a desktop-only right-panel to a modal so it is accessible
 * on all screen sizes. Logs multiple data points in one batch.
 * Captures a day snapshot in under 30 seconds.
 */

interface QuickEntryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickEntryPanel({ isOpen, onClose }: QuickEntryPanelProps) {
  const [severity, setSeverity] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [medsTaken, setMedsTaken] = useState<boolean | null>(null);
  const [isFlare, setIsFlare] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  const handleSubmit = useCallback(async () => {
    setIsSaving(true);
    setSaved(false);

    try {
      const entries: Array<{ role: string; content: string }> = [];

      if (severity !== null) {
        entries.push({ role: 'user', content: `Log my overall symptom severity as ${severity}/10 today.` });
      }
      if (mood !== null) {
        entries.push({ role: 'user', content: `Log my mood as ${mood}/10.` });
      }
      if (sleepQuality !== null) {
        entries.push({ role: 'user', content: `Log my sleep quality as ${sleepQuality}/10.` });
      }
      if (medsTaken !== null) {
        entries.push({ role: 'user', content: medsTaken ? 'I took my medications today.' : 'I skipped my medications today.' });
      }
      if (isFlare) {
        entries.push({ role: 'user', content: 'Today is a flare day.' });
      }
      if (notes.trim()) {
        entries.push({ role: 'user', content: `Quick note: ${notes.trim()}` });
      }

      if (entries.length === 0) return;

      for (const entry of entries) {
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              id: `quick-${Date.now()}-${Math.random()}`,
              role: entry.role,
              content: entry.content,
              parts: [{ type: 'text', text: entry.content }],
              createdAt: new Date(),
            }],
          }),
        });
      }

      setSaved(true);
      setSeverity(null);
      setMood(null);
      setSleepQuality(null);
      setMedsTaken(null);
      setIsFlare(false);
      setNotes('');
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1500);
    } catch {
      console.error('Quick entry save failed');
    } finally {
      setIsSaving(false);
    }
  }, [severity, mood, sleepQuality, medsTaken, isFlare, notes, onClose]);

  const hasAnyInput =
    severity !== null ||
    mood !== null ||
    sleepQuality !== null ||
    medsTaken !== null ||
    isFlare ||
    notes.trim().length > 0;

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
      <div className="relative z-10 w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-primary/6 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <MaterialIcon name="add_circle" size="sm" className="text-primary/70" />
              <h2 className="text-[16px] font-semibold text-primary">Quick Entry</h2>
            </div>
            <p className="text-[12px] text-text-muted mt-0.5">Log your day in under 30 seconds.</p>
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

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5">
          {/* Symptom severity */}
          <div>
            <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 block">
              Overall Severity
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSeverity(severity === n ? null : n)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    severity === n
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Mood */}
          <div>
            <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 block">
              Mood
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMood(mood === n ? null : n)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    mood === n
                      ? 'bg-violet-500 text-white shadow-sm'
                      : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Sleep quality */}
          <div>
            <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 block">
              Sleep Quality
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setSleepQuality(sleepQuality === n ? null : n)}
                  className={`w-8 h-8 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    sleepQuality === n
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-gray-100 text-text-muted hover:bg-gray-200'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Meds taken */}
          <div>
            <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 block">
              Medications
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setMedsTaken(medsTaken === true ? null : true)}
                className={`flex-1 py-3 rounded-xl text-[13px] font-medium transition-all cursor-pointer border ${
                  medsTaken === true
                    ? 'bg-teal-50 border-teal-200 text-teal-700'
                    : 'bg-gray-50 border-gray-200 text-text-muted hover:bg-gray-100'
                }`}
              >
                Taken
              </button>
              <button
                type="button"
                onClick={() => setMedsTaken(medsTaken === false ? null : false)}
                className={`flex-1 py-3 rounded-xl text-[13px] font-medium transition-all cursor-pointer border ${
                  medsTaken === false
                    ? 'bg-amber-50 border-amber-200 text-amber-700'
                    : 'bg-gray-50 border-gray-200 text-text-muted hover:bg-gray-100'
                }`}
              >
                Skipped
              </button>
            </div>
          </div>

          {/* Flare toggle */}
          <div>
            <button
              type="button"
              onClick={() => setIsFlare(!isFlare)}
              className={`w-full py-3 rounded-xl text-[13px] font-medium transition-all cursor-pointer border flex items-center justify-center gap-2 ${
                isFlare
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : 'bg-gray-50 border-gray-200 text-text-muted hover:bg-gray-100'
              }`}
            >
              <MaterialIcon name="local_fire_department" size="sm" />
              {isFlare ? 'Flare day (active)' : 'Mark as flare day'}
            </button>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[12px] font-medium text-text-muted uppercase tracking-wider mb-2 block">
              Quick Note (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth remembering today..."
              maxLength={200}
              rows={2}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 text-[13px] text-primary placeholder:text-gray-400 resize-none focus:outline-none focus:border-primary/30"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-primary/6 shrink-0">
          {saved && (
            <div className="mb-3 py-2 px-3 bg-teal-50 border border-teal-200 rounded-lg text-[12px] text-teal-700 text-center font-medium">
              Saved successfully
            </div>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasAnyInput || isSaving}
            className="w-full py-3 px-4 bg-primary text-white rounded-xl font-medium text-[14px] hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <>
                <MaterialIcon name="progress_activity" size="sm" className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <MaterialIcon name="check" size="sm" />
                Log Entry
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

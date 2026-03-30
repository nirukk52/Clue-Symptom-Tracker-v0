'use client';

/**
 * ChatCanvas - Blank canvas panel for ClueChat desktop view
 *
 * Why this exists: On desktop, the chat interface has a two-panel layout
 * with the chat on the left and a canvas/whiteboard area on the right.
 * This matches the aicofounder.com design. Canvas is blank for now as
 * per user requirement.
 */

export function ChatCanvas() {
  return (
    <div className="hidden lg:flex flex-1 bg-[#f5f3f0] relative overflow-hidden">
      {/* Dotted grid background pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(32, 19, 46, 0.08) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />
    </div>
  );
}

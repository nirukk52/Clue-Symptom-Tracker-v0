import { ClueChat } from '@/components/clue-chat';

/**
 * Chat Page - Full-page ClueChat experience
 *
 * Why this exists: This is the main product experience for Chronic Life.
 * Users arrive here from any CTA click instead of the previous onboarding flow.
 * The conversational interface replaces the modal-based onboarding.
 */

export const metadata = {
  title: 'Chronic Life Chat',
  description: 'Track symptoms, discover patterns, manage your chronic condition.',
};

export default function ChatPage() {
  return <ClueChat />;
}

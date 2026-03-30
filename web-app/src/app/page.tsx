import { redirect } from 'next/navigation';

/**
 * Root Page
 *
 * Why this exists: Redirects to the main Clue chat interface.
 * Landing pages have been removed as part of architecture cleanup.
 */

export default function RootPage() {
  redirect('/chat');
}

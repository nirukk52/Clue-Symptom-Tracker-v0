import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client - Singleton for browser-side usage
 *
 * Why this exists: Centralizes Supabase configuration that was previously
 * duplicated in every HTML file's tracking script.
 */

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://zvpudxinbcsrfyojrhhv.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2cHVkeGluYmNzcmZ5b2pyaGh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5NTE3MjksImV4cCI6MjA4MjUyNzcyOX0.5vV65qusPzu7847VxbiodRU0DZG1AryUuoklX3qFAWk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

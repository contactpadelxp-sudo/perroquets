// Re-export browser client as default for client components
// This is used by all client-side pages and components
export { createSupabaseBrowser as createSupabase } from './supabase-browser';

import { createBrowserClient } from '@supabase/ssr';

// Legacy export for existing code — singleton browser client
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

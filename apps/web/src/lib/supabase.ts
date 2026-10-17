import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key);

// Without env the app still boots (shows a setup notice) instead of crashing at import time.
export const supabase = createClient(url ?? 'http://localhost:54321', key ?? 'missing-key', {
  db: { schema: 'manhunt' },
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  realtime: { params: { eventsPerSecond: 10 } },
});

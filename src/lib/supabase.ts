import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://phlcojlzujlkktwusmku.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobGNvamx6dWpsa2t0d3VzbWt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0MjY2MzAsImV4cCI6MjA5MjAwMjYzMH0.rnPGDCClwzirFOZfHB6nOXb9Cq7b34L_vBWD6_mf5LQ';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

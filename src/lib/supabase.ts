import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate if environment variables are properly configured with real (non-placeholder) credentials
export const isSupabaseConfigured: boolean =
  Boolean(supabaseUrl) &&
  Boolean(supabaseAnonKey) &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project.supabase.co') &&
  !supabaseUrl.includes('placeholder.supabase.co') &&
  supabaseAnonKey.length > 20 &&
  !supabaseAnonKey.includes('your-anon-key');

if (!isSupabaseConfigured) {
  console.info(
    'ℹ️ Supabase credentials not set or contain placeholders in environment. Platform running in high-availability hybrid mode with local storage sync.'
  );
}

// Initialize Supabase client
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

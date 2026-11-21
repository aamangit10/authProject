/**
 * DomainGuard — Supabase Configuration Module
 * 
 * Securely loads Supabase credentials from environment variables.
 * Never hardcodes secrets or API keys in source code.
 */

export interface SupabaseConfig {
  url?: string;
  anonKey?: string;
  allowedDomain: string;
}

export const supabaseConfig: SupabaseConfig = {
  url: process.env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  allowedDomain: process.env.EXPO_PUBLIC_ALLOWED_DOMAIN || 'hbplus.fit',
};

/**
 * Checks if a real, valid Supabase configuration is provided via environment variables.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseConfig.url &&
    supabaseConfig.url !== 'https://your-project-id.supabase.co' &&
    supabaseConfig.anonKey &&
    supabaseConfig.anonKey !== 'your_supabase_anon_key_here'
  );
}

export function getMissingSupabaseKeys(): string[] {
  const missing: string[] = [];
  if (!supabaseConfig.url || supabaseConfig.url === 'https://your-project-id.supabase.co') {
    missing.push('EXPO_PUBLIC_SUPABASE_URL');
  }
  if (!supabaseConfig.anonKey || supabaseConfig.anonKey === 'your_supabase_anon_key_here') {
    missing.push('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }
  return missing;
}

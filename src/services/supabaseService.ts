import { createClient, SupabaseClient, User as SupabaseUser } from '@supabase/supabase-js';
import { supabaseConfig, isSupabaseConfigured } from '../config/supabaseConfig';
import { UserProfile, UserRole } from '../types';
import { normalizeEmail, extractDomain } from '../utils/domainValidation';

let supabaseClient: SupabaseClient | null = null;

const DEFAULT_BOOTSTRAP_ADMINS = ['aman@hbplus.fit', 'admin@hbplus.fit'];

/**
 * Initializes and returns the Supabase client instance.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseClient && isSupabaseConfigured() && supabaseConfig.url && supabaseConfig.anonKey) {
    supabaseClient = createClient(supabaseConfig.url, supabaseConfig.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return supabaseClient;
}

/**
 * Creates or updates user record in Supabase under public.profiles.
 * Retrieves the stored role or assigns the default role based on verified enterprise configuration.
 */
export async function syncUserProfileToSupabase(
  sbUser: SupabaseUser,
  verifiedEmail: string
): Promise<UserProfile> {
  const supabase = getSupabase();
  const normalized = normalizeEmail(verifiedEmail);
  const domain = extractDomain(normalized) || 'hbplus.fit';
  const now = new Date().toISOString();

  let role: UserRole = DEFAULT_BOOTSTRAP_ADMINS.includes(normalized) ? 'admin' : 'user';

  const metadata = sbUser.user_metadata || {};
  const displayName = metadata.full_name || metadata.name || normalized.split('@')[0];
  const photoURL = metadata.avatar_url || metadata.picture || null;

  if (supabase) {
    try {
      // 1. Check existing profile for assigned role
      const { data: existingProfile, error: fetchErr } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', sbUser.id)
        .maybeSingle();

      if (existingProfile && (existingProfile.role === 'admin' || existingProfile.role === 'user')) {
        role = existingProfile.role as UserRole;
      }

      // 2. Upsert profile with latest login timestamp
      const { error: upsertErr } = await supabase
        .from('profiles')
        .upsert({
          id: sbUser.id,
          email: normalized,
          display_name: displayName,
          photo_url: photoURL,
          role,
          domain,
          last_login_at: now,
        });

      if (upsertErr) {
        console.warn('[DomainGuard] Supabase profiles upsert notice:', upsertErr.message);
      }

      // 3. Write immutable audit log
      try {
        await supabase.from('audit_logs').insert({
          user_id: sbUser.id,
          email: normalized,
          action: 'SSO_LOGIN_SUCCESS',
          domain,
          status: 'SUCCESS',
          timestamp: now,
        });
      } catch (auditErr) {
        console.warn('[DomainGuard] Could not write audit log:', auditErr);
      }
    } catch (err) {
      console.warn('[DomainGuard] Supabase sync error (using local profile):', err);
    }
  }

  return {
    uid: sbUser.id,
    email: normalized,
    displayName,
    photoURL,
    emailVerified: Boolean(sbUser.email_confirmed_at || metadata.email_verified),
    role,
    domain,
    lastLoginAt: now,
    providerId: sbUser.app_metadata?.provider || 'google',
  };
}

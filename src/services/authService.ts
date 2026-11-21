import { Platform } from 'react-native';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { getSupabase, syncUserProfileToSupabase } from './supabaseService';
import { isSupabaseConfigured } from '../config/supabaseConfig';
import { UserProfile, RejectionDetails, UserRole } from '../types';
import { 
  validateVerifiedGoogleAccount, 
  normalizeEmail, 
  extractDomain, 
  ALLOWED_DOMAIN 
} from '../utils/domainValidation';

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  rejection?: RejectionDetails;
}

/**
 * Initiates Google OAuth sign-in flow via Supabase Auth.
 * Allows account selection so any Google account can be authenticated,
 * and our security boundary enforces that ONLY @hbplus.fit is authorized.
 */
export async function authenticateWithGoogle(): Promise<AuthResult> {
  const supabase = getSupabase();

  if (!isSupabaseConfigured() || !supabase) {
    throw new Error(
      'Supabase is not configured. Please add your SUPABASE_URL and SUPABASE_ANON_KEY to .env (see .env.example).'
    );
  }

  try {
    const redirectTo = Platform.OS === 'web' && typeof window !== 'undefined'
      ? window.location.origin
      : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        queryParams: {
          prompt: 'select_account',
        },
        redirectTo,
      },
    });

    if (error) {
      return {
        success: false,
        rejection: {
          reason: 'SUPABASE_ERROR',
          message: error.message || 'An error occurred during Google authentication.',
          timestamp: new Date().toISOString(),
        },
      };
    }

    return {
      success: true,
    };
  } catch (err: any) {
    return {
      success: false,
      rejection: {
        reason: 'SUPABASE_ERROR',
        message: err.message || 'An unexpected error occurred during Google authentication.',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Validates the authenticated Supabase user against the strict company domain boundary.
 * If the user's email is not from @hbplus.fit, access is rejected immediately and the user is signed out.
 */
export async function processAuthenticatedUser(sbUser: SupabaseUser): Promise<AuthResult> {
  const supabase = getSupabase();
  const rawEmail = sbUser.email;
  const isVerified = Boolean(
    sbUser.email_confirmed_at || 
    sbUser.user_metadata?.email_verified ||
    sbUser.app_metadata?.provider === 'google'
  );

  const validation = validateVerifiedGoogleAccount({
    email: rawEmail,
    emailVerified: isVerified,
  });

  if (!validation.isValid) {
    // SECURITY BOUNDARY: Immediately terminate Supabase session for rejected accounts
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (signOutErr) {
        console.warn('[DomainGuard] Error clearing unauthorized session:', signOutErr);
      }
    }

    const domain = extractDomain(rawEmail) || 'unknown';
    const reason = !isVerified ? 'UNVERIFIED_EMAIL' : 'UNAUTHORIZED_DOMAIN';

    return {
      success: false,
      rejection: {
        email: rawEmail || undefined,
        domain,
        reason,
        message: validation.error || 'Access restricted. Please login using your official domain email.',
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Allowed domain: synchronize profile with Supabase public.profiles
  const profile = await syncUserProfileToSupabase(sbUser, validation.normalizedEmail);

  return {
    success: true,
    user: profile,
  };
}

/**
 * Securely signs out the user from Supabase and clears session state.
 */
export async function signOutUser(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
}

/**
 * Generates a verified test user profile for offline / mock testing mode.
 * Strictly checks the domain using the exact same domainValidation algorithm!
 */
export function createVerifiedTestProfile(
  rawEmail: string,
  displayName?: string
): AuthResult {
  const normalized = normalizeEmail(rawEmail);
  const domain = extractDomain(normalized) || 'unknown';

  const validation = validateVerifiedGoogleAccount({
    email: normalized,
    emailVerified: true,
  });

  if (!validation.isValid) {
    return {
      success: false,
      rejection: {
        email: normalized,
        domain,
        reason: 'UNAUTHORIZED_DOMAIN',
        message: validation.error || 'Access restricted. Please login using your official domain email.',
        timestamp: new Date().toISOString(),
      },
    };
  }

  const role: UserRole = normalized === 'aman@hbplus.fit' || normalized === 'admin@hbplus.fit' ? 'admin' : 'user';

  return {
    success: true,
    user: {
      uid: `test-${Date.now()}`,
      email: normalized,
      displayName: displayName || normalized.split('@')[0],
      photoURL: null,
      emailVerified: true,
      role,
      domain: ALLOWED_DOMAIN,
      lastLoginAt: new Date().toISOString(),
      providerId: 'google.com (simulated)',
    },
  };
}

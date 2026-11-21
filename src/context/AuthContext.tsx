import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { 
  UserProfile, 
  AuthStatus, 
  RejectionDetails, 
  AuthContextType 
} from '../types';
import { 
  authenticateWithGoogle, 
  signOutUser, 
  processAuthenticatedUser, 
  createVerifiedTestProfile 
} from '../services/authService';
import { getSupabase } from '../services/supabaseService';
import { isSupabaseConfigured } from '../config/supabaseConfig';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');
  const [error, setError] = useState<string | null>(null);
  const [rejectionDetails, setRejectionDetails] = useState<RejectionDetails | null>(null);
  const isConfigured = isSupabaseConfigured();

  // Initialize Supabase Auth listener
  useEffect(() => {
    let authSubscription: { unsubscribe: () => void } | null = null;

    if (isConfigured) {
      const supabase = getSupabase();
      if (supabase) {
        // 1. Check existing session on boot
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session?.user) {
            const result = await processAuthenticatedUser(session.user);
            if (result.success && result.user) {
              setUser(result.user);
              setStatus('authenticated');
              setError(null);
            } else {
              setUser(null);
              setStatus('rejected');
              setRejectionDetails(result.rejection || null);
              setError(result.rejection?.message || 'Access restricted.');
            }
          } else {
            setStatus('signed_out');
          }
        });

        // 2. Listen to ongoing auth state events (SIGNED_IN, TOKEN_REFRESHED, SIGNED_OUT)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
              const result = await processAuthenticatedUser(session.user);
              if (result.success && result.user) {
                setUser(result.user);
                setStatus('authenticated');
                setError(null);
                setRejectionDetails(null);
              } else {
                setUser(null);
                setStatus('rejected');
                setRejectionDetails(result.rejection || null);
                setError(result.rejection?.message || 'Access restricted.');
              }
            } else if (event === 'SIGNED_OUT') {
              if (status !== 'rejected') {
                setUser(null);
                setStatus('signed_out');
              }
            }
          }
        );

        authSubscription = subscription;
      } else {
        setStatus('signed_out');
      }
    } else {
      setStatus('signed_out');
    }

    return () => {
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [isConfigured]);

  const clearError = useCallback(() => {
    setError(null);
    setRejectionDetails(null);
    if (status === 'rejected') {
      setStatus('signed_out');
    }
  }, [status]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setStatus('authenticating');
      setError(null);
      setRejectionDetails(null);

      const result = await authenticateWithGoogle();

      if (!result.success) {
        setUser(null);
        if (result.rejection?.reason === 'AUTHENTICATION_CANCELLED') {
          setStatus('signed_out');
          setError(null);
        } else {
          setStatus('rejected');
          setRejectionDetails(result.rejection || null);
          setError(result.rejection?.message || 'Access restricted.');
        }
      }
      // If success is true with OAuth redirect, browser handles redirect or onAuthStateChange handles session
    } catch (err: any) {
      setUser(null);
      setStatus('rejected');
      const msg = err?.message || 'Authentication failed. Please try again.';
      setError(msg);
      setRejectionDetails({
        reason: 'SUPABASE_ERROR',
        message: msg,
        timestamp: new Date().toISOString(),
      });
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutUser();
    } finally {
      setUser(null);
      setStatus('signed_out');
      setError(null);
      setRejectionDetails(null);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (!user) return;
    setStatus('authenticating');
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data: { session } } = await supabase.auth.refreshSession();
        if (session?.user) {
          const result = await processAuthenticatedUser(session.user);
          if (result.success && result.user) {
            setUser(result.user);
            setStatus('authenticated');
            return;
          }
        }
      }
      // Refresh timestamp
      setUser({
        ...user,
        lastLoginAt: new Date().toISOString(),
      });
      setStatus('authenticated');
    } catch (err) {
      console.warn('[DomainGuard] Refresh session error:', err);
      setStatus('authenticated');
    }
  }, [user]);

  // Quick verification runner: tests domain logic directly in the UI
  const testLoginWithEmail = useCallback(async (testEmail: string, testName?: string) => {
    setStatus('authenticating');
    setError(null);
    setRejectionDetails(null);

    await new Promise((res) => setTimeout(res, 350));

    const result = createVerifiedTestProfile(testEmail, testName);

    if (result.success && result.user) {
      setUser(result.user);
      setStatus('authenticated');
    } else {
      setUser(null);
      setStatus('rejected');
      setRejectionDetails(result.rejection || null);
      setError(result.rejection?.message || 'Access restricted. Please login using your official domain email.');
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        error,
        rejectionDetails,
        isConfigured,
        isFirebaseConfigured: isConfigured,
        isSupabaseConfigured: isConfigured,
        signInWithGoogle,
        signOut,
        clearError,
        refreshSession,
        testLoginWithEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type UserRole = 'admin' | 'user';

export type AuthStatus = 
  | 'initializing'
  | 'signed_out'
  | 'authenticating'
  | 'authenticated'
  | 'rejected';

export type RejectionReason = 
  | 'UNAUTHORIZED_DOMAIN'
  | 'UNVERIFIED_EMAIL'
  | 'AUTHENTICATION_CANCELLED'
  | 'NETWORK_ERROR'
  | 'FIREBASE_ERROR'
  | 'SUPABASE_ERROR'
  | 'UNKNOWN';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: UserRole;
  domain: string;
  lastLoginAt: string;
  providerId: string;
}

export interface RejectionDetails {
  email?: string;
  domain?: string;
  reason: RejectionReason;
  message: string;
  timestamp: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  status: AuthStatus;
  error: string | null;
  rejectionDetails: RejectionDetails | null;
  isConfigured: boolean;
  isFirebaseConfigured: boolean;
  isSupabaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshSession: () => Promise<void>;
  testLoginWithEmail?: (email: string, displayName?: string) => Promise<void>;
}

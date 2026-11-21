import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as fbSignOut, 
  User as FirebaseUser,
  onAuthStateChanged
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { firebaseConfig, isFirebaseConfigured } from '../config/firebaseConfig';
import { UserProfile, UserRole } from '../types';
import { normalizeEmail, extractDomain } from '../utils/domainValidation';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

/**
 * Known bootstrap admins for hbplus.fit.
 * Role assignment cannot be self-elevated by arbitrary client requests.
 */
const DEFAULT_BOOTSTRAP_ADMINS = ['aman@hbplus.fit', 'admin@hbplus.fit'];

export function initFirebase() {
  if (!isFirebaseConfigured()) {
    return { app: null, auth: null, firestore: null };
  }

  try {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig as Record<string, string>);
    } else {
      app = getApp();
    }

    auth = getAuth(app);
    firestore = getFirestore(app);

    return { app, auth, firestore };
  } catch (error) {
    console.warn('[DomainGuard] Firebase initialization error:', error);
    return { app: null, auth: null, firestore: null };
  }
}

export function getFirebaseAuth(): Auth | null {
  if (!auth) {
    initFirebase();
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore | null {
  if (!firestore) {
    initFirebase();
  }
  return firestore;
}

/**
 * Creates or updates user record in Firestore under users/{uid}.
 * Retrieves the stored role or assigns the default role based on verified enterprise configuration.
 */
export async function syncUserProfileToFirestore(
  fbUser: FirebaseUser,
  verifiedEmail: string
): Promise<UserProfile> {
  const db = getFirebaseFirestore();
  const normalized = normalizeEmail(verifiedEmail);
  const domain = extractDomain(normalized) || 'hbplus.fit';
  const now = new Date().toISOString();

  let role: UserRole = DEFAULT_BOOTSTRAP_ADMINS.includes(normalized) ? 'admin' : 'user';

  if (db) {
    try {
      const userRef = doc(db, 'users', fbUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data?.role === 'admin' || data?.role === 'user') {
          role = data.role as UserRole;
        }
        // Update login timestamp
        await setDoc(userRef, {
          email: normalized,
          displayName: fbUser.displayName || null,
          photoURL: fbUser.photoURL || null,
          domain,
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        // Initial user creation
        await setDoc(userRef, {
          uid: fbUser.uid,
          email: normalized,
          displayName: fbUser.displayName || null,
          photoURL: fbUser.photoURL || null,
          role,
          domain,
          emailVerified: fbUser.emailVerified,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
        });
      }

      // Record immutable audit log
      try {
        const auditRef = collection(db, 'audit_logs');
        await addDoc(auditRef, {
          userId: fbUser.uid,
          email: normalized,
          action: 'SSO_LOGIN_SUCCESS',
          domain,
          status: 'SUCCESS',
          timestamp: serverTimestamp(),
        });
      } catch (auditErr) {
        // Non-blocking for login flow
        console.warn('[DomainGuard] Could not write audit log:', auditErr);
      }
    } catch (err) {
      console.warn('[DomainGuard] Firestore sync error (using local profile):', err);
    }
  }

  return {
    uid: fbUser.uid,
    email: normalized,
    displayName: fbUser.displayName || normalized.split('@')[0],
    photoURL: fbUser.photoURL || null,
    emailVerified: fbUser.emailVerified,
    role,
    domain,
    lastLoginAt: now,
    providerId: fbUser.providerData[0]?.providerId || 'google.com',
  };
}

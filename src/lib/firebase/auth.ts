import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./config";

const googleProvider = new GoogleAuthProvider();

export async function signUp(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Update profile with display name
  await updateProfile(user, { displayName });

  // Create user document in Firestore
  await setDoc(doc(db, "users", user.uid), {
    email: user.email,
    displayName,
    createdAt: serverTimestamp(),
  });

  return user;
}

export async function signIn(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signInWithGoogle() {
  console.log("[Auth] Starting Google Sign-In with popup...");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    console.log("[Auth] User authenticated:", user.email);
    
    // Try to create/update user document with retry logic
    // This handles the case where Firestore isn't ready immediately
    await createUserDocumentWithRetry(user);
    
    return user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[Auth] Google Sign-In error:", firebaseError.code, firebaseError.message);
    throw error;
  }
}

// Helper function to create user document with retry
async function createUserDocumentWithRetry(user: User, maxRetries = 3): Promise<void> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists()) {
        console.log("[Auth] Creating new user document in Firestore");
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          displayName: user.displayName,
          createdAt: serverTimestamp(),
        });
      }
      return; // Success
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      console.warn(`[Auth] Firestore attempt ${attempt}/${maxRetries} failed:`, firebaseError.code);
      
      if (attempt === maxRetries) {
        // Don't throw on last attempt - user is already authenticated
        // The document can be created later
        console.warn("[Auth] Could not create user document, but sign-in succeeded");
        return;
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
    }
  }
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string) {
  await sendPasswordResetEmail(auth, email);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

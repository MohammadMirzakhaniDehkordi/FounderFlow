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
    
    // Check if user document exists, if not create it
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (!userDoc.exists()) {
      console.log("[Auth] Creating new user document in Firestore");
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: user.displayName,
        createdAt: serverTimestamp(),
      });
    }
    return user;
  } catch (error: unknown) {
    const firebaseError = error as { code?: string; message?: string };
    console.error("[Auth] Google Sign-In error:", firebaseError.code, firebaseError.message);
    throw error;
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

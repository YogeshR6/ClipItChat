import { auth, provider } from "../firebase-config";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";

export async function signInWithGoogle() {
  try {
    await signInWithPopup(provider);
  } catch (error) {
    console.error(error);
  }
}

export async function signOut() {
  try {
    await signOut();
  } catch (error) {
    console.error(error);
  }
}

export async function signInWithEmailAndPassword(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
  }
}

export async function signUpWithEmailAndPassword(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error(error);
  }
}

import {auth, googleProvider} from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";

export const userSignUpWithEmailAndPassword = async (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
};

export const userSignInWithEmailAndPassword = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

export const userSignInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    return result;
};

export const userSignOut = async () => {
    return signOut(auth);
};
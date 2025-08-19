import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { handleUserSignUpAddToCollection } from "./userFunctions";

export const userSignUpWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (user?.email) {
    const userSignUpResponse = await handleUserSignUpAddToCollection(
      user.email,
      user.uid
    );
    return userSignUpResponse;
  }
};

export const userSignInWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const userSignInWithGoogle = async () => {
  const userSignInWithGoogleResponse = await signInWithPopup(
    auth,
    googleProvider
  );
  const additionalUserInfo = getAdditionalUserInfo(
    userSignInWithGoogleResponse
  );
  if (
    userSignInWithGoogleResponse.user?.email &&
    additionalUserInfo?.isNewUser
  ) {
    const userSignUpResponse = await handleUserSignUpAddToCollection(
      userSignInWithGoogleResponse.user.email,
      userSignInWithGoogleResponse.user.uid
    );
    return userSignUpResponse;
  }
  return userSignInWithGoogleResponse.user;
};

export const userSignOut = async () => {
  return signOut(auth);
};

import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  getAdditionalUserInfo,
  getAuth,
  sendEmailVerification,
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
    const [userSignUpResponse, verifyUserResponse] = await Promise.all([
      handleUserSignUpAddToCollection(user.email, user.uid),
      sendEmailVerification(user),
    ]);
    return userSignUpResponse;
  }
};

export const userSignInWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const userSignInWithEmailResponse = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
  if (
    !userSignInWithEmailResponse ||
    userSignInWithEmailResponse instanceof Error
  ) {
    return;
  } else if (userSignInWithEmailResponse.user.emailVerified) {
    return userSignInWithEmailResponse.user;
  } else {
    return false;
  }
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

export const sendEmailVerificationAgain = async (): Promise<void | Error> => {
  try {
    const userObj = auth.currentUser;
    if (userObj) {
      const sendEmailVerificationResponse = await sendEmailVerification(
        userObj
      );
      return sendEmailVerificationResponse;
    }
  } catch (error) {
    return error as Error;
  }
};

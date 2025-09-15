import { auth, googleProvider } from "./firebase";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  getAdditionalUserInfo,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  deleteUserAccountByUserObj,
  handleUserSignUpAddToCollection,
} from "./userFunctions";
import { UserType } from "@/types/user";

export const userSignUpWithEmailAndPassword = async (
  email: string,
  password: string
) => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  if (user?.email) {
    await Promise.all([
      handleUserSignUpAddToCollection(user.email, user.uid),
      sendEmailVerification(user),
    ]);
    return true;
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

export const reauthenticateUserSignInWithEmailAndPassword = async (
  email: string,
  password: string,
  userObj: UserType
) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
      const reauthenticateUserSignInWithEmailAndPasswordResponse =
        await deleteUserAccountByUserObj(userObj);
      if (
        !reauthenticateUserSignInWithEmailAndPasswordResponse ||
        reauthenticateUserSignInWithEmailAndPasswordResponse instanceof Error
      ) {
        return;
      } else {
        return true;
      }
    }
  } catch (error) {
    return new Error("Error deleting user account!");
  }
};

export const reauthenticateUserSignInWithGoogle = async (userObj: UserType) => {
  const user = auth.currentUser;
  if (user) {
    try {
      await reauthenticateWithPopup(user, googleProvider);
      await deleteUserAccountByUserObj(userObj);
    } catch (error) {
      return new Error("Error deleting user account!");
    }
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

export const sendForgotPasswordEmail = async (
  email: string
): Promise<void | Error> => {
  try {
    const sendForgotPasswordEmailResponse = await sendPasswordResetEmail(
      auth,
      email
    );
    return sendForgotPasswordEmailResponse;
  } catch (error) {
    return error as Error;
  }
};

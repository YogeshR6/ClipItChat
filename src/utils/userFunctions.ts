import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserType } from "@/types/user";

export const handleUserSignUpAddToCollection = async (
  email: string,
  uid: string
) => {
  try {
    const userSignUpResponse = await addDoc(collection(db, "users"), {
      email: email,
      authUid: uid,
    });
    return userSignUpResponse;
  } catch (error) {
    return error;
  }
};

export const getUserDetailsFromAuthUid = async (authUid: string) => {
  try {
    const q = query(collection(db, "users"), where("authUid", "==", authUid));
    const userDocs = await getDocs(q);

    if (!userDocs.empty) {
      return {
        ...userDocs.docs[0].data(),
        uid: userDocs.docs[0].id,
      };
    }
  } catch (error) {
    return error;
  }
};

export const updateUserDetailsInFirestore = async (
  uid: string,
  userDetails: Partial<UserType>
) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, userDetails);
  } catch (error) {
    return error;
  }
};

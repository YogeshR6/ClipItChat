import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase";

export const handleUserSignUpAddToCollection = async (
  email: string,
  uid: string
) => {
  try {
    const userSignUpResponse = await addDoc(collection(db, "users"), {
      email: email,
      uid: uid,
    });
    return userSignUpResponse;
  } catch (error) {
    return error;
  }
};

export const getUserDetailsFromUid = async (uid: string) => {
  try {
    const q = query(collection(db, "users"), where("uid", "==", uid));
    const userDocs = await getDocs(q);
    if (!userDocs.empty) {
      return userDocs.docs[0].data();
    }
  } catch (error) {
    return error;
  }
};

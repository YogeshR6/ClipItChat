import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export const handleUserSignUpAddToCollection = async (email: string) => {
  try {
    const userSignUpResponse = await addDoc(collection(db, "users"), {
      email: email,
    });
    return userSignUpResponse;
  } catch (error) {
    return error;
  }
};

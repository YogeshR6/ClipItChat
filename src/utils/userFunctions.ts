import {
  addDoc,
  arrayRemove,
  arrayUnion,
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
      photoUrl: "",
      fName: "",
      lName: "",
      username: "",
      posts: [],
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

export const addNewUserPostInFirestore = async (
  uid: string,
  postId: string
) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      posts: arrayUnion(postId),
    });
  } catch (error) {
    return error;
  }
};

export const removeUserPostFromFirestore = async (
  uid: string,
  postId: string
) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      posts: arrayRemove(postId),
    });
  } catch (error) {
    return error;
  }
};

export const addPostToUserLikedPosts = async (uid: string, postId: string) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      likedPosts: arrayUnion(postId),
    });
  } catch (error) {
    return error;
  }
};

export const removePostFromUserLikedPosts = async (
  uid: string,
  postId: string
) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      likedPosts: arrayRemove(postId),
    });
  } catch (error) {
    return error;
  }
};

import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { UserType } from "@/types/user";
import { deleteImageStoredInCloudinary } from "@/utils/cloudinaryFunctions";
import { deleteUser } from "firebase/auth";

export const handleUserSignUpAddToCollection = async (
  email: string,
  uid: string
) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userSignUpResponse = await setDoc(userDocRef, {
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
  userDetails: Partial<UserType>,
  oldProfileSize?: number
) => {
  try {
    const userRef = doc(db, "users", uid);
    const imageStorageIncrement =
      oldProfileSize && userDetails.cloudinaryProfilePhotoSize
        ? userDetails.cloudinaryProfilePhotoSize - oldProfileSize
        : userDetails.cloudinaryProfilePhotoSize
        ? userDetails.cloudinaryProfilePhotoSize
        : 0;
    await updateDoc(userRef, {
      ...userDetails,
      imageStorageUsed: increment(imageStorageIncrement),
    });
  } catch (error) {
    return error;
  }
};

export const addNewUserPostInFirestore = async (
  uid: string,
  postId: string,
  newPostSize: number
): Promise<void | any> => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      posts: arrayUnion(postId),
      imageStorageUsed: increment(newPostSize),
    });
  } catch (error) {
    return error;
  }
};

export const removeUserPostFromFirestore = async (
  uid: string,
  postId: string,
  postSize: number
) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      posts: arrayRemove(postId),
      imageStorageUsed: increment(-postSize),
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

export const removeUserProfilePic = async (userObj: UserType) => {
  try {
    deleteImageStoredInCloudinary(
      userObj.cloudinaryProfilePhotoPublicId || "",
      "profile_photos"
    );
    const userRef = doc(db, "users", userObj.uid);
    const imageStorageUsedValue = userObj.cloudinaryProfilePhotoSize
      ? -userObj.cloudinaryProfilePhotoSize
      : 0;
    await updateDoc(userRef, {
      cloudinaryProfilePhotoPublicId: "",
      cloudinaryProfilePhotoSize: 0,
      photoUrl: "",
      imageStorageUsed: increment(imageStorageUsedValue),
    });
  } catch (error) {
    console.error("Error removing user profile photo", error);
    return error as Error;
  }
};

export const deleteUserAccountByUserObj = async (userObj: UserType) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userObj.uid));

    if (!userDoc.exists()) {
      throw new Error("User not found");
    }

    const userPostIds = userDoc.data().posts || [];
    if (userPostIds.length > 0) {
      const userPostListQ = query(
        collection(db, "posts"),
        where(documentId(), "in", userPostIds)
      );
      const userPostList = await getDocs(userPostListQ);
      userPostList.docs.forEach(async (doc) => {
        await Promise.all([
          deleteImageStoredInCloudinary(
            doc.data().cloudinaryPublicId,
            "user_posts"
          ),
          deleteDoc(doc.ref),
        ]);
      });
    }

    const promises = [
      deleteImageStoredInCloudinary(
        userObj.cloudinaryProfilePhotoPublicId || "",
        "profile_photos"
      ),
      deleteDoc(doc(db, "users", userObj.uid)),
    ];

    if (userObj.username) {
      promises.push(
        deleteDoc(doc(db, "usernames", userObj.username.toLowerCase()))
      );
    }

    await Promise.all(promises);
    const user = auth.currentUser;
    if (user) {
      await deleteUser(user);
    }
    return true;
  } catch (error) {
    return error as Error;
  }
};

export const isUsernameAvailable = async (
  username: string
): Promise<boolean> => {
  const usernameRef = doc(db, "usernames", username.toLowerCase());
  const docSnap = await getDoc(usernameRef);
  return !docSnap.exists();
};

export const claimUsername = async (
  userId: string,
  newUsername: string,
  oldUsername?: string
): Promise<void> => {
  const newUsernameRef = doc(db, "usernames", newUsername.toLowerCase());
  try {
    await runTransaction(db, async (transaction) => {
      const newUsernameDoc = await transaction.get(newUsernameRef);
      if (newUsernameDoc.exists()) {
        throw new Error("Username is already taken.");
      }

      if (oldUsername) {
        const oldUsernameRef = doc(db, "usernames", oldUsername.toLowerCase());
        transaction.delete(oldUsernameRef);
      }

      transaction.set(newUsernameRef, { userId: userId });
    });
  } catch (error) {
    console.error("Error claiming username:", error);
    throw error;
  }
};

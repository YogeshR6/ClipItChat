import { GameCategoryType } from "@/types/misc";
import { CommentType, PostType } from "@/types/post";
import { deleteImageStoredInCloudinary } from "@/utils/cloudinaryFunctions";
import { db } from "@/utils/firebase";
import {
  addPostToUserLikedPosts,
  removePostFromUserLikedPosts,
  removeUserPostFromFirestore,
} from "@/utils/userFunctions";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

export const createNewPostImage = async (
  imageUrl: string,
  userUid: string,
  publicId: string,
  selectedGame: GameCategoryType,
  size: number
): Promise<string | Error> => {
  try {
    const timestamp = new Date();
    const createNewPostImageResponse = await addDoc(collection(db, "posts"), {
      imageUrl: imageUrl,
      userUid: userUid,
      likes: 0,
      comments: [],
      createdAt: timestamp,
      cloudinaryPublicId: publicId,
      selectedGame: selectedGame,
      postSize: Number(size),
    });
    return createNewPostImageResponse.id;
  } catch (error) {
    return error as Error;
  }
};

export const getPostDataByUid = async (
  postId: string
): Promise<PostType | Error> => {
  try {
    const postDoc = await getDoc(doc(db, "posts", postId));
    if (postDoc.exists()) {
      return { ...(postDoc.data() as PostType), postUid: postDoc.id };
    } else {
      throw new Error("Post not found");
    }
  } catch (error) {
    return error as Error;
  }
};

export const getAllPostsDataByUserUid = async (userUid: string) => {
  try {
    const q = query(collection(db, "posts"), where("userUid", "==", userUid));
    const postList = await getDocs(q);
    return postList.docs.map((doc) => {
      return { ...(doc.data() as PostType), postUid: doc.id };
    });
  } catch (error) {
    return error as Error;
  }
};

export const getFirstPagePostsListResultUsingLimit = async (
  limitCount: number
) => {
  try {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const postList = await getDocs(q);
    return postList.docs.map((doc) => {
      return { ...(doc.data() as PostType), postUid: doc.id };
    });
  } catch (error) {
    return error as Error;
  }
};

export const deletePostById = async (
  postData: PostType
): Promise<boolean | Error> => {
  try {
    const deleteImageFromCloudinaryResponse =
      await deleteImageStoredInCloudinary(
        postData.cloudinaryPublicId,
        "user_posts"
      );
    if (deleteImageFromCloudinaryResponse instanceof Error) {
      console.error(
        "Error deleting image from Cloudinary:",
        deleteImageFromCloudinaryResponse
      );
      throw new Error("Failed to delete image from Cloudinary");
    }
    const removeUserPostFromFirestoreResponse =
      await removeUserPostFromFirestore(
        postData.userUid,
        postData.postUid,
        postData.postSize || 0
      );
    if (removeUserPostFromFirestoreResponse instanceof Error) {
      console.error(
        "Error removing user post from Firestore:",
        removeUserPostFromFirestoreResponse
      );
      throw new Error("Failed to remove user post from Firestore");
    }
    await deleteDoc(doc(db, "posts", postData.postUid));
    return true;
  } catch (error) {
    return error as Error;
  }
};

export const userLikePost = async (postData: PostType, userId: string) => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    await updateDoc(postRef, {
      likes: increment(1),
    });
    await addPostToUserLikedPosts(userId, postData.postUid);
  } catch (error) {
    return error as Error;
  }
};

export const userUnlikePost = async (postData: PostType, userId: string) => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    await updateDoc(postRef, {
      likes: increment(-1),
    });
    await removePostFromUserLikedPosts(userId, postData.postUid);
  } catch (error) {
    return error as Error;
  }
};

export const addUserCommentOnPost = async (
  postData: PostType,
  userId: string,
  comment: string,
  commentId: string
) => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    await updateDoc(postRef, {
      comments: arrayUnion({
        commentId: commentId,
        userUid: userId,
        comment: comment,
        createdAt: Timestamp.now(),
      }),
    });
  } catch (error) {
    return error as Error;
  }
};

export const deleteCommentFromPost = async (
  postData: PostType,
  commentToRemove: CommentType
) => {
  try {
    const updatedCommentsList = postData.comments?.filter(
      (c) => c.commentId !== commentToRemove.commentId
    );
    const postRef = doc(db, "posts", postData.postUid);
    await updateDoc(postRef, {
      comments: updatedCommentsList,
    });
  } catch (error) {
    return error as Error;
  }
};

export const getAllLikedPostsDataByUserUid = async (userUid: string) => {
  try {
    const getUserData = await getDoc(doc(db, "users", userUid));
    if (!getUserData.exists()) {
      throw new Error("User not found");
    }
    const userLikedPostIds = getUserData.data().likedPosts || [];
    if (userLikedPostIds.length === 0) {
      return [];
    }

    const q = query(
      collection(db, "posts"),
      where(documentId(), "in", userLikedPostIds)
    );
    const likedPostList = await getDocs(q);
    return likedPostList.docs.map((doc) => {
      return { ...(doc.data() as PostType), postUid: doc.id };
    });
  } catch (error) {
    return error as Error;
  }
};

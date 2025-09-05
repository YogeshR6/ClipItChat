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
  collectionGroup,
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
  writeBatch,
} from "firebase/firestore";

export const createNewPostImage = async (
  imageUrl: string,
  user: {
    id: string;
    username?: string;
  },
  publicId: string,
  selectedGame: GameCategoryType,
  size: number
): Promise<string | Error> => {
  try {
    const timestamp = new Date();
    const createNewPostImageResponse = await addDoc(collection(db, "posts"), {
      imageUrl: imageUrl,
      user,
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
    const commentsRef = collection(db, "posts", postId, "comments");
    const commentsQuery = query(
      commentsRef,
      orderBy("createdAt", "desc"),
      limit(20)
    );

    const [postDoc, commentsSnapshot] = await Promise.all([
      getDoc(doc(db, "posts", postId)),
      getDocs(commentsQuery),
    ]);

    if (postDoc.exists()) {
      const postData = { ...(postDoc.data() as PostType), postUid: postDoc.id };
      return {
        ...postData,
        comments: commentsSnapshot.docs.map((doc) => ({
          ...(doc.data() as CommentType),
          commentUid: doc.id,
        })),
      };
    } else {
      throw new Error("Post not found");
    }
  } catch (error) {
    return error as Error;
  }
};

export const getAllPostsDataByUserUid = async (userUid: string) => {
  try {
    const q = query(collection(db, "posts"), where("user.id", "==", userUid));
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

export const getFirstPagePostsListResultUsingLimitAndGameFilter = async (
  limitCount: number,
  gameFilterList: string[]
) => {
  try {
    const q = query(
      collection(db, "posts"),
      where("selectedGame.guid", "in", gameFilterList),
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
        postData.user.id,
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
  userObj: {
    id: string;
    username: string;
  },
  comment: string
): Promise<string | Error> => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    const commentsRef = collection(postRef, "comments");
    const newComment = {
      user: userObj,
      comment: comment,
      createdAt: Timestamp.now(),
    };
    const docRef = await addDoc(commentsRef, newComment);
    return docRef.id;
  } catch (error) {
    return error as Error;
  }
};

export const deleteCommentFromPost = async (
  postData: PostType,
  commentToRemove: CommentType
) => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    const commentRef = doc(postRef, "comments", commentToRemove.commentUid);
    await deleteDoc(commentRef);
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

export const updatePostUsernames = async (
  userId: string,
  newUsername: string
) => {
  try {
    const q = query(collection(db, "posts"), where("user.id", "==", userId));
    const postList = await getDocs(q);
    const batch = writeBatch(db);
    postList.docs.forEach((doc) => {
      batch.update(doc.ref, {
        "user.username": newUsername,
      });
    });
    await batch.commit();
  } catch (error) {
    return error as Error;
  }
};

export const updateCommentUsernames = async (
  userId: string,
  newUsername: string
) => {
  try {
    const commentsQuery = query(
      collectionGroup(db, "comments"),
      where("user.id", "==", userId)
    );

    const querySnapshot = await getDocs(commentsQuery);

    const batch = writeBatch(db);
    querySnapshot.forEach((doc) => {
      const commentRef = doc.ref;
      batch.update(commentRef, {
        "user.username": newUsername,
      });
    });

    await batch.commit();
  } catch (error) {
    return error as Error;
  }
};

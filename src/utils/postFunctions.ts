import { GameCategoryType } from "@/types/misc";
import { CommentType, PostType } from "@/types/post";
import { UserType } from "@/types/user";
import { deleteImageStoredInCloudinary } from "@/utils/cloudinaryFunctions";
import { db } from "@/utils/firebase";
import {
  addPostToUserLikedPosts,
  removePostFromUserLikedPosts,
  removeUserPostFromFirestore,
} from "@/utils/userFunctions";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  documentId,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

export const createNewPostImage = async (
  imageUrl: string,
  userId: string,
  publicId: string,
  selectedGame: GameCategoryType,
  size: number
): Promise<string | Error> => {
  try {
    const timestamp = new Date();
    const createNewPostImageResponse = await addDoc(collection(db, "posts"), {
      authorId: userId,
      imageUrl: imageUrl,
      likes: 0,
      createdAt: timestamp,
      cloudinaryPublicId: publicId,
      selectedGame: selectedGame,
      postSize: Number(size),
      noOfComments: 0,
    });
    return createNewPostImageResponse.id;
  } catch (error) {
    console.error("Error creating new post", error);
    return new Error("Error creating new post", { cause: error });
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

    if (!postDoc.exists()) {
      throw new Error("Post not found");
    }

    const postDataRaw = postDoc.data() as PostType;
    const postAuthorId = postDataRaw.authorId;

    const authorUidList = new Set<string>();
    if (postAuthorId) {
      authorUidList.add(postAuthorId);
    }
    commentsSnapshot.docs.forEach((commentDoc) => {
      const authorId = commentDoc.data().authorId;
      if (authorId) {
        authorUidList.add(authorId);
      }
    });

    let userProfiles: Record<string, UserType> = {};
    if (authorUidList.size > 0) {
      const userPromises = Array.from(authorUidList).map((uid) =>
        getDoc(doc(db, "users", uid))
      );
      const userDocs = await Promise.all(userPromises);

      userDocs.forEach((userDoc) => {
        if (userDoc.exists()) {
          userProfiles[userDoc.id] = userDoc.data() as UserType;
        }
      });
    }

    const enrichedComments = commentsSnapshot.docs.reduce<CommentType[]>(
      (acc, commentDoc) => {
        const commentData = commentDoc.data() as CommentType;
        const authorData = userProfiles[commentData.authorId] || null;

        if (authorData) {
          acc.push({
            ...commentData,
            commentUid: commentDoc.id,
            user: authorData,
          });
        }

        return acc;
      },
      []
    );

    const postData = { ...postDataRaw, postUid: postDoc.id };
    return {
      ...postData,
      comments: enrichedComments,
      user: userProfiles[postAuthorId] || null,
    };
  } catch (error) {
    console.error("Error fetching post data", error);
    return new Error("Error fetching post data", { cause: error });
  }
};

export const getAllPostsDataByUserUid = async (
  userUid: string
): Promise<PostType[] | Error> => {
  try {
    const getUserData = await getDoc(doc(db, "users", userUid));
    if (!getUserData.exists()) {
      throw new Error("User not found");
    }
    const userPostIds = getUserData.data().posts || [];
    if (userPostIds.length === 0) {
      return [];
    }
    const q = query(
      collection(db, "posts"),
      where(documentId(), "in", userPostIds)
    );
    const postList = await getDocs(q);
    return postList.docs.map((doc) => {
      return { ...(doc.data() as PostType), postUid: doc.id };
    });
  } catch (error) {
    console.error("Error fetching posts by user list", error);
    return new Error("Error fetching posts by user list", { cause: error });
  }
};

export const enrichPostsWithUserData = async (
  postDocs: QueryDocumentSnapshot<DocumentData>[]
): Promise<PostType[] | Error> => {
  try {
    const authorUidList = new Set<string>();
    postDocs.forEach((doc) => {
      const authorId = doc.data().authorId;
      if (authorId) {
        authorUidList.add(authorId);
      }
    });

    if (authorUidList.size === 0) {
      return postDocs.map((doc) => ({
        ...(doc.data() as PostType),
        postUid: doc.id,
        user: null,
      }));
    }

    const userPromises = Array.from(authorUidList).map((uid) =>
      getDoc(doc(db, "users", uid))
    );
    const userDocs = await Promise.all(userPromises);

    const userProfiles: Record<string, UserType> = {};
    userDocs.forEach((userDoc) => {
      if (userDoc.exists()) {
        userProfiles[userDoc.id] = userDoc.data() as UserType;
      }
    });

    const enrichedPosts = postDocs.map((doc) => {
      const postData = doc.data() as PostType;
      const authorData = userProfiles[postData.authorId] || null;
      return {
        ...postData,
        postUid: doc.id,
        user: authorData,
      };
    });

    return enrichedPosts;
  } catch (error) {
    console.error("Error enriching posts by adding user profile data", error);
    return new Error("Error fetching user profile data for given posts", {
      cause: error,
    });
  }
};

export const getFirstPagePostsListResultUsingLimit = async (
  limitCount: number
): Promise<
  | {
      lastVisible: QueryDocumentSnapshot<DocumentData>;
      postListToReturn: PostType[];
    }
  | Error
> => {
  try {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const postListSnapshot = await getDocs(q);
    const lastVisible = postListSnapshot.docs[postListSnapshot.docs.length - 1];
    const postListToReturn = await enrichPostsWithUserData(
      postListSnapshot.docs
    );
    if (postListToReturn instanceof Error)
      throw new Error("Error fetching user profile data for given posts");
    return { lastVisible, postListToReturn };
  } catch (error) {
    console.error("Error fetching first page posts with limits", error);
    return new Error("Error fetching first page posts with limit", {
      cause: error,
    });
  }
};

export const getNextPagePostsListResultUsingLimit = async (
  limitCount: number,
  lastVisible: QueryDocumentSnapshot<DocumentData>
): Promise<
  | {
      newLastVisible: QueryDocumentSnapshot<DocumentData>;
      newPostListToReturn: PostType[];
    }
  | Error
> => {
  try {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(limitCount)
    );
    const postListSnapshot = await getDocs(q);
    const newLastVisible =
      postListSnapshot.docs[postListSnapshot.docs.length - 1];
    const newPostListToReturn = await enrichPostsWithUserData(
      postListSnapshot.docs
    );
    if (newPostListToReturn instanceof Error)
      throw new Error("Error fetching user profile data for given posts");

    return { newLastVisible, newPostListToReturn };
  } catch (error) {
    console.error("Error fetching next page posts with limits", error);
    return new Error("Error fetching next page posts with limit", {
      cause: error,
    });
  }
};

export const getFirstPagePostsListResultUsingLimitAndGameFilter = async (
  limitCount: number,
  gameFilterList: string[]
): Promise<
  | {
      lastVisible: QueryDocumentSnapshot<DocumentData>;
      postListToReturn: PostType[];
    }
  | Error
> => {
  try {
    const q = query(
      collection(db, "posts"),
      where("selectedGame.guid", "in", gameFilterList),
      orderBy("createdAt", "desc"),
      limit(limitCount)
    );
    const postListSnapshot = await getDocs(q);
    const lastVisible = postListSnapshot.docs[postListSnapshot.docs.length - 1];
    const postListToReturn = await enrichPostsWithUserData(
      postListSnapshot.docs
    );
    if (postListToReturn instanceof Error)
      throw new Error("Error fetching user profile data for given posts");

    return { lastVisible, postListToReturn };
  } catch (error) {
    console.error(
      "Error fetching first page posts with limits and filter",
      error
    );
    return new Error("Error fetching first page posts with limit and filter", {
      cause: error,
    });
  }
};

export const getNextPagePostsListResultUsingLimitAndGameFilter = async (
  limitCount: number,
  gameFilterList: string[],
  lastVisible: QueryDocumentSnapshot<DocumentData>
): Promise<
  | {
      newLastVisible: QueryDocumentSnapshot<DocumentData>;
      newPostListToReturn: PostType[];
    }
  | Error
> => {
  try {
    const q = query(
      collection(db, "posts"),
      where("selectedGame.guid", "in", gameFilterList),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible),
      limit(limitCount)
    );
    const postListSnapshot = await getDocs(q);
    const newLastVisible =
      postListSnapshot.docs[postListSnapshot.docs.length - 1];
    const newPostListToReturn = await enrichPostsWithUserData(
      postListSnapshot.docs
    );
    if (newPostListToReturn instanceof Error)
      throw new Error("Error fetching user profile data for given posts");

    return { newLastVisible, newPostListToReturn };
  } catch (error) {
    console.error(
      "Error fetching next page posts with limits and filter",
      error
    );
    return new Error("Error fetching next page posts with limit and filter", {
      cause: error,
    });
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
        postData.authorId || "",
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
    console.error("Error deleting post by id", error);
    return new Error("Error deleting the post!", {
      cause: error,
    });
  }
};

export const userLikePost = async (
  postData: PostType,
  userId: string
): Promise<boolean | Error> => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    await updateDoc(postRef, {
      likes: increment(1),
    });
    await addPostToUserLikedPosts(userId, postData.postUid);
    return true;
  } catch (error) {
    console.error("Error updating likes on post!", error);
    return new Error("Error liking the post", {
      cause: error,
    });
  }
};

export const userUnlikePost = async (
  postData: PostType,
  userId: string
): Promise<boolean | Error> => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    await updateDoc(postRef, {
      likes: increment(-1),
    });
    await removePostFromUserLikedPosts(userId, postData.postUid);
    return true;
  } catch (error) {
    console.error("Error updating likes on post!", error);
    return new Error("Error un-liking the post", {
      cause: error,
    });
  }
};

export const addUserCommentOnPost = async (
  postData: PostType,
  userId: string,
  comment: string
): Promise<string | Error> => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    const newCommentRef = doc(collection(postRef, "comments"));

    const batch = writeBatch(db);

    const newComment = {
      authorId: userId,
      comment: comment,
      createdAt: Timestamp.now(),
    };

    batch.set(newCommentRef, newComment);
    batch.update(postRef, { noOfComments: increment(1) });

    await batch.commit();

    return newCommentRef.id;
  } catch (error) {
    console.error("Error adding comment on post!", error);
    return new Error("Error adding comment on post!", {
      cause: error,
    });
  }
};

export const deleteCommentFromPost = async (
  postData: PostType,
  commentToRemove: CommentType
): Promise<boolean | Error> => {
  try {
    const postRef = doc(db, "posts", postData.postUid);
    const commentRef = doc(postRef, "comments", commentToRemove.commentUid);

    const batch = writeBatch(db);

    batch.delete(commentRef); // Delete the comment
    batch.update(postRef, { noOfComments: increment(-1) });

    await batch.commit();

    return true;
  } catch (error) {
    console.error("Error deleting comment on post!", error);
    return new Error("Error deleting comment on post!", {
      cause: error,
    });
  }
};

export const getAllLikedPostsDataByUserUid = async (
  userUid: string
): Promise<PostType[] | Error> => {
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
    console.error("Error fetching posts liked by user list", error);
    return new Error("Error fetching posts liked by user list", {
      cause: error,
    });
  }
};

import { GameCategoryType } from "@/types/misc";
import { PostType } from "@/types/post";
import { deleteImageStoredInCloudinary } from "@/utils/cloudinaryFunctions";
import { db } from "@/utils/firebase";
import { removeUserPostFromFirestore } from "@/utils/userFunctions";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";

export const createNewPostImage = async (
  imageUrl: string,
  userUid: string,
  publicId: string,
  selectedGame: GameCategoryType
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
    await deleteDoc(doc(db, "posts", postData.postUid));
    await deleteImageStoredInCloudinary(postData.cloudinaryPublicId);
    await removeUserPostFromFirestore(postData.userUid, postData.postUid);
    return true;
  } catch (error) {
    return error as Error;
  }
};

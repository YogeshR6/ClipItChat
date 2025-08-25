import { PostType } from "@/types/post";
import { db } from "@/utils/firebase";
import {
  addDoc,
  collection,
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
  assetId: string,
  userUid: string
): Promise<string | Error> => {
  try {
    const timestamp = new Date();
    const createNewPostImageResponse = await addDoc(collection(db, "posts"), {
      imageUrl: imageUrl,
      userUid: userUid,
      likes: 0,
      comments: [],
      createdAt: timestamp,
      cloudinaryAssetId: assetId,
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

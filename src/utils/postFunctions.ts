import { db } from "@/utils/firebase";
import { addDoc, collection } from "firebase/firestore";

export const createNewPostImage = async (
  imageUrl: string,
  userUid: string
): Promise<string | Error> => {
  try {
    const createNewPostImageResponse = await addDoc(collection(db, "posts"), {
      imageUrl: imageUrl,
      userUid: userUid,
      likes: 0,
      comments: [],
    });
    return createNewPostImageResponse.id;
  } catch (error) {
    return error as Error;
  }
};

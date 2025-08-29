import { createNewPostImage } from "@/utils/postFunctions";
import {
  addNewUserPostInFirestore,
  updateUserDetailsInFirestore,
} from "./userFunctions";
import { GameCategoryType } from "@/types/misc";
import { auth } from "@/utils/firebase";
import { UserType } from "@/types/user";

export const uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore = async (
  file: File,
  userObj: UserType
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadFolder", "profile_photos");

    if (userObj.cloudinaryProfilePhotoPublicId && userObj.photoUrl) {
      deleteImageStoredInCloudinary(
        userObj.cloudinaryProfilePhotoPublicId,
        "profile_photos"
      );
    }

    const token = await user.getIdToken();
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`, // Send token in the header
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong");
    }

    const uploadedImageData = await response.json();
    await updateUserDetailsInFirestore(userObj.uid, {
      photoUrl: uploadedImageData.secure_url,
      cloudinaryProfilePhotoPublicId: uploadedImageData.public_id,
    });
    return uploadedImageData;
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

export const uploadUserPostImageToCloudinaryAndSaveInfoInFirestore = async (
  file: File,
  userUid: string,
  selectedGame: GameCategoryType
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadFolder", "user_posts");

    const token = await user.getIdToken();
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong");
    }

    const uploadedImageData = await response.json();

    const newPostId = await createNewPostImage(
      uploadedImageData.secure_url,
      userUid,
      uploadedImageData.public_id,
      selectedGame
    );
    if (!(newPostId instanceof Error)) {
      await addNewUserPostInFirestore(userUid, newPostId);
      return newPostId;
    }
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

export const deleteImageStoredInCloudinary = async (
  publicId: string,
  type: "profile_photos" | "user_posts"
) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");
  try {
    const token = await user.getIdToken();
    const response = await fetch("/api/delete-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ public_id: publicId, folderName: type }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to delete image");
    }

    const deletedImageData = await response.json();
    return deletedImageData;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};

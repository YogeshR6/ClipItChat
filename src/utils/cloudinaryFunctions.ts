import { createNewPostImage } from "@/utils/postFunctions";
import {
  addNewUserPostInFirestore,
  updateUserDetailsInFirestore,
} from "./userFunctions";
import { GameCategoryType } from "@/types/misc";

export const uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore = async (
  file: File,
  userUid: string
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadFolder", "profile_photos");
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Something went wrong");
    }

    const uploadedImageData = await response.json();
    await updateUserDetailsInFirestore(userUid, {
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
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("uploadFolder", "user_posts");

    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
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

export const deleteImageStoredInCloudinary = async (publicId: string) => {
  try {
    const response = await fetch("/api/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_id: publicId }),
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

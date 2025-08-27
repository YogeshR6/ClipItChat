import { createNewPostImage } from "@/utils/postFunctions";
import {
  addNewUserPostInFirestore,
  updateUserDetailsInFirestore,
} from "./userFunctions";
import { GameCategoryType } from "@/types/misc";

export const getSignedUploadSignatureFromCloudinary = async (paramsToSign: {
  [key: string]: any;
}) => {
  const signatureResponse = await fetch("/api/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ paramsToSign }),
  });
  const { signature } = await signatureResponse.json();
  return signature;
};

export const uploadImageToCloudinary = async (
  file: File,
  timestamp: string,
  signature: string
) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("timestamp", timestamp);
  formData.append("signature", signature);
  formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

  const uploadResponse = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const uploadedImageData = await uploadResponse.json();
  return uploadedImageData;
};

export const uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore = async (
  file: File,
  userUid: string
) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp };
    const signature = await getSignedUploadSignatureFromCloudinary(
      paramsToSign
    );

    const uploadedImageData = await uploadImageToCloudinary(
      file,
      timestamp.toString(),
      signature
    );
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
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp };
    const signature = await getSignedUploadSignatureFromCloudinary(
      paramsToSign
    );

    const uploadedImageData = await uploadImageToCloudinary(
      file,
      timestamp.toString(),
      signature
    );
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
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp, public_id: publicId };
    const signature = await getSignedUploadSignatureFromCloudinary(
      paramsToSign
    );

    const formData = new FormData();
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);
    formData.append("public_id", publicId);

    const deleteUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`;

    const deletedImageResponse = await fetch(deleteUrl, {
      method: "POST",
      body: formData,
    });

    const deletedImageData = await deletedImageResponse.json();
    return deletedImageData;
  } catch (error) {
    console.error("Error deleting image:", error);
    return false;
  }
};

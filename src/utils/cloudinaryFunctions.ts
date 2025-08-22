import { updateUserDetailsInFirestore } from "./userFunctions";

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

export const uploadProfilePhotoToCloudinary = async (
  file: File,
  userUid: string
) => {
  try {
    // 1. Get a signature from our API route
    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = { timestamp };
    const signature = await getSignedUploadSignatureFromCloudinary(
      paramsToSign
    );

    // 2. Upload the file directly to Cloudinary
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const uploadedImageData = await uploadResponse.json();
    await updateUserDetailsInFirestore(userUid, {
      photoUrl: uploadedImageData.secure_url,
    });
    return uploadedImageData;
  } catch (error) {
    console.error("Upload failed:", error);
  }
};

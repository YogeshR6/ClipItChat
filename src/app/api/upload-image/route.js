// src/app/api/upload-image/route.js

import { v2 as cloudinary } from "cloudinary";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { admin } from "../../../lib/firebaseAdmin";

// Configure Cloudinary with your credentials.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");

  // Check for the Authorization header
  if (!authHeader) {
    return NextResponse.json(
      { error: "No authorization header provided" },
      { status: 401 }
    );
  }

  // Extract the token from the "Bearer <token>" format
  const token = authHeader.split(" ")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Malformed authorization header" },
      { status: 401 }
    );
  }

  // Verify the token using the Firebase Admin SDK
  const decodedToken = await admin.auth().verifyIdToken(token);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const uid = decodedToken.uid;

  const formData = await request.formData();
  const file = formData.get("file");
  const uploadFolder = formData.get("uploadFolder") || "default";

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    // Convert the file to a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Use a Promise to handle the upload stream
    const uploadResult = await new Promise((resolve, reject) => {
      // Use upload_stream to upload the buffer
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `${uploadFolder}/${uid}`,
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(new Error("Failed to upload to Cloudinary."));
          } else {
            resolve(result);
          }
        }
      );
      // Write the buffer to the stream
      uploadStream.end(buffer);
    });

    // Return the successful upload data
    return NextResponse.json({
      secure_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      size: (uploadResult.bytes / 1048576).toFixed(3), // size in MB
    });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

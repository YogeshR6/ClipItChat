// src/app/api/upload-image/route.js

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary with your credentials.
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(request) {
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
          folder: uploadFolder,
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
    return NextResponse.json(uploadResult);
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// src/app/api/delete-image/route.js

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  // Parse the request body to get the public_id
  const body = await request.json();
  const { public_id } = body;

  if (!public_id) {
    return NextResponse.json(
      { error: "Public ID not provided." },
      { status: 400 }
    );
  }

  try {
    // Use the Cloudinary SDK to destroy (delete) the asset
    const deleteResult = await cloudinary.uploader.destroy(public_id);

    // Check the result from Cloudinary
    if (deleteResult.result !== "ok") {
      // This can happen if the public_id is not found
      throw new Error("Image not found or deletion failed.");
    }

    return NextResponse.json({ message: "Image deleted successfully." });
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

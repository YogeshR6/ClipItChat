// src/app/api/delete-image/route.js

import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { admin } from "../../../lib/firebaseAdmin";
import { headers } from "next/headers";

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function POST(request) {
  const headersList = headers();
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
  const body = await request.json();

  // Parse the request body to get the public_id
  const { public_id, folderName } = body;

  const uid = decodedToken.uid;

  if (!public_id) {
    return NextResponse.json(
      { error: "Public ID not provided." },
      { status: 400 }
    );
  }

  if (`${folderName}/${uid}/${public_id.split("/").pop()}` !== public_id) {
    return NextResponse.json(
      { error: "Unauthorized to delete this image." },
      { status: 403 }
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

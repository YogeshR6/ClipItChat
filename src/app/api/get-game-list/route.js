import { NextResponse } from "next/server";
import { admin } from "../../../lib/firebaseAdmin";
import { headers } from "next/headers";

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
  // The client will send the parameters to sign in the request body
  const body = await request.json();
  const { filterInput } = body;

  try {
    const responseWithNameFilter = await fetch(
      `https://www.giantbomb.com/api/games/?api_key=${process.env.NEXT_PUBLIC_GIANT_BOMB_API_KEY}&format=json&field_list=name,guid,id,image,aliases&limit=5&filter=name:${filterInput}`
    );
    const responseWithAliasesFilter = await fetch(
      `https://www.giantbomb.com/api/games/?api_key=${process.env.NEXT_PUBLIC_GIANT_BOMB_API_KEY}&format=json&field_list=name,guid,id,image,aliases&limit=5&filter=aliases:${filterInput}`
    );
    const dataWithNameFilter = await responseWithNameFilter.json();
    const dataWithAliasesFilter = await responseWithAliasesFilter.json();
    // Eliminate duplicates
    const data = [];
    const seen = new Set();

    dataWithNameFilter.results.forEach((item) => {
      if (!seen.has(item.guid)) {
        seen.add(item.guid);
        data.push(item);
      }
    });

    dataWithAliasesFilter.results.forEach((item) => {
      if (!seen.has(item.guid)) {
        seen.add(item.guid);
        data.push(item);
      }
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error fetching game categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch game categories" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(request) {
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

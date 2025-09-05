import { GameCategoryType } from "@/types/misc";
import { auth } from "@/utils/firebase";

export const getRelevanceScore = (game: GameCategoryType, query: string) => {
  const name = game.name.toLowerCase();
  const aliases = game.aliases ? game.aliases.toLowerCase() : "";
  const lowerQuery = query.toLowerCase();

  // Tier 1: Highest priority
  if (name.startsWith(lowerQuery)) {
    return 3;
  }
  // Check for exact alias matches like "GTA III", "GTA: SA", etc.
  if (
    aliases
      .split("\n")
      .some(
        (alias) =>
          alias.trim() === lowerQuery ||
          alias.trim().startsWith(lowerQuery + " ")
      )
  ) {
    return 3;
  }

  // Tier 2: Probable matches (whole word)
  const wholeWordRegex = new RegExp(`\\b${lowerQuery}\\b`);
  if (wholeWordRegex.test(name) || wholeWordRegex.test(aliases)) {
    return 2;
  }

  // Tier 3: Unlikely substring matches
  if (name.includes(lowerQuery)) {
    return 1;
  }

  // No match
  return 0;
};

export const getGameCategoriesList = async (
  searchInput: string
): Promise<GameCategoryType[] | Error> => {
  try {
    const getGameListResponse = await fetch("/api/get-game-list", {
      method: "POST",
      body: JSON.stringify({ filterInput: searchInput }),
    });
    const filteredGameList = await getGameListResponse.json();
    return filteredGameList.data.sort(
      (a: GameCategoryType, b: GameCategoryType) => {
        const scoreA = getRelevanceScore(a, searchInput);
        const scoreB = getRelevanceScore(b, searchInput);
        return scoreB - scoreA;
      }
    );
  } catch (error) {
    console.error("Error fetching game categories:", error);
    return error as Error;
  }
};

import { GameCategoryType } from "@/types/misc";

export type PostType = {
  createdAt: string;
  userUid: string;
  imageUrl: string;
  postUid: string;
  cloudinaryPublicId: string;
  selectedGame: GameCategoryType;
  likes: number;
};

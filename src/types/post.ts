import { GameCategoryType } from "@/types/misc";
import { Timestamp } from "firebase/firestore";

export type PostType = {
  createdAt: Timestamp;
  user: {
    id: string;
    username?: string;
  };
  imageUrl: string;
  postUid: string;
  cloudinaryPublicId: string;
  selectedGame: GameCategoryType;
  likes: number;
  comments?: CommentType[];
  postSize: number;
};

export type CommentType = {
  user: {
    id: string;
    username?: string;
  };
  comment: string;
  createdAt: Timestamp;
  commentUid: string;
};

import { GameCategoryType } from "@/types/misc";
import { Timestamp } from "firebase/firestore";

export type PostType = {
  createdAt: string;
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
  userUid: string;
  comment: string;
  createdAt: Timestamp;
  commentId: string;
};

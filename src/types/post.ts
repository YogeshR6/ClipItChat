import { GameCategoryType } from "@/types/misc";
import { UserType } from "@/types/user";
import { Timestamp } from "firebase/firestore";

export type PostType = {
  authorId: string;
  createdAt: Timestamp;
  user: UserType | null;
  imageUrl: string;
  postUid: string;
  cloudinaryPublicId: string;
  selectedGame: GameCategoryType;
  likes: number;
  comments?: CommentType[];
  postSize: number;
};

export type CommentType = {
  authorId: string;
  user: UserType;
  comment: string;
  createdAt: Timestamp;
  commentUid: string;
};

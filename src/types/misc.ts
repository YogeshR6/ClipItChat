export type GameCategoryType = {
  name: string;
  guid: string;
  id: string;
  image: {
    [key: string]: string;
  };
  aliases: string;
};

export type UploadPageErrorType = {
  missingFile: boolean;
  missingGame: boolean;
  storageLimit?: boolean;
  customMessage?: string;
} | null;

export type Tab = {
  title: string;
  value: string;
};

export type AuthFormType = "login" | "signup";

export type MyProfileSegmentTabsType =
  | "my-profile"
  | "my-post"
  | "my-liked-post";

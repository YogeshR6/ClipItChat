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
} | null;

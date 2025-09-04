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
} | null;

export type Tab = {
  title: string;
  value: string;
  content?: string | React.ReactNode | any;
};

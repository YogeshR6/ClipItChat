"use client";

import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { GameCategoryType, UploadPageErrorType } from "@/types/misc";
import { uploadUserPostImageToCloudinaryAndSaveInfoInFirestore } from "@/utils/cloudinaryFunctions";
import { getGameCategoriesList } from "@/utils/gameCategoryFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const UploadPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const gameSearchRef = useRef<HTMLInputElement>(null);

  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [gameCategoryList, setGameCategoryList] = useState<GameCategoryType[]>(
    []
  );
  const [gameSearchInput, setGameSearchInput] = useState<string>("");
  const [gameSearchLoading, setGameSearchLoading] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<GameCategoryType | null>(
    null
  );
  const [error, setError] = useState<UploadPageErrorType>(null);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchGameCategories();
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [gameSearchInput]);

  const fetchGameCategories = async () => {
    if (gameSearchInput.length > 2) {
      setGameSearchLoading(true);
      const categories = await getGameCategoriesList(gameSearchInput);
      if (!(categories instanceof Error)) {
        setGameCategoryList(categories);
        setGameSearchLoading(false);
        gameSearchRef.current?.focus();
      }
    } else {
      setGameCategoryList(selectedGame ? [selectedGame] : []);
      setGameSearchLoading(false);
      gameSearchRef.current?.focus();
    }
  };
  const handleFileUpload = (file: File[]) => {
    setUploadedFile(file[0]);
    setError(null);
  };

  const handleUserNewPostUpload = async () => {
    if (!uploadedFile || !selectedGame) {
      return setError({
        missingFile: !uploadedFile,
        missingGame: !selectedGame,
      });
    }
    if ((user.imageStorageUsed || 0) + uploadedFile.size / 1048576 > 100) {
      return setError({
        missingFile: !uploadedFile,
        missingGame: !selectedGame,
        storageLimit: true,
      });
    }
    if (user) {
      const newPostId =
        await uploadUserPostImageToCloudinaryAndSaveInfoInFirestore(
          uploadedFile,
          user.uid,
          selectedGame
        );
      router.push(`/posts/${newPostId}`);
    }
  };

  if (isLoggedIn === false) {
    return <></>;
  }

  if (user.imageStorageUsed && user.imageStorageUsed >= 100) {
    return <p>You have reached your image storage limit.</p>;
  }

  return (
    <div className="flex flex-col w-full justify-start items-center gap-5">
      <h2>Upload Page</h2>
      <div className="w-[50%] border-2">
        {uploadedFile ? (
          <div>
            <h3>Uploaded File:</h3>
            <p>{uploadedFile.size}</p>
            <Image
              src={URL.createObjectURL(uploadedFile)}
              alt="Uploaded"
              width={200}
              height={200}
            />
          </div>
        ) : (
          <FileUpload onChange={handleFileUpload} />
        )}
      </div>
      <div className="flex flex-row gap-5 justify-center items-center">
        <p>Select Category</p>
        <Select
          value={selectedGame?.guid || ""}
          onValueChange={(value) => {
            const game = gameCategoryList.find((g) => g.guid === value);
            setError(null);
            setSelectedGame(game || null);
          }}
          onOpenChange={(open) => {
            if (open) {
              setGameSearchInput("");
              setGameCategoryList([]);
            }
          }}
        >
          <SelectTrigger
            className={`w-[180px] ${
              error?.missingGame ? "border-red-500 border-2" : ""
            }`}
          >
            <SelectValue placeholder="Select a game">
              {selectedGame?.name}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>
                <Input
                  placeholder="Search categories..."
                  value={gameSearchInput}
                  onChange={(e) => setGameSearchInput(e.target.value)}
                  autoFocus
                  ref={gameSearchRef}
                />
              </SelectLabel>
              <SelectLabel>Results</SelectLabel>
              {gameSearchLoading ? (
                <p>Loading...</p>
              ) : (
                gameCategoryList.map((category) => (
                  <SelectItem value={category.guid} key={category.guid}>
                    <div className="flex flex-row gap-3 items-center justify-center">
                      <Image
                        src={category.image["medium_url"]}
                        alt={category.name}
                        width={40}
                        height={40}
                      />
                      <h3>{category.name}</h3>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {error && (
        <p className="text-red-500">Please upload a file and select a game.</p>
      )}
      {error?.storageLimit && (
        <p className="text-red-500">
          You have reached your image storage limit.
        </p>
      )}
      <div className="flex flex-row gap-5">
        <Button type="button" onClick={() => setUploadedFile(null)}>
          Cancel
        </Button>
        <Button
          onClick={handleUserNewPostUpload}
          variant="outline"
          type="submit"
        >
          Save
        </Button>
      </div>
    </div>
  );
};

export default UploadPage;

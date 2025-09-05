import React, { useEffect, useRef, useState } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import { PostType } from "@/types/post";
import {
  getFirstPagePostsListResultUsingLimit,
  getFirstPagePostsListResultUsingLimitAndGameFilter,
} from "@/utils/postFunctions";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IoFilter } from "react-icons/io5";
import { Input } from "@/components/ui/input";
import { GameCategoryType } from "@/types/misc";
import { getGameCategoriesList } from "@/utils/gameCategoryFunctions";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";

function PostsListPage() {
  const router = useRouter();
  const gameSearchRef = useRef<HTMLInputElement>(null);

  const [postsList, setPostsList] = useState<PostType[] | null>(null);
  const [gameSearchInput, setGameSearchInput] = useState<string>("");
  const [gameSearchLoading, setGameSearchLoading] = useState<boolean>(false);
  const [selectedGames, setSelectedGames] = useState<GameCategoryType[] | null>(
    null
  );
  const [gameCategoryList, setGameCategoryList] = useState<GameCategoryType[]>(
    []
  );

  useEffect(() => {
    if (selectedGames && selectedGames.length > 0) {
      getFirstPagePostsListUsingFilter();
    } else {
      getFirstPagePostsList();
    }
  }, [selectedGames]);

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
      setGameCategoryList(selectedGames ? selectedGames : []);
      setGameSearchLoading(false);
      gameSearchRef.current?.focus();
    }
  };

  const getFirstPagePostsListUsingFilter = async () => {
    const gameFilterList = selectedGames?.map((game) => game.guid);
    const firstPageResultsWithFilter =
      await getFirstPagePostsListResultUsingLimitAndGameFilter(
        10,
        gameFilterList || []
      );
    if (!(firstPageResultsWithFilter instanceof Error)) {
      setPostsList(firstPageResultsWithFilter);
    }
  };

  const getFirstPagePostsList = async () => {
    const firstPageResults = await getFirstPagePostsListResultUsingLimit(10);
    if (!(firstPageResults instanceof Error)) {
      setPostsList(firstPageResults);
    }
  };

  const handleCardClick = (postUid: string) => {
    router.push(`/posts/${postUid}`);
  };

  return (
    <div className="p-2 flex flex-col gap-5 mb-5">
      <DropdownMenu
        onOpenChange={(open) => {
          if (open) {
            setGameSearchInput("");
            setGameCategoryList(selectedGames ? selectedGames : []);
          }
        }}
      >
        <DropdownMenuTrigger className="flex flex-row gap-2 items-center justify-center p-2 border border-white ml-8 w-max rounded-2xl">
          <IoFilter /> Filter Posts
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom" align="start" className="max-w-64">
          <DropdownMenuLabel>
            <Input
              placeholder="Search categories..."
              value={gameSearchInput}
              onChange={(e) => setGameSearchInput(e.target.value)}
              autoFocus
              ref={gameSearchRef}
            />
          </DropdownMenuLabel>
          <DropdownMenuLabel>Filter Games</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {gameSearchLoading ? (
            <p>Loading..</p>
          ) : (
            gameCategoryList.map((game) => (
              <DropdownMenuCheckboxItem
                checked={
                  selectedGames?.some((g) => g.guid === game.guid) || false
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedGames((prev) =>
                      prev ? [...prev, game] : [game]
                    );
                  } else {
                    setSelectedGames((prev) =>
                      prev ? prev.filter((g) => g.guid !== game.guid) : null
                    );
                  }
                }}
                key={game.guid}
              >
                <div className="flex flex-row gap-3 items-center justify-between">
                  <Image
                    src={game.image["medium_url"]}
                    alt={game.name}
                    width={40}
                    height={40}
                  />
                  <h3>{game.name}</h3>
                </div>
              </DropdownMenuCheckboxItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <div className="flex flex-row items-center justify-start ml-8 gap-3">
        {selectedGames &&
          selectedGames.length > 0 &&
          selectedGames.map((game) => (
            <div
              key={game.guid}
              className="border rounded-full p-2 flex flex-row gap-2 items-center justify-center"
            >
              {game.name}
              <IoClose
                className="cursor-pointer hover:bg-[#000000] rounded-full"
                size="20"
                onClick={() => {
                  setSelectedGames((prev) =>
                    prev ? prev.filter((g) => g.guid !== game.guid) : null
                  );
                }}
              />
            </div>
          ))}
      </div>
      {postsList && (
        <>
          <FocusCards cards={postsList} onCardClick={handleCardClick} />
          {postsList.length >= 10 && (
            <Button
              variant="outline"
              className="w-max self-center bg-transparent"
              onClick={() => {}}
            >
              Load More
            </Button>
          )}
        </>
      )}
    </div>
  );
}

export default PostsListPage;

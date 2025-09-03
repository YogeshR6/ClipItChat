"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getFirstPagePostsListResultUsingLimit } from "@/utils/postFunctions";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";
import { useRouter } from "next/navigation";
import { PostType } from "@/types/post";
const HomePage = () => {
  const router = useRouter();

  const [homePageCardsList, setHomePageCardsList] = useState<PostType[]>([]);

  useEffect(() => {
    getHomePageCards();
  }, []);

  const getHomePageCards = async () => {
    const getPostListsResponse = await getFirstPagePostsListResultUsingLimit(
      10
    );
    if (!(getPostListsResponse instanceof Error)) {
      setHomePageCardsList(getPostListsResponse);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center px-10 py-5 gap-10">
      <div className="flex flex-col gap-5 max-w-2xl text-center justify-center items-center">
        <h1 className="text-4xl font-semibold tracking-tight">
          Share Your Epic Gaming Moments
        </h1>
        <h2 className="text-2xl tracking-tight">
          Upload screenshots, connect with fellow gamers, and relive thrills!
          Welcome to ClipItChat!
        </h2>
        <Button variant="default" className="w-max">
          Start Sharing Now!
        </Button>
      </div>
      <Separator />
      <div className="flex flex-col items-start justify-center gap-5 w-full">
        <h1 className="text-3xl font-semibold tracking-tight">Latest Posts</h1>
        {homePageCardsList && (
          <>
            <div className="flex flex-wrap w-full gap-10 items-center justify-center">
              {homePageCardsList.map((card) => (
                <DirectionAwareHover
                  imageUrl={card.imageUrl}
                  key={card.postUid}
                  onClick={() => router.push(`/posts/${card.postUid}`)}
                  className="cursor-pointer"
                >
                  <p className="font-bold text-xl">{card.selectedGame.name}</p>
                  <p className="font-normal text-sm">{card.user.username}</p>
                </DirectionAwareHover>
              ))}
            </div>
            <Button
              variant="default"
              className="w-max self-center"
              onClick={() => {
                router.push("/posts");
              }}
            >
              Load More
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;

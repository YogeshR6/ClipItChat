"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { getFirstPagePostsListResultUsingLimit } from "@/utils/postFunctions";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";
import { useRouter } from "next/navigation";
import { PostType } from "@/types/post";
import { Cover } from "@/components/ui/cover";
import { CgProfile } from "react-icons/cg";

const HomePage = () => {
  const router = useRouter();

  const [homePageCardsList, setHomePageCardsList] = useState<PostType[]>([]);

  useEffect(() => {
    getHomePageCards();
  }, []);

  const getHomePageCards = async () => {
    const getPostListsResponse = await getFirstPagePostsListResultUsingLimit(5);
    if (!(getPostListsResponse instanceof Error)) {
      setHomePageCardsList(getPostListsResponse);
    }
  };

  return (
    <div className="w-full flex flex-col justify-center items-center gap-10 relative pb-10">
      <div
        style={{
          backgroundImage: 'url("/background/wide_grid.jpg")',
          position: "relative",
          width: "100%",
          height: "550px",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className="flex justify-center items-center"
      >
        <div className="flex flex-col gap-5 max-w-2xl text-center justify-center items-center text-white">
          <h1 className="text-4xl font-semibold tracking-tight">
            Share Your Epic{" "}
            <Cover
              mainDivClassName="bg-transparent hover:bg-transparent"
              className="text-white"
            >
              Gaming Moments
            </Cover>
          </h1>
          <h2 className="text-2xl tracking-tight">
            Upload screenshots, connect with fellow gamers, and relive thrills!
            Welcome to ClipItChat!
          </h2>
          <MovingBorderButton
            variant="default"
            className="text-base bg-slate-900/[0.4] hover:bg-slate-900/[0.8]"
            onClick={() => router.push("/upload")}
          >
            Start Sharing Now!
          </MovingBorderButton>
        </div>
      </div>
      <div className="flex flex-col items-start justify-center gap-5 w-full px-10">
        <h1 className="text-3xl font-semibold tracking-tight">Latest Posts</h1>
        {homePageCardsList && (
          <>
            <div className="flex flex-wrap w-full gap-10 items-center justify-start">
              {homePageCardsList.map((card) => (
                <DirectionAwareHover
                  imageUrl={card.imageUrl}
                  key={card.postUid}
                  onClick={() => router.push(`/posts/${card.postUid}`)}
                  className="cursor-pointer"
                >
                  <p className="font-bold text-xl">{card.selectedGame.name}</p>
                  <div className="flex flex-row items-center justify-start gap-1">
                    <CgProfile className="text-white" />
                    <p className="font-normal text-sm">{card.user.username}</p>
                  </div>
                </DirectionAwareHover>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-max self-center bg-transparent"
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

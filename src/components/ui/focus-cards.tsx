"use client";
import Image from "next/image";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { PostType } from "@/types/post";
import {
  FaRegHeart,
  FaRegComment,
  FaHeart,
  FaComments,
  FaComment,
} from "react-icons/fa";
import { CgProfile } from "react-icons/cg";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    onCardClick,
  }: {
    card: PostType;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    onCardClick: (postUid: string) => void;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-lg relative bg-gray-100 dark:bg-neutral-900 overflow-hidden h-60 md:h-96 w-full transition-all duration-300 ease-out cursor-pointer",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
      onClick={() => onCardClick(card.postUid)}
    >
      <Image
        src={card.imageUrl}
        alt={card.user.id}
        fill
        className="object-cover absolute inset-0"
      />
      <div
        className={cn(
          "absolute inset-0 bg-black/50 flex flex-col items-start justify-end gap-3 py-8 px-4 transition-opacity duration-300",
          hovered === index ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200">
          {card.selectedGame.name}
        </div>
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200 flex flex-row items-center justify-start gap-2">
          <CgProfile className="text-white" />
          {card.user.username}
        </div>
        <div className="text-xl md:text-2xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-200 flex flex-row items-center justify-start gap-5">
          <div className="flex flex-row items-center justify-start gap-2">
            {card.likes > 0 ? (
              <FaHeart className="text-red-600" size="22" />
            ) : (
              <FaRegHeart className="text-white" size="22" />
            )}{" "}
            {card.likes || 0}
          </div>
          <div className="flex flex-row items-center justify-start gap-2">
            {!card.comments?.length || card.comments?.length === 0 ? (
              <FaRegComment className="text-white" size="22" />
            ) : card.comments?.length === 1 ? (
              <FaComment className="text-white" size="22" />
            ) : (
              <FaComments className="text-white" size="22" />
            )}
            {card.comments?.length || 0}
          </div>
        </div>
      </div>
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
};

export function FocusCards({
  cards,
  onCardClick,
}: {
  cards: PostType[];
  onCardClick: (postUid: string) => void;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.postUid}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          onCardClick={onCardClick}
        />
      ))}
    </div>
  );
}

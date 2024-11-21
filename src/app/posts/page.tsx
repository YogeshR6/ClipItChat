import { FocusCards } from "@/components/ui/focus-cards";
import React from "react";

const dummyCards = [
  {
    src: "/test.png",
    title: "Card 1",
  },
  {
    src: "/test2.png",
    title: "Card 2",
  },
];

const page: React.FC = () => {
  return (
    <>
      <h1>This is Posts Page!!</h1>
      <FocusCards cards={dummyCards}/>
    </>
  );
};

export default page;
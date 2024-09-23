import { FocusCards } from "@/components/ui/focus-cards";

const PostsCards: React.FC = () => {
  const cards = [
    {
      src: "/test.png",
      title: "Card 1",
    },
    {
      src: "/test2.png",
      title: "Card 2",
    },
  ];
  return <FocusCards cards={cards} />;
};

export default PostsCards;

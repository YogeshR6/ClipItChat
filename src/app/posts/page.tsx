import React from "react";
import PostsCards from "@/components/PostsCards";

const PostsPage: React.FC = () => {
  return (
    <div className="w-full">
      <h1>This is Posts Page!!</h1>
      <PostsCards />
    </div>
  );
};

export default PostsPage;

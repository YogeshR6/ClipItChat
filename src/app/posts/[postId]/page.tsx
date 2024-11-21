import React from "react";
import { useParams } from "next/navigation";

const page: React.FC = () => {
    const { postId } = useParams();
  return (
    <>
      <h1>This is Individual Post Page!!</h1>
        <h2>Post ID: {postId}</h2>
    </>
  );
};

export default page;
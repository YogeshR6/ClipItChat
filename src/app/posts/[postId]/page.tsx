import React from "react";
import { useParams } from "next/navigation";

const page: React.FC = () => {
  const params = useParams() as Record<string, string | undefined>;
  const postId = params?.postId;
  return (
    <>
      <h1>This is Individual Post Page!!</h1>
      <h2>Post ID: {postId ?? "Unknown"}</h2>
    </>
  );
};

export default page;

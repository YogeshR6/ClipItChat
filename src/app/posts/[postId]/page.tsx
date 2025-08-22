import React from "react";
import { useParams } from "next/navigation";
import ViewPostPage from "@/pages/ViewPostPage";

const page: React.FC = () => {
  const params = useParams() as Record<string, string | undefined>;
  const postId = params?.postId;
  return (
    <>
      <ViewPostPage postId={postId ?? ""} />
    </>
  );
};

export default page;

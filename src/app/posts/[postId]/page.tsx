"use client";

import { useParams } from "next/navigation";
import React from "react";
import Image from "next/image";

const PostPage: React.FC = () => {
  const { postId } = useParams();
  return (
    <div>
      <Image src="/test.png" alt="Card 1" fill />
    </div>
  );
};

export default PostPage;

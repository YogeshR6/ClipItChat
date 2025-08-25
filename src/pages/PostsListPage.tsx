import React, { useEffect, useState } from "react";
import { FocusCards } from "@/components/ui/focus-cards";
import { PostType } from "@/types/post";
import { getFirstPagePostsListResultUsingLimit } from "@/utils/postFunctions";
import { useRouter } from "next/navigation";

function PostsListPage() {
  const router = useRouter();

  const [postsList, setPostsList] = useState<PostType[] | null>(null);

  useEffect(() => {
    getFirstPagePostsList();
  }, []);

  const getFirstPagePostsList = async () => {
    const firstPageResults = await getFirstPagePostsListResultUsingLimit(10);
    if (!(firstPageResults instanceof Error)) {
      setPostsList(firstPageResults);
    }
  };

  const handleCardClick = (postUid: string) => {
    router.push(`/posts/${postUid}`);
  };

  return (
    <div>
      <p>Public Posts</p>
      {postsList && (
        <FocusCards cards={postsList} onCardClick={handleCardClick} />
      )}
    </div>
  );
}

export default PostsListPage;

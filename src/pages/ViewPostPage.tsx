import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { PostType } from "@/types/post";
import {
  deletePostById,
  getPostDataByUid,
  userLikePost,
  userUnlikePost,
} from "@/utils/postFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ViewPostPageProps {
  postId: string;
}

const ViewPostPage: React.FC<ViewPostPageProps> = ({ postId }) => {
  const { isLoggedIn, user, setUser } = useAuth();
  const router = useRouter();

  const [postData, setPostData] = useState<PostType | null>(null);

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    fetchPostData(postId);
  }, [postId]);

  const fetchPostData = async (postId: string) => {
    const postData = await getPostDataByUid(postId);
    if (!(postData instanceof Error)) setPostData(postData);
  };

  const handleDeletePost = async (postData: PostType) => {
    await deletePostById(postData);
    router.push("/");
  };

  const handleUserLikePost = async () => {
    if (postData && user) {
      if (user.likedPosts?.includes(postId)) {
        await userUnlikePost(postData, user.uid);
        // Optimistically update the UI
        setPostData((prevData) => {
          if (prevData) {
            return { ...prevData, likes: prevData.likes - 1 };
          }
          return prevData;
        });
        setUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              likedPosts: prevUser.likedPosts?.filter((id) => id !== postId),
            };
          }
          return prevUser;
        });
      } else {
        await userLikePost(postData, user.uid);
        // Optimistically update the UI
        setPostData((prevData) => {
          if (prevData) {
            return { ...prevData, likes: prevData.likes + 1 };
          }
          return prevData;
        });
        setUser((prevUser) => {
          if (prevUser) {
            return {
              ...prevUser,
              likedPosts: [...(prevUser.likedPosts ?? []), postId],
            };
          }
          return prevUser;
        });
      }
    }
  };

  if (isLoggedIn === false) {
    return <></>;
  }

  return (
    <div className="flex flex-col justify-center items-center gap-5 p-5">
      <h1>View Post Page</h1>
      <p>Post ID: {postId}</p>
      {postData && (
        <>
          <Image
            src={postData.imageUrl}
            alt="Post Image"
            width={200}
            height={200}
            className="border border-black"
          />
          <p>Category: {postData.selectedGame.name}</p>
          <Button
            variant={
              user.likedPosts?.includes(postId) ? "destructive" : "outline"
            }
            onClick={handleUserLikePost}
          >
            {postData.likes} Likes
          </Button>

          <Button
            onClick={() => handleDeletePost(postData)}
            variant="destructive"
            type="button"
          >
            Delete
          </Button>
        </>
      )}
    </div>
  );
};

export default ViewPostPage;

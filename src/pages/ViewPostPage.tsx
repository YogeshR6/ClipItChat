import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { PostType } from "@/types/post";
import { deletePostById, getPostDataByUid } from "@/utils/postFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ViewPostPageProps {
  postId: string;
}

const ViewPostPage: React.FC<ViewPostPageProps> = ({ postId }) => {
  const { isLoggedIn } = useAuth();
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

  if (isLoggedIn === false) {
    return <></>;
  }

  return (
    <div>
      <h1>View Post Page</h1>
      <p>Post ID: {postId}</p>
      {postData && (
        <div>
          <Image
            src={postData.imageUrl}
            alt="Post Image"
            width={200}
            height={200}
          />
          <p>User ID: {postData.userUid}</p>
          <Button
            onClick={() => handleDeletePost(postData)}
            variant="destructive"
            type="button"
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default ViewPostPage;

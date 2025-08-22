import { useAuth } from "@/hooks/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ViewPostPageProps {
  postId: string;
}

const ViewPostPage: React.FC<ViewPostPageProps> = ({ postId }) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  if (!isLoggedIn) {
    return <></>;
  }

  return (
    <div>
      <h1>View Post Page</h1>
      <p>Post ID: {postId}</p>
    </div>
  );
};

export default ViewPostPage;

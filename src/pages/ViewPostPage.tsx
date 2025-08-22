import { useAuth } from "@/hooks/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ViewPostPageProps {
  postId: string;
}

const ViewPostPage: React.FC<ViewPostPageProps> = ({ postId }) => {
  const { isLoggedIn } = useAuth();
  const router = useRouter();

  if (!isLoggedIn) {
    router.push("/auth");
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

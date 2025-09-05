import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { CommentType, PostType } from "@/types/post";
import {
  addUserCommentOnPost,
  deleteCommentFromPost,
  deletePostById,
  getPostDataByUid,
  userLikePost,
  userUnlikePost,
} from "@/utils/postFunctions";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { toast } from "sonner";

interface ViewPostPageProps {
  postId: string;
}

const ViewPostPage: React.FC<ViewPostPageProps> = ({ postId }) => {
  const { isLoggedIn, user, setUser } = useAuth();
  const router = useRouter();

  const [postData, setPostData] = useState<PostType | null>(null);
  const [newComment, setNewComment] = useState<string>("");

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
    if (isLoggedIn === false) {
      toast.error("You need to be logged in to like a post.", {
        duration: 4000,
        closeButton: true,
        action: {
          label: "Login",
          onClick: () => {
            router.push("/auth");
          },
        },
      });
      return;
    }
    if (postData && user && user.uid) {
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

  const handleAddComment = async () => {
    if (isLoggedIn === false) {
      toast.error("You need to be logged in to comment.", {
        duration: 4000,
        closeButton: true,
        action: {
          label: "Login",
          onClick: () => {
            router.push("/auth");
          },
        },
      });
      return;
    }
    if (newComment.trim() === "" || !postData || !user) return;

    const addUserCommentResponse = await addUserCommentOnPost(
      postData,
      {
        id: user.uid,
        username: user.username || "",
      },
      newComment.trim()
    );
    if (!(addUserCommentResponse instanceof Error)) {
      setNewComment("");
      setPostData((prevData) => {
        if (prevData) {
          return {
            ...prevData,
            comments: [
              ...(prevData.comments || []),
              {
                user: {
                  id: user.uid,
                  username: user.username || "",
                },
                comment: newComment.trim(),
                createdAt: Timestamp.now(),
                commentUid: addUserCommentResponse,
              },
            ],
          };
        }
        return prevData;
      });
    }
  };

  const handleDeleteComment = async (commentToRemove: CommentType) => {
    if (!postData || !user) return;
    await deleteCommentFromPost(postData, commentToRemove);
    setPostData((prevData) => {
      if (prevData) {
        return {
          ...prevData,
          comments: prevData.comments?.filter(
            (c) => c.commentUid !== commentToRemove.commentUid
          ),
        };
      }
      return prevData;
    });
  };

  return (
    <div className="flex flex-row gap-4 items-start justify-center p-5">
      <div className="flex flex-col justify-center items-center gap-5 px-5">
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
            <div className="flex flex-row gap-4 items-center justify-center">
              <Button
                variant={
                  user.likedPosts?.includes(postId) ? "destructive" : "outline"
                }
                onClick={handleUserLikePost}
              >
                {postData.likes} Likes
              </Button>

              {user.uid === postData.user.id && (
                <Button
                  onClick={() => handleDeletePost(postData)}
                  variant="destructive"
                  type="button"
                >
                  Delete
                </Button>
              )}
            </div>
          </>
        )}
      </div>
      <div className="flex flex-col items-start justify-start gap-5">
        <p>Comments</p>
        <div className="flex flex-row gap-2 items-center justify-start">
          <Input
            placeholder="Add comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button type="submit" variant="outline" onClick={handleAddComment}>
            <IoMdSend />
          </Button>
        </div>
        <div className="flex flex-col items-start justify-start gap-3">
          {postData?.comments?.map((comment) => (
            <div
              key={comment.commentUid}
              className="border-b border-gray-300 py-2 flex flex-row justify-center items-start"
            >
              <div>
                <p className="font-semibold">{comment.user.username || ""}</p>
                <p>{comment.comment}</p>
                <p>
                  {comment.createdAt.toDate().toLocaleString("us-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  })}
                </p>
              </div>
              {user.uid === comment.user.id && (
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteComment(comment)}
                >
                  <MdDelete />
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewPostPage;

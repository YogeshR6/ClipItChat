import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { formatTimeAgo } from "@/lib/utils";
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
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  FaComment,
  FaComments,
  FaHeart,
  FaRegComment,
  FaRegHeart,
} from "react-icons/fa";
import { IoMdSend } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { toast } from "sonner";

interface ViewPostPageProps {
  postId: string;
}

const ViewPostPage: React.FC<ViewPostPageProps> = ({ postId }) => {
  const { isLoggedIn, user, setUser } = useAuth();
  const router = useRouter();

  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const [postData, setPostData] = useState<PostType | null>(null);
  const [newComment, setNewComment] = useState<string>("");
  const [showDeletePostConfirmationPopup, setShowDeletePostConfirmationPopup] =
    useState<boolean>(false);
  const [deletePostStatus, setDeletePostStatus] = useState<
    "idle" | "deleting" | "deleted"
  >("idle");
  const [
    showDeleteCommentConfirmationPopup,
    setShowDeleteCommentConfirmationPopup,
  ] = useState<{
    popupOpen: boolean;
    commentToBeDeleted?: CommentType;
  } | null>(null);

  useEffect(() => {
    fetchPostData(postId);
  }, [postId]);

  const fetchPostData = async (postId: string) => {
    const postData = await getPostDataByUid(postId);
    if (!(postData instanceof Error)) setPostData(postData);
  };

  const handleDeletePost = async () => {
    if (postData && deletePostStatus === "idle") {
      setDeletePostStatus("deleting");
      const deletePostResponse = await deletePostById(postData);
      if (!(deletePostResponse instanceof Error)) {
        setDeletePostStatus("deleted");
        router.prefetch("/");
        toast.success("Post deleted successfully!", {
          duration: 1500,
          closeButton: true,
        });
        setTimeout(() => {
          router.push("/");
          setDeletePostStatus("idle");
        }, 500);
      }
    }
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

  const handleDeleteComment = async () => {
    if (
      postData &&
      user &&
      showDeleteCommentConfirmationPopup?.commentToBeDeleted &&
      deletePostStatus === "idle"
    ) {
      setDeletePostStatus("deleting");
      const deleteCommentResponse = await deleteCommentFromPost(
        postData,
        showDeleteCommentConfirmationPopup.commentToBeDeleted
      );
      if (!(deleteCommentResponse instanceof Error)) {
        setDeletePostStatus("deleted");
        setPostData((prevData) => {
          if (prevData) {
            return {
              ...prevData,
              comments: prevData.comments?.filter(
                (c) =>
                  c.commentUid !==
                  showDeleteCommentConfirmationPopup.commentToBeDeleted
                    ?.commentUid
              ),
            };
          }
          return prevData;
        });
        toast.success("Comment deleted successfully!", {
          duration: 1500,
          closeButton: true,
        });
        setTimeout(() => {
          setShowDeleteCommentConfirmationPopup(null);
          setDeletePostStatus("idle");
        }, 500);
      }
    }
  };

  const handleUserClickCommentIcon = () => {
    if (commentInputRef && commentInputRef.current) {
      commentInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      commentInputRef.current.focus();
    }
  };

  const copyGameCategoryToClipBoard = (searchText: string) => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(searchText)
        .then(() => {
          toast.success("Game name copied to clipboard!", {
            duration: 1500,
            closeButton: true,
          });
        })
        .catch(() => {
          toast.error("Something went wrong! Please try again later!", {
            duration: 1500,
            closeButton: true,
          });
        });
    }
  };

  return (
    <>
      <div className="flex items-center justify-center px-5 mb-10">
        <div className="flex flex-col gap-4 items-start justify-center max-w-[1200px] w-full">
          {postData && (
            <>
              <Image
                src={postData.imageUrl}
                alt="Post Image"
                width={1920}
                height={1080}
                className="border border-black w-full self-center"
              />
              <div className="flex flex-row w-full justify-between items-start">
                <div className="flex-1 flex flex-col items-start justify-start gap-4">
                  <div className="flex flex-row gap-2 items-center justify-center border-2 border-white rounded-xl py-1 px-2">
                    <div
                      onClick={handleUserLikePost}
                      className="text-white bg-transparent cursor-pointer flex flex-row items-center justify-center text-3xl gap-1 hover:bg-[#4b5085] px-2 rounded-xl"
                    >
                      {user.likedPosts?.includes(postId) ? (
                        <FaHeart className="text-red-600" size="28" />
                      ) : (
                        <FaRegHeart className="text-white" size="28" />
                      )}
                      {postData.likes}
                    </div>
                    <div
                      onClick={handleUserClickCommentIcon}
                      className="text-white bg-transparent cursor-pointer flex flex-row items-center justify-center text-3xl gap-1 hover:bg-[#4b5085] px-2 rounded-xl"
                    >
                      {!postData.comments?.length ||
                      postData.comments?.length === 0 ? (
                        <FaRegComment className="text-white" size="28" />
                      ) : postData.comments?.length === 1 ? (
                        <FaComment className="text-white" size="28" />
                      ) : (
                        <FaComments className="text-white" size="28" />
                      )}
                      {postData.comments?.length || 0}
                    </div>
                  </div>
                  {user.uid === postData.user.id && (
                    <Button
                      onClick={() => setShowDeletePostConfirmationPopup(true)}
                      variant="destructive"
                      type="button"
                      className="text-white px-2"
                    >
                      <MdDelete />
                      Delete Post
                    </Button>
                  )}
                  <p className="text-2xl">Comments</p>
                  <div className="flex flex-row gap-2 items-center justify-start">
                    <Input
                      placeholder="Add comment"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      ref={commentInputRef}
                      className="placeholder:text-white border-2"
                    />
                    <Button
                      type="submit"
                      variant="outline"
                      onClick={handleAddComment}
                      className="text-white bg-[#4b5085] hover:bg-[#35385e] border-[#4b5085]"
                      size="icon"
                    >
                      <IoMdSend />
                    </Button>
                  </div>
                  <div className="flex flex-col items-start justify-start gap-3 w-full">
                    {postData?.comments?.map((comment) => (
                      <React.Fragment key={comment.commentUid}>
                        <div className="bg-[#4b5085] rounded-xl flex flex-col justify-center items-start px-3 py-2 w-full">
                          <p className="font-semibold text-xl flex flex-row items-center justify-between w-full">
                            {comment.user.username || "Anonymous"}
                            {user.uid === comment.user.id && (
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() =>
                                  setShowDeleteCommentConfirmationPopup({
                                    popupOpen: true,
                                    commentToBeDeleted: comment,
                                  })
                                }
                              >
                                <MdDelete />
                              </Button>
                            )}
                          </p>
                          <p className="text-lg flex flex-row items-center justify-between w-full">
                            {comment.comment}
                            <span className="text-sm">
                              {formatTimeAgo(comment.createdAt.toDate())}
                            </span>
                          </p>
                        </div>
                        <Separator orientation="horizontal" decorative />
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="flex flex-row items-center justify-center gap-1 border-2 border-white rounded-xl py-1 px-2">
                  <Image
                    src={postData.selectedGame.image["medium_url"]}
                    width={70}
                    height={70}
                    alt={postData.selectedGame.name}
                    className="cursor-pointer"
                    onClick={() =>
                      copyGameCategoryToClipBoard(postData.selectedGame.name)
                    }
                  />
                  <div className="flex flex-col items-start justify-between gap-1 pl-2">
                    <p className="text-2xl">Category:</p>
                    <p
                      className="text-2xl cursor-pointer"
                      onClick={() =>
                        copyGameCategoryToClipBoard(postData.selectedGame.name)
                      }
                    >
                      {postData.selectedGame.name}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Dialog
        open={showDeletePostConfirmationPopup}
        onOpenChange={setShowDeletePostConfirmationPopup}
      >
        <DialogContent
          className="[&>button>svg]:text-black"
          onPointerDownOutside={(event) => {
            if (deletePostStatus !== "idle") {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (deletePostStatus !== "idle") {
              event.preventDefault();
            }
          }}
          showCloseButton={deletePostStatus === "idle"}
        >
          <DialogHeader>
            <DialogTitle className="text-black mb-2">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-black">
              Are you sure you want to delete your post? This action can't be
              undone!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="text-black"
                onClick={() => setShowDeletePostConfirmationPopup(false)}
                variant="outline"
                disabled={deletePostStatus !== "idle"}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeletePost}
              variant="destructive"
              style={{
                cursor: deletePostStatus !== "idle" ? "not-allowed" : "pointer",
              }}
            >
              {deletePostStatus === "idle" ? (
                "Delete Post"
              ) : deletePostStatus === "deleting" ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <p>Deleting..</p>
                </>
              ) : (
                <>
                  <MdDelete />
                  <p>Post Deleted!</p>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showDeleteCommentConfirmationPopup?.popupOpen}
        onOpenChange={(open) =>
          setShowDeleteCommentConfirmationPopup((prev) => ({
            ...prev,
            popupOpen: open,
          }))
        }
      >
        <DialogContent
          className="[&>button>svg]:text-black"
          onPointerDownOutside={(event) => {
            if (deletePostStatus !== "idle") {
              event.preventDefault();
            }
          }}
          onEscapeKeyDown={(event) => {
            if (deletePostStatus !== "idle") {
              event.preventDefault();
            }
          }}
          showCloseButton={deletePostStatus === "idle"}
        >
          <DialogHeader>
            <DialogTitle className="text-black mb-2">
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-black">
              Are you sure you want to delete your comment? This action can't be
              undone!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="text-black"
                onClick={() => setShowDeleteCommentConfirmationPopup(null)}
                variant="outline"
                disabled={deletePostStatus !== "idle"}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleDeleteComment}
              variant="destructive"
              style={{
                cursor: deletePostStatus !== "idle" ? "not-allowed" : "pointer",
              }}
            >
              {deletePostStatus === "idle" ? (
                "Delete Comment"
              ) : deletePostStatus === "deleting" ? (
                <>
                  <AiOutlineLoading3Quarters className="animate-spin" />
                  <p>Deleting..</p>
                </>
              ) : (
                <>
                  <MdDelete />
                  <p>Comment Deleted!</p>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ViewPostPage;

"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Label } from "@/components/ui/label";
import { MyProfileSegmentControl } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { MyProfileSegmentTabsType } from "@/types/misc";
import { PostType } from "@/types/post";
import { UserType } from "@/types/user";
import { uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore } from "@/utils/cloudinaryFunctions";
import {
  getAllLikedPostsDataByUserUid,
  getAllPostsDataByUserUid,
  updateCommentUsernames,
  updatePostUsernames,
} from "@/utils/postFunctions";
import {
  removeUserProfilePic,
  updateUserDetailsInFirestore,
} from "@/utils/userFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, {
  SyntheticEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { IoClose } from "react-icons/io5";
import { VscAccount } from "react-icons/vsc";
import ReactCrop, { centerCrop, Crop, makeAspectCrop } from "react-image-crop";
import { toast } from "sonner";
import {
  FaComment,
  FaComments,
  FaHeart,
  FaRegComment,
  FaRegHeart,
} from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IoWarning } from "react-icons/io5";
import {
  reauthenticateUserSignInWithEmailAndPassword,
  reauthenticateUserSignInWithGoogle,
} from "@/utils/authFunctions";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Separator } from "@/components/ui/separator";

const MyProfileSegmentControlTabs = [
  { title: "Edit Profile", value: "my-profile" },
  { title: "My Posts", value: "my-post" },
  { title: "My Liked Posts", value: "my-liked-post" },
];

function MyProfilePage() {
  const { user, setUser, isLoggedIn } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isUserEditingDetails, setIsUserEditingDetails] =
    useState<boolean>(false);
  const [updatedUserDetails, setUpdatedUserDetails] = useState<
    Partial<UserType>
  >({});
  const [userPostList, setUserPostList] = useState<PostType[] | null>(null);
  const [userLikedPostList, setUserLikedPostList] = useState<PostType[] | null>(
    null
  );
  const [activeSegmentTab, setActiveSegmentTab] =
    useState<MyProfileSegmentTabsType>("my-profile");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [showImageCropPopup, setShowImageCropPopup] = useState<boolean>(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const [uploadUserDataLoading, setUploadUserDataLoading] =
    useState<boolean>(false);
  const [crop, setCrop] = useState<Crop>();
  const [removeExistingProfilePic, setRemoveExistingProfilePic] =
    useState<boolean>(false);
  const [showDeleteAccountPopup, setShowDeleteAccountPopup] =
    useState<boolean>(false);
  const [deleteAccountPopupStage, setDeleteAccountPopupStage] = useState<
    "are_you_sure" | "input_confirmation_text" | "reauthenticate_user"
  >("are_you_sure");
  const [
    deleteAccountPopupConfirmationText,
    setDeleteAccountPopupConfirmationText,
  ] = useState<string>("");
  const [deleteAccountLoading, setDeleteAccountLoading] =
    useState<boolean>(false);
  const [reauthenticatePasswordInput, setReauthenticatePasswordInput] =
    useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [reauthError, setReauthError] = useState<string | null>(null);

  const imgSrc = useMemo(() => {
    if (uploadedFile) {
      return URL.createObjectURL(uploadedFile);
    }
  }, [uploadedFile]);

  const croppedImgSrc = useMemo(() => {
    if (croppedFile) {
      return URL.createObjectURL(croppedFile);
    } else if (
      user.photoUrl &&
      user.photoUrl !== "" &&
      !removeExistingProfilePic
    ) {
      return user.photoUrl;
    }
  }, [croppedFile, user.photoUrl, removeExistingProfilePic]);

  useEffect(() => {
    // This is the cleanup function that will run when the component unmounts
    return () => {
      if (imgSrc) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [imgSrc]);

  useEffect(() => {
    // This is the cleanup function that will run when the component unmounts
    return () => {
      if (croppedImgSrc) {
        URL.revokeObjectURL(croppedImgSrc);
      }
    };
  }, [croppedImgSrc]);

  useEffect(() => {
    if (isLoggedIn === false && !hasRedirected.current) {
      hasRedirected.current = true;
      toast.error("Please login to continue!", {
        duration: 4000,
        closeButton: true,
      });
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (user.uid) {
      fetchAllUserPostsData(user.uid);
      fetchAllUserLikedPostsData(user.uid);
    }
  }, [user.uid]);

  const fetchAllUserPostsData = async (userUid: string) => {
    const postList = await getAllPostsDataByUserUid(userUid);
    if (!(postList instanceof Error)) {
      setUserPostList(postList);
    }
  };

  const fetchAllUserLikedPostsData = async (userUid: string) => {
    const likedPostList = await getAllLikedPostsDataByUserUid(userUid);

    if (!(likedPostList instanceof Error)) {
      setUserLikedPostList(likedPostList);
    }
  };

  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdatedUserDetails((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        [name]: value,
      };
    });
  };

  const handleUpdateUserData = async () => {
    if (!user || uploadUserDataLoading) return;
    if (!updatedUserDetails.username || updatedUserDetails.username === "") {
      toast.error("Username can't be empty!", {
        duration: 4000,
        closeButton: true,
      });
      return;
    }
    setUploadUserDataLoading(true);
    let finalUpdates: Partial<UserType> = { ...updatedUserDetails };

    if (croppedFile) {
      const uploadedImageData =
        await uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore(
          croppedFile,
          user
        );
      finalUpdates = {
        ...finalUpdates,
        photoUrl: uploadedImageData.secure_url,
        cloudinaryProfilePhotoPublicId: uploadedImageData.public_id,
        cloudinaryProfilePhotoSize: Number(uploadedImageData.size),
      };
    } else if (removeExistingProfilePic) {
      removeUserProfilePic(user);
      finalUpdates = {
        ...finalUpdates,
        photoUrl: "",
        cloudinaryProfilePhotoPublicId: "",
        cloudinaryProfilePhotoSize: 0,
      };
    }

    await updateUserDetailsInFirestore(user.uid, updatedUserDetails);
    if (updatedUserDetails.username !== user.username) {
      // Handle username change on posts
      await updatePostUsernames(user.uid, updatedUserDetails.username || "");
      await updateCommentUsernames(user.uid, updatedUserDetails.username || "");
    }

    setUser((prevUser) => {
      return {
        ...prevUser,
        ...finalUpdates,
      };
    });

    setRemoveExistingProfilePic(false);
    setIsUserEditingDetails(false);
    setCroppedFile(null);
    setUploadUserDataLoading(false);
  };

  const handleEditClick = () => {
    setIsUserEditingDetails(true);
    setUpdatedUserDetails({
      username: user.username || "",
      fName: user.fName || "",
      lName: user.lName || "",
    });
  };

  const handleUserProfilePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setShowImageCropPopup(true);
      if (!isUserEditingDetails) handleEditClick();
    }
  };

  const handlePostClick = (postUid: string) => {
    router.push(`/posts/${postUid}`);
  };

  const onCroppingImageLoad = (e: SyntheticEvent<HTMLImageElement>) => {
    const imageElement = e.currentTarget;
    const { width, height } = imageElement;

    const cropPercent = centerCrop(
      makeAspectCrop(
        {
          unit: "%",
          width: 90,
        },
        1,
        width,
        height
      ),
      width,
      height
    );

    const cropPixels: Crop = {
      unit: "px",
      x: (cropPercent.x / 100) * width,
      y: (cropPercent.y / 100) * height,
      width: (cropPercent.width / 100) * width,
      height: (cropPercent.height / 100) * height,
    };

    setCrop(cropPixels);
  };

  const handleCropImage = async () => {
    const image = imgRef.current;
    if (!image || !crop || !uploadedFile) {
      console.error("Missing required data for cropping.");
      return;
    }

    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          return;
        }

        const fileNameParts = uploadedFile.name.split(".");
        const fileExtension = fileNameParts.pop();
        const baseName = fileNameParts.join(".");
        const newFileName = `${baseName}-cropped.${fileExtension}`;

        const croppedFile = new File([blob], newFileName, {
          type: blob.type,
        });

        if ((user.imageStorageUsed || 0) + croppedFile.size / 1048576 > 100) {
          toast.error("You have reached your image storage limit.", {
            duration: 4000,
            closeButton: true,
          });
          setUploadedFile(null);
          setCroppedFile(null);
        } else {
          // Set the new File object in state
          setCroppedFile(croppedFile);
        }
        // Close the popup
        setShowImageCropPopup(false);
      },
      "image/png",
      1
    );
  };

  const handleRemoveImageClick = (e: React.MouseEvent<SVGElement>) => {
    if (!uploadUserDataLoading) {
      e.stopPropagation();
      e.preventDefault();
      if (user.photoUrl && !croppedFile) {
        if (!isUserEditingDetails) handleEditClick();
        setRemoveExistingProfilePic(true);
      }
      setUploadedFile(null);
      setCroppedFile(null);
    }
  };

  const handleBackToMyProfile = () => {
    setShowDeleteAccountPopup(false);
    setDeleteAccountPopupStage("are_you_sure");
    setDeleteAccountPopupConfirmationText("");
  };

  const handleDeleteAccountPopupPrimaryButtonClick = async () => {
    if (deleteAccountPopupStage === "are_you_sure") {
      setDeleteAccountPopupConfirmationText("");
      setDeleteAccountPopupStage("input_confirmation_text");
    } else if (deleteAccountPopupStage === "input_confirmation_text") {
      setReauthenticatePasswordInput("");
      setReauthError(null);
      setDeleteAccountPopupStage("reauthenticate_user");
    }
  };

  const handleUserReauthWithGoogle = async () => {
    setDeleteAccountLoading(true);
    const deleteAccountResponse = await reauthenticateUserSignInWithGoogle(
      user
    );
    if (deleteAccountResponse instanceof Error) {
      setReauthError(deleteAccountResponse.message);
    } else {
      router.refresh();
    }
    setDeleteAccountLoading(false);
  };

  const handleUserReauthWithPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setDeleteAccountLoading(true);
    const deleteAccountResponse =
      await reauthenticateUserSignInWithEmailAndPassword(
        user.email,
        reauthenticatePasswordInput,
        user
      );
    if (deleteAccountResponse instanceof Error) {
      setReauthError(deleteAccountResponse.message);
    } else {
      router.refresh();
    }
    setDeleteAccountLoading(false);
  };

  if (isLoggedIn === false) {
    return <></>;
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <div className="w-[40%] flex flex-col items-start justify-start gap-8 bg-white rounded-xl p-4">
          <div className="rounded-full bg-gray-300 flex flex-row items-center justify-center w-full">
            <MyProfileSegmentControl
              activeTab={activeSegmentTab}
              setActiveTab={setActiveSegmentTab}
              tabs={MyProfileSegmentControlTabs}
            />
          </div>
          {activeSegmentTab === "my-profile" ? (
            <div className="flex flex-col w-full items-start justify-start">
              <div className="flex flex-row items-center justify-between gap-5 w-full">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer relative"
                >
                  <Avatar className="h-36 w-36">
                    <AvatarImage
                      src={croppedImgSrc}
                      alt="profile image"
                      style={{ fontSize: 120 }}
                    />
                    <AvatarFallback className="bg-transparent text-black">
                      <VscAccount size="120" />
                    </AvatarFallback>
                  </Avatar>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUserProfilePhotoUpload}
                    multiple={false}
                    disabled={uploadUserDataLoading}
                  />
                  {croppedImgSrc && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IoClose
                          className="absolute bg-gray-500 text-white p-1 rounded-full top-0 right-0"
                          size="26"
                          style={{
                            cursor: uploadUserDataLoading
                              ? "not-allowed"
                              : "pointer",
                          }}
                          onClick={handleRemoveImageClick}
                        />
                      </TooltipTrigger>
                      <TooltipContent className="border border-zinc-900">
                        <p>Remove Image</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </label>
                <div className="flex flex-col items-center justify-between gap-5 w-full">
                  <div className="flex flex-row items-end justify-start w-full gap-5">
                    <div className="grid w-full max-w-sm items-center gap-2">
                      <Label htmlFor="username" className="text-black">
                        Username
                      </Label>
                      <Input
                        id="username"
                        placeholder="Username"
                        name="username"
                        value={
                          isUserEditingDetails
                            ? updatedUserDetails.username
                            : user.username
                        }
                        onChange={handleUserDataChange}
                        disabled={!isUserEditingDetails}
                        className="text-black placeholder:text-black border-black"
                      />
                    </div>
                    {!isUserEditingDetails && (
                      <Button
                        type="button"
                        className="bg-[#4b5085] hover:bg-[#35385e] hover:text-white"
                        onClick={handleEditClick}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-between w-full gap-5">
                    <div className="grid w-full max-w-sm items-center gap-2">
                      <Label htmlFor="fName" className="text-black">
                        First Name
                      </Label>
                      <Input
                        id="fName"
                        placeholder="First Name"
                        name="fName"
                        value={
                          isUserEditingDetails
                            ? updatedUserDetails.fName
                            : user.fName
                        }
                        onChange={handleUserDataChange}
                        disabled={!isUserEditingDetails}
                        className="text-black placeholder:text-black border-black"
                      />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-2">
                      <Label htmlFor="lName" className="text-black">
                        Last Name
                      </Label>
                      <Input
                        id="lName"
                        placeholder="Last Name"
                        name="lName"
                        value={
                          isUserEditingDetails
                            ? updatedUserDetails.lName
                            : user.lName
                        }
                        onChange={handleUserDataChange}
                        disabled={!isUserEditingDetails}
                        className="text-black placeholder:text-black border-black"
                      />
                    </div>
                  </div>
                  <div
                    className="flex flex-row justify-between gap-5 items-center w-full"
                    style={{
                      visibility: isUserEditingDetails ? "visible" : "hidden",
                    }}
                  >
                    <Button
                      type="button"
                      className="w-1/2 text-black"
                      onClick={() => {
                        setIsUserEditingDetails(false);
                        setCroppedFile(null);
                        setUploadedFile(null);
                        setRemoveExistingProfilePic(false);
                      }}
                      variant="outline"
                      disabled={uploadUserDataLoading}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleUpdateUserData}
                      className="w-1/2 bg-[#4b5085] hover:bg-[#35385e] hover:text-white"
                      type="submit"
                      style={{
                        cursor: uploadUserDataLoading
                          ? "not-allowed"
                          : "pointer",
                      }}
                    >
                      {uploadUserDataLoading ? (
                        <div className="flex flex-row w-full items-center justify-center gap-2">
                          <AiOutlineLoading3Quarters className="animate-spin" />
                          <p>Saving...</p>
                        </div>
                      ) : (
                        "Save"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteAccountPopup(true)}
              >
                <IoWarning />
                Delete Account
              </Button>
            </div>
          ) : activeSegmentTab === "my-post" ? (
            <div className="flex flex-col items-center justify-center w-full gap-3">
              {userPostList && userPostList.length !== 0 ? (
                userPostList.map((post) => (
                  <div
                    key={post.postUid}
                    className="border-2 p-3 cursor-pointer rounded-2xl flex flex-row items-center justify-between w-full gap-5"
                    onClick={() => handlePostClick(post.postUid)}
                  >
                    <Image
                      src={post.imageUrl}
                      alt={`Post image ${post.postUid}`}
                      width={235}
                      height={235}
                      priority
                    />
                    <div className="flex flex-col items-start justify-center gap-1 w-full text-black">
                      <p>Category: {post.selectedGame.name}</p>
                      <p>
                        Posted On:{" "}
                        {post.createdAt.toDate().toLocaleString("us-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex flex-row gap-2 items-center justify-center border-2 rounded-xl py-1 px-2">
                        <div className="text-black bg-transparent cursor-pointer flex flex-row items-center justify-center text-2xl gap-1 px-2 rounded-xl">
                          {post.likes > 0 ? (
                            <FaHeart className="text-red-600" size="20" />
                          ) : (
                            <FaRegHeart className="text-black" size="20" />
                          )}
                          {post.likes}
                        </div>
                        <div className="text-black bg-transparent cursor-pointer flex flex-row items-center justify-center text-2xl gap-1 px-2 rounded-xl">
                          {!post.comments?.length ||
                          post.comments?.length === 0 ? (
                            <FaRegComment className="text-black" size="20" />
                          ) : post.comments?.length === 1 ? (
                            <FaComment className="text-black" size="20" />
                          ) : (
                            <FaComments className="text-black" size="20" />
                          )}
                          {post.comments?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-black text-lg font-semibold">
                  No posts available
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full gap-3">
              {userLikedPostList && userLikedPostList.length !== 0 ? (
                userLikedPostList.map((post) => (
                  <div
                    key={post.postUid}
                    className="border-2 p-3 cursor-pointer rounded-2xl flex flex-row items-center justify-between w-full gap-5"
                    onClick={() => handlePostClick(post.postUid)}
                  >
                    <Image
                      src={post.imageUrl}
                      alt={`Post image ${post.postUid}`}
                      width={235}
                      height={235}
                      priority
                    />
                    <div className="flex flex-col items-start justify-center gap-1 w-full text-black">
                      <p>Category: {post.selectedGame.name}</p>
                      <p>
                        Posted On:{" "}
                        {post.createdAt.toDate().toLocaleString("us-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                      <div className="flex flex-row gap-2 items-center justify-center border-2 rounded-xl py-1 px-2">
                        <div className="text-black bg-transparent cursor-pointer flex flex-row items-center justify-center text-2xl gap-1 px-2 rounded-xl">
                          {post.likes > 0 ? (
                            <FaHeart className="text-red-600" size="20" />
                          ) : (
                            <FaRegHeart className="text-black" size="20" />
                          )}
                          {post.likes}
                        </div>
                        <div className="text-black bg-transparent cursor-pointer flex flex-row items-center justify-center text-2xl gap-1 px-2 rounded-xl">
                          {!post.comments?.length ||
                          post.comments?.length === 0 ? (
                            <FaRegComment className="text-black" size="20" />
                          ) : post.comments?.length === 1 ? (
                            <FaComment className="text-black" size="20" />
                          ) : (
                            <FaComments className="text-black" size="20" />
                          )}
                          {post.comments?.length || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-black text-lg font-semibold">
                  No liked posts available
                </p>
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog open={showImageCropPopup} onOpenChange={setShowImageCropPopup}>
        <DialogContent
          className="[&>button>svg]:text-black"
          onPointerDownOutside={(event) => {
            setShowImageCropPopup(false);
            setCroppedFile(null);
            setUploadedFile(null);
          }}
          onEscapeKeyDown={(event) => {
            setShowImageCropPopup(false);
            setCroppedFile(null);
            setUploadedFile(null);
          }}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-black mb-2">
              Crop Your Image
            </DialogTitle>
          </DialogHeader>
          {uploadedFile && (
            <div className="flex flex-row items-center justify-center w-full">
              <ReactCrop
                crop={crop}
                onChange={(c) => setCrop(c)}
                aspect={1}
                minWidth={60}
                circularCrop
                className="w-[28%]"
              >
                <img
                  src={imgSrc}
                  onLoad={onCroppingImageLoad}
                  ref={imgRef}
                  alt="Crop preview"
                  style={{ objectFit: "contain" }}
                />
              </ReactCrop>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button
                className="text-black"
                onClick={() => {
                  setShowImageCropPopup(false);
                  setCroppedFile(null);
                  setUploadedFile(null);
                  setRemoveExistingProfilePic(false);
                }}
                variant="outline"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="text-white bg-[#4b5085] hover:bg-[#35385e]"
              onClick={handleCropImage}
            >
              Crop Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog
        open={showDeleteAccountPopup}
        onOpenChange={setShowDeleteAccountPopup}
      >
        <DialogContent
          className="[&>button>svg]:text-black"
          onPointerDownOutside={(event) => {
            handleBackToMyProfile();
          }}
          onEscapeKeyDown={(event) => {
            handleBackToMyProfile();
          }}
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="text-black text-lg font-semibold">
              {deleteAccountPopupStage === "are_you_sure"
                ? "Permanently Delete Your Account?"
                : deleteAccountPopupStage === "input_confirmation_text"
                ? "This Action Is Irreversible!"
                : "For Your Security  "}
            </DialogTitle>
            <DialogDescription className="text-black text-base" asChild>
              {deleteAccountPopupStage === "are_you_sure" ? (
                <div>
                  <p className="text-black text-base">
                    You are about to permanently delete your account. This is
                    irreversible and will remove all of your data, including:
                  </p>
                  <ul className="list-disc list-inside py-1 pl-3">
                    <li>Your profile, username, and personal information</li>
                    <li>All posts, comments, and likes you've created</li>
                    <li>Your entire activity history</li>
                  </ul>
                  <p className="text-black text-base font-semibold">
                    This action cannot be undone.
                  </p>
                </div>
              ) : deleteAccountPopupStage === "input_confirmation_text" ? (
                <div>
                  <p>
                    To confirm that you understand this action cannot be undone,
                    please type{" "}
                    <span className="font-bold">DELETE MY ACCOUNT</span> in the
                    box below to proceed.
                  </p>
                </div>
              ) : (
                <p>
                  Please enter your password or sign in with Google one last
                  time to confirm the permanent deletion of your account.
                </p>
              )}
            </DialogDescription>
          </DialogHeader>
          {deleteAccountPopupStage === "input_confirmation_text" && (
            <>
              <Input
                placeholder="Enter confirmation text"
                name="deleteAccountPopupConfirmationText"
                value={deleteAccountPopupConfirmationText}
                onChange={(e) => {
                  setDeleteAccountPopupConfirmationText(e.target.value);
                }}
                className="text-black m-1"
                type="text"
                tabIndex={1}
                autoFocus
              />
            </>
          )}
          {deleteAccountPopupStage === "reauthenticate_user" && (
            <>
              <form
                onSubmit={handleUserReauthWithPassword}
                className="flex flex-col w-full gap-3"
              >
                <Input
                  id="password"
                  placeholder="Password*"
                  name="password"
                  value={reauthenticatePasswordInput}
                  onChange={(e) =>
                    setReauthenticatePasswordInput(e.target.value)
                  }
                  className="text-black"
                  type={showPassword ? "text" : "password"}
                  icon={showPassword ? FaEyeSlash : FaEye}
                  onIconClick={() => {
                    setShowPassword((prev) => !prev);
                  }}
                  tabIndex={2}
                />
                <p
                  className="text-red-500 text-wrap"
                  style={{ display: reauthError ? "block" : "none" }}
                >
                  {reauthError || "Something went wrong!"}
                </p>
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full text-black"
                >
                  {deleteAccountLoading ? (
                    <AiOutlineLoading3Quarters className="animate-spin" />
                  ) : (
                    <>
                      <IoWarning className="text-red-600" />
                      Login and Delete Account
                    </>
                  )}
                </Button>
              </form>
              <Separator orientation="horizontal" className="my-2" />
              <Button
                type="button"
                variant="outline"
                onClick={handleUserReauthWithGoogle}
                className="text-black w-full"
              >
                <FcGoogle /> Login with Google and Delete Account
              </Button>
            </>
          )}
          {deleteAccountPopupStage !== "reauthenticate_user" && (
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  onClick={handleBackToMyProfile}
                  className="text-black"
                >
                  {deleteAccountPopupStage === "are_you_sure"
                    ? "Back to My Profile"
                    : "Cancel"}
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={handleDeleteAccountPopupPrimaryButtonClick}
                disabled={
                  deleteAccountPopupStage === "input_confirmation_text" &&
                  deleteAccountPopupConfirmationText !== "DELETE MY ACCOUNT"
                }
              >
                {deleteAccountPopupStage === "are_you_sure" ? (
                  "Proceed"
                ) : (
                  <>
                    <IoWarning />
                    <p>Delete Account</p>
                  </>
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default MyProfilePage;

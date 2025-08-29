"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { PostType } from "@/types/post";
import { UserType } from "@/types/user";
import { uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore } from "@/utils/cloudinaryFunctions";
import {
  getAllLikedPostsDataByUserUid,
  getAllPostsDataByUserUid,
} from "@/utils/postFunctions";
import { updateUserDetailsInFirestore } from "@/utils/userFunctions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { VscAccount } from "react-icons/vsc";

function MyProfilePage() {
  const { user, setUser, isLoggedIn } = useAuth();
  const router = useRouter();

  const [isUserEditingDetails, setIsUserEditingDetails] =
    useState<boolean>(false);
  const [updatedUserDetails, setUpdatedUserDetails] = useState<
    Partial<UserType>
  >({});
  const [userPostList, setUserPostList] = useState<PostType[] | null>(null);
  const [userLikedPostList, setUserLikedPostList] = useState<PostType[] | null>(
    null
  );

  useEffect(() => {
    if (isLoggedIn === false) {
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
    await updateUserDetailsInFirestore(user.uid, updatedUserDetails);
    setIsUserEditingDetails(false);
    setUser((prevUser) => {
      return {
        ...prevUser,
        ...updatedUserDetails,
      };
    });
  };

  const handleEditClick = () => {
    setIsUserEditingDetails(true);
    setUpdatedUserDetails({
      username: user.username,
      fName: user.fName,
      lName: user.lName,
    });
  };

  const handleUserProfilePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const uploadedImageData =
        await uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore(file, user);
      setUser((prevUser) => ({
        ...prevUser,
        photoUrl: uploadedImageData.secure_url,
        cloudinaryProfilePhotoPublicId: uploadedImageData.public_id,
        cloudinaryProfilePhotoSize: Number(uploadedImageData.size),
      }));
    }
  };

  const handlePostClick = (postUid: string) => {
    router.push(`/posts/${postUid}`);
  };

  if (isLoggedIn === false) {
    return <></>;
  }

  return (
    <div className="flex flex-col items-center justify-center m-24 gap-10">
      <h1 className="text-3xl font-semibold">My Profile</h1>
      <div className="flex flex-col items-center justify-center gap-5 border-2 border-black w-[500px] p-4 rounded-3xl">
        <div className="flex flex-row items-center justify-start gap-5 w-full">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user.photoUrl}
                alt="profile image"
                style={{ fontSize: 64 }}
              />
              <AvatarFallback>
                <VscAccount style={{ fontSize: 64 }} />
              </AvatarFallback>
            </Avatar>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUserProfilePhotoUpload}
              multiple={false}
            />
          </label>
          <Input
            id="username"
            placeholder="Username"
            name="username"
            value={
              isUserEditingDetails ? updatedUserDetails.username : user.username
            }
            onChange={handleUserDataChange}
            disabled={!isUserEditingDetails}
          />
          {!isUserEditingDetails && (
            <Button type="button" className="" onClick={handleEditClick}>
              Edit
            </Button>
          )}
        </div>
        <div className="flex flex-row items-center justify-between w-full">
          <Input
            id="fName"
            placeholder="First Name"
            name="fName"
            value={isUserEditingDetails ? updatedUserDetails.fName : user.fName}
            onChange={handleUserDataChange}
            disabled={!isUserEditingDetails}
          />
          <Input
            id="lName"
            placeholder="Last Name"
            name="lName"
            value={isUserEditingDetails ? updatedUserDetails.lName : user.lName}
            onChange={handleUserDataChange}
            disabled={!isUserEditingDetails}
          />
        </div>
        {isUserEditingDetails && (
          <div className="flex flex-row justify-between gap-5 items-center w-full">
            <Button
              type="button"
              className="w-1/2"
              onClick={() => setIsUserEditingDetails(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateUserData}
              variant="outline"
              className="w-1/2"
              type="submit"
            >
              Save
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-row items-center justify-center gap-5 border-2 border-black rounded-xl">
        <div className="flex flex-col items-center justify-center">
          <p>My Posts</p>
          {userPostList ? (
            userPostList.map((post) => (
              <div
                key={post.postUid}
                className="border-2 m-2 p-2 cursor-pointer"
                onClick={() => handlePostClick(post.postUid)}
              >
                <Image
                  src={post.imageUrl}
                  alt={`Post image ${post.postUid}`}
                  width={200}
                  height={200}
                />
              </div>
            ))
          ) : (
            <p>No posts available</p>
          )}
        </div>
        <div className="flex flex-col items-center justify-center">
          <p>My Liked Posts</p>
          {userLikedPostList ? (
            userLikedPostList.map((post) => (
              <div
                key={post.postUid}
                className="border-2 m-2 p-2 cursor-pointer"
                onClick={() => handlePostClick(post.postUid)}
              >
                <Image
                  src={post.imageUrl}
                  alt={`Post image ${post.postUid}`}
                  width={200}
                  height={200}
                />
              </div>
            ))
          ) : (
            <p>No liked posts available</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;

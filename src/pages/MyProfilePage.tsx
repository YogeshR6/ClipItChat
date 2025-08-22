"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { UserType } from "@/types/user";
import { uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore } from "@/utils/cloudinaryFunctions";
import { updateUserDetailsInFirestore } from "@/utils/userFunctions";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { VscAccount } from "react-icons/vsc";

function MyProfilePage() {
  const { user, setUser, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  const [isUserEditingDetails, setIsUserEditingDetails] =
    useState<boolean>(false);
  const [updatedUserDetails, setUpdatedUserDetails] = useState<
    Partial<UserType>
  >({});

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
        await uploadProfilePhotoToCloudinaryAndSaveUrlInFirestore(
          file,
          user.uid
        );
      setUser((prevUser) => ({
        ...prevUser,
        photoUrl: uploadedImageData.secure_url,
      }));
    }
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
    </div>
  );
}

export default MyProfilePage;

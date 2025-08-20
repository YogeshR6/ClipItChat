"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { updateUserDetailsInFirestore } from "@/utils/userFunctions";
import React, { useState } from "react";
import { VscAccount } from "react-icons/vsc";

function MyProfilePage() {
  const { user, setUser } = useAuth();
  const [isUserEditingDetails, setIsUserEditingDetails] =
    useState<boolean>(false);

  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUser((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        [name]: value,
      };
    });
  };

  const handleUpdateUserData = async () => {
    await updateUserDetailsInFirestore(user.uid, user);
    setIsUserEditingDetails(false);
  };

  return (
    <div className="flex flex-col items-center justify-center m-24 gap-10">
      <h1 className="text-3xl font-semibold">My Profile</h1>
      <div className="flex flex-col items-center justify-center gap-5 border-2 border-black w-[500px] p-4 rounded-3xl">
        <div className="flex flex-row items-center justify-start gap-5 w-full">
          <label htmlFor="avatar-upload" className="cursor-pointer">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user?.photoUrl}
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
              disabled
              onChange={(e) => {
                // handle image upload here
                const file = e.target.files?.[0];
                if (file) {
                  // You can add your upload logic here
                }
              }}
            />
          </label>
          <Input
            id="username"
            placeholder="Username"
            name="username"
            value={user.username}
            onChange={handleUserDataChange}
            disabled={!isUserEditingDetails}
          />
          {!isUserEditingDetails && (
            <Button
              type="button"
              className=""
              onClick={() => setIsUserEditingDetails(true)}
            >
              Edit
            </Button>
          )}
        </div>
        <div className="flex flex-row items-center justify-between w-full">
          <Input
            id="fName"
            placeholder="First Name"
            name="fName"
            value={user.fName}
            onChange={handleUserDataChange}
            disabled={!isUserEditingDetails}
          />
          <Input
            id="lName"
            placeholder="Last Name"
            name="lName"
            value={user.lName}
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

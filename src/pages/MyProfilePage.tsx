"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/contexts/AuthContext";
import React, { useState } from "react";
import { VscAccount } from "react-icons/vsc";

function MyProfilePage() {
  const { user } = useAuth();

  const [updateUserData, setUpdateUserData] = useState(user);

  const handleUserDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUpdateUserData((prevUser) => {
      if (!prevUser) return prevUser;
      return {
        ...prevUser,
        [name]: value,
      };
    });
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
            value={updateUserData?.username}
            onChange={handleUserDataChange}
          />
        </div>
        <div className="flex flex-row items-center justify-between w-full">
          <Input
            id="fName"
            placeholder="First Name"
            name="fName"
            value={updateUserData?.fName}
            onChange={handleUserDataChange}
          />
          <Input
            id="lName"
            placeholder="Last Name"
            name="lName"
            value={updateUserData?.lName}
            onChange={handleUserDataChange}
          />
        </div>
        <div className="flex flex-row justify-between gap-5 items-center w-full">
          <Button
            type="button"
            className="w-1/2"
            onClick={() => {
              // handle cancel logic here
            }}
            disabled={updateUserData === user}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              // handle save logic here
            }}
            variant="outline"
            className="w-1/2"
            type="submit"
            disabled={updateUserData === user}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;

"use client";

import { useAuth } from "@/hooks/contexts/AuthContext";
import Link from "next/link";
import { CgProfile } from "react-icons/cg";
import { Button } from "./ui/button";
import { userSignOut } from "@/utils/authFunctions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TopBar: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const handleUserLogout = async () => {
    try {
      await userSignOut();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-row justify-between w-full items-center fixed top-0 z-10 p-3">
      <div>Logo Here</div>
      <div className="flex flex-row gap-5">
        <Link href="/" className="p-2 rounded-md">
          Home
        </Link>
        <Link href="/posts" className="p-2 rounded-md">
          Posts
        </Link>
        <Link href="/upload" className="p-2 rounded-md">
          Upload
        </Link>
      </div>
      <div>
        {isLoggedIn ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={user?.photoURL} alt="profile image" />
                  <AvatarFallback>
                    <CgProfile style={{ fontSize: 25 }} />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={handleUserLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <Link href="/auth">
            <Button variant="outline">Login / Signup</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopBar;

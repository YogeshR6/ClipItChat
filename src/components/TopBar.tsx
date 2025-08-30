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
import { useRouter } from "next/navigation";
import Image from "next/image";

const TopBar: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  const router = useRouter();

  const handleUserLogout = async () => {
    try {
      await userSignOut();
    } catch (error) {
      console.error(error);
    }
  };

  const handleMyProfileClick = () => {
    router.push("/my-profile");
  };

  return (
    <div className="flex flex-row justify-between w-full items-center py-3 px-5">
      <Image
        src="/logos/horizontal_png_logo.png"
        alt="Logo"
        width={130}
        height={50}
        onClick={() => router.push("/")}
      />
      <div className="flex flex-row gap-5">
        <Link href="/" className="p-2 rounded-md">
          Home
        </Link>
        <Link href="/posts" className="p-2 rounded-md">
          Discover
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
                  <AvatarImage src={user?.photoUrl} alt="profile image" />
                  <AvatarFallback>
                    <CgProfile style={{ fontSize: 25 }} />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleMyProfileClick}>
                  Profile
                </DropdownMenuItem>
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

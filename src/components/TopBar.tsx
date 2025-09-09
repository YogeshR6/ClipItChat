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
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Tabs } from "@/components/ui/tabs";
import { Tab } from "@/types/misc";
import { useEffect, useState } from "react";

const tabs: Tab[] = [
  { title: "Home", value: "home" },
  { title: "Discover", value: "posts" },
  { title: "Upload", value: "upload" },
];

const TopBar: React.FC = () => {
  const { user, isLoggedIn } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  const [active, setActive] = useState<Tab | null>(tabs[0]);

  useEffect(() => {
    const currentTab = tabs.find((tab) => pathname?.includes(tab.value));
    if (currentTab) {
      setActive(currentTab);
    } else if (pathname === "/") {
      setActive(tabs[0]);
    } else {
      setActive(null);
    }
  }, [pathname]);

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
        <Tabs tabs={tabs} activeTab={active} setActiveTab={setActive} />
      </div>
      <div>
        {isLoggedIn ? (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar>
                  <AvatarImage src={user?.photoUrl} alt="profile image" />
                  <AvatarFallback className="bg-transparent">
                    <CgProfile size="25" />
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
            <Button className="bg-[#4b5085] hover:bg-[#35385e]">
              Login / Signup
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopBar;

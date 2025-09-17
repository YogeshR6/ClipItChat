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
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoHome, IoHomeOutline } from "react-icons/io5";
import { FaGlobe } from "react-icons/fa6";
import { CiGlobe } from "react-icons/ci";
import { FaFileUpload } from "react-icons/fa";
import { MdOutlineUploadFile, MdAccountCircle } from "react-icons/md";
import { BiLogIn } from "react-icons/bi";

const tabs: Tab[] = [
  { title: "Home", value: "home" },
  { title: "Discover", value: "posts" },
  { title: "Upload", value: "upload" },
];

const TopBar: React.FC = () => {
  const { user, isLoggedIn, isLessThanTablet } = useAuth();

  const router = useRouter();
  const pathname = usePathname();

  const [active, setActive] = useState<Tab | null>(tabs[0]);
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);

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
      setSheetOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const routeToPage = (url: string) => {
    router.push(url);
    setSheetOpen(false);
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
        priority
        className="cursor-pointer"
      />
      {isLessThanTablet ? (
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="bg-transparent" size="icon">
              <GiHamburgerMenu className="text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-[#141623] flex flex-col justify-between items-start">
            <div className="flex flex-col items-start justify-center w-full my-5 gap-2">
              <SheetTitle className="text-white mb-4">Menu</SheetTitle>
              <p
                className="w-full flex flex-row items-center justify-start gap-2 px-4 py-3 rounded-xl hover:bg-[#4b5085]"
                style={{
                  backgroundColor: pathname === "/" ? "#4b5085" : "transparent",
                }}
                onClick={() => routeToPage("/")}
              >
                {pathname === "/" ? <IoHome /> : <IoHomeOutline />}Home
              </p>
              <p
                className="w-full flex flex-row items-center justify-start gap-2 px-4 py-3 rounded-xl hover:bg-[#4b5085]"
                style={{
                  backgroundColor: pathname?.includes("/posts")
                    ? "#4b5085"
                    : "transparent",
                }}
                onClick={() => routeToPage("/posts")}
              >
                {pathname?.includes("/posts") ? <FaGlobe /> : <CiGlobe />}
                Discover
              </p>
              <p
                className="w-full flex flex-row items-center justify-start gap-2 px-4 py-3 rounded-xl hover:bg-[#4b5085]"
                style={{
                  backgroundColor:
                    pathname === "/upload" ? "#4b5085" : "transparent",
                }}
                onClick={() => routeToPage("/upload")}
              >
                {pathname === "/upload" ? (
                  <FaFileUpload />
                ) : (
                  <MdOutlineUploadFile />
                )}
                Upload
              </p>
              {isLoggedIn && (
                <p
                  className="w-full flex flex-row items-center justify-start gap-2 px-4 py-3 rounded-xl hover:bg-[#4b5085]"
                  style={{
                    backgroundColor:
                      pathname === "/my-profile" ? "#4b5085" : "transparent",
                  }}
                  onClick={() => routeToPage("/my-profile")}
                >
                  {pathname === "/my-profile" ? (
                    <MdAccountCircle />
                  ) : (
                    <CgProfile />
                  )}
                  My Profile
                </p>
              )}
            </div>
            <div className="flex flex-col items-start w-full justify-center gap-4">
              {isLoggedIn ? (
                <>
                  <div
                    className="flex flex-row w-full items-center justify-between border border-white rounded-xl py-2 px-4 gap-3"
                    onClick={() => routeToPage("/my-profile")}
                  >
                    <Avatar>
                      <AvatarImage src={user?.photoUrl} alt="profile image" />
                      <AvatarFallback className="bg-transparent">
                        <CgProfile size="25" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col flex-1 min-w-0 items-start justify-center">
                      <p className="text-lg font-semibold w-full truncate">
                        {user?.username}
                      </p>
                      <p className="w-full truncate">{user?.email}</p>
                    </div>
                  </div>
                  <SheetClose asChild>
                    <Button
                      onClick={handleUserLogout}
                      className="w-full bg-[#4b5085] hover:bg-[#35385e]"
                    >
                      Logout
                    </Button>
                  </SheetClose>
                </>
              ) : (
                <SheetClose asChild>
                  <Button
                    onClick={() => routeToPage("/auth")}
                    className="w-full bg-[#4b5085] hover:bg-[#35385e]"
                  >
                    Login / Signup
                  </Button>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      ) : (
        <>
          <div className="flex flex-row gap-5">
            <Tabs tabs={tabs} activeTab={active} setActiveTab={setActive} />
          </div>
          <div>
            {isLoggedIn ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      className="flex flex-row items-center justify-center bg-[#4b5085] rounded-xl cursor-pointer"
                      style={{
                        paddingRight: user?.username ? "12px" : "0px",
                        paddingLeft: user?.username
                          ? user?.photoUrl
                            ? "10px"
                            : "4px"
                          : "0px",
                        ...(user?.photoUrl && {
                          gap: "8px",
                          paddingTop: "3px",
                          paddingBottom: "3px",
                        }),
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.photoUrl} alt="profile image" />
                        <AvatarFallback className="bg-transparent">
                          <CgProfile size="25" />
                        </AvatarFallback>
                      </Avatar>
                      {user?.username && (
                        <p className="text-white text-lg font-semibold">
                          {user.username}
                        </p>
                      )}
                    </div>
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
                  <BiLogIn className="mt-[2px]" /> Login / Signup
                </Button>
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TopBar;

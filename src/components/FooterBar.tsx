"use client";
import { useAuth } from "@/hooks/contexts/AuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";
import { FaGithub } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa6";

function FooterBar() {
  const router = useRouter();

  const { isLoggedIn, isLessThanMobile, isLessThanTablet } = useAuth();

  const handleOpenGitHubSponsorPage = () => {
    window.open(
      "https://github.com/sponsors/YogeshR6",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleOpenTwitterPage = () => {
    window.open("https://x.com/YogeshR120", "_blank", "noopener,noreferrer");
  };

  return (
    <div
      className="w-full flex items-center justify-between bg-[#141623] p-5 border-t border-white mt-4"
      style={{
        flexDirection: isLessThanMobile ? "column" : "row",
        gap: isLessThanMobile ? "10px" : "0px",
      }}
    >
      <Image
        src="/logos/horizontal_png_logo.png"
        alt="Logo"
        width={130}
        height={50}
        onClick={() => router.push("/")}
        priority
        className="cursor-pointer"
      />
      <div
        className="flex flex-row items-end justify-between h-full"
        style={{
          gap: isLessThanMobile ? "5px" : isLessThanTablet ? "25px" : "45px",
          width: isLessThanMobile ? "100%" : undefined,
        }}
      >
        <div>
          <p
            className="hover:underline hover:underline-offset-2 cursor-pointer hover:text-[#5252e4]"
            onClick={() => router.push("/")}
          >
            Home
          </p>
          <p
            className="hover:underline hover:underline-offset-2 cursor-pointer hover:text-[#5252e4]"
            onClick={() => router.push("/posts")}
          >
            Discover
          </p>
          <p
            className="hover:underline hover:underline-offset-2 cursor-pointer hover:text-[#5252e4]"
            onClick={() => router.push("/upload")}
          >
            Upload
          </p>
          {isLoggedIn && (
            <p
              className="hover:underline hover:underline-offset-2 cursor-pointer hover:text-[#5252e4]"
              onClick={() => router.push("/my-profile")}
            >
              My Profile
            </p>
          )}
        </div>
        <div className="flex flex-col justify-between items-start h-full">
          <div className="flex flex-row items-center justify-center gap-2">
            <p>Made By:</p>
            <FaTwitter
              size="20"
              onClick={handleOpenTwitterPage}
              className="cursor-pointer"
            />
          </div>
          <div className="flex flex-row items-center justify-center gap-2">
            <p>Support Me:</p>
            <FaGithub
              size="20"
              onClick={handleOpenGitHubSponsorPage}
              className="cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterBar;

"use client";

import Link from "next/link";
import { CgProfile } from "react-icons/cg";

const TopBar: React.FC = () => {
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
        <Link href="/auth">
        <CgProfile style={{fontSize: 25}}/>
        </Link>
      </div>
    </div>
  );
}

export default TopBar;
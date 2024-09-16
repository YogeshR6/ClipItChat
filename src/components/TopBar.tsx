"use client"

import Link from "next/link"

export function TopBar() {
  return (
    <div className="flex flex-row justify-between w-full items-center z-10 h-10 mb-2">
      <div>
        Logo Here
      </div>
      <div className="flex flex-row gap-4">
        <Link href="/">Home</Link>
        <Link href="/posts">Posts</Link>
        <Link href="/upload">Upload</Link>
      </div>
      <div>
        User Info Here
      </div>
    </div>
  )
}

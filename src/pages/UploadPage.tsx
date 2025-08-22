"use client";

import { useAuth } from "@/hooks/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const UploadPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn === false) {
      router.replace("/auth");
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn === false) {
    return <></>;
  }

  return <div>Upload Page</div>;
};

export default UploadPage;

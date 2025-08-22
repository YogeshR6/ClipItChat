"use client";

import { useAuth } from "@/hooks/contexts/AuthContext";
import { useRouter } from "next/navigation";
import React from "react";

const UploadPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();

  if (!isLoggedIn) {
    router.push("/auth");
    return <></>;
  }

  return <div>Upload Page</div>;
};

export default UploadPage;

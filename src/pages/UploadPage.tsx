"use client";

import { useAuth } from "@/hooks/contexts/AuthContext";
import React from "react";

const UploadPage: React.FC = () => {
  const { user, isLoggedIn } = useAuth();
  console.log("user", user);

  return <div>Upload Page</div>;
};

export default UploadPage;

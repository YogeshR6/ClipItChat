"use client";

import React from "react";
import { useAuth } from "@/hooks/contexts/AuthContext";
const HomePage = () => {
  const { user, isLoggedIn } = useAuth();
  console.log("user", user);
  return (
    <>
      <div>HomePage</div>
      {isLoggedIn ? (
        <div>
          <div>Logged in as {user.displayName || user.email}</div>
        </div>
      ) : (
        <div>
          <div>Not logged in</div>
        </div>
      )}
    </>
  );
};

export default HomePage;

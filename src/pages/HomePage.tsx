"use client";

import React from "react";
import { useAuth } from "@/hooks/contexts/AuthContext";
const HomePage = () => {
  const { user, isLoggedIn } = useAuth();
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
        HomePage
      </h2>
      {isLoggedIn ? (
        <h3>Logged in as {user.displayName || user.email}</h3>
      ) : (
        <h3>Not logged in</h3>
      )}
    </div>
  );
};

export default HomePage;

"use client";

import React from "react";
import { useAuth } from "@/hooks/contexts/AuthContext";
import { Button } from "@/components/ui/button";
const HomePage = () => {
  const { user, isLoggedIn } = useAuth();
  return (
    <div>
      <h2 className="text-3xl font-semibold tracking-tight first:mt-0">
        HomePage
      </h2>
      <Button variant="outline">Sign Up Now</Button>
    </div>
  );
};

export default HomePage;

"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { getUserDetailsFromAuthUid } from "@/utils/userFunctions";
import { UserType } from "@/types/user";

interface AuthContextType {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  isLoggedIn: boolean | null;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
}
const AuthContext = createContext<AuthContextType>({
  user: {
    email: "",
    uid: "",
    photoUrl: "",
    fName: "",
    lName: "",
    username: "",
  },
  setUser: () => {},
  isLoggedIn: null,
  setIsLoggedIn: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType>({
    email: "",
    uid: "",
    photoUrl: "",
    fName: "",
    lName: "",
    username: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDetails = (await getUserDetailsFromAuthUid(
          user.uid
        )) as UserType;
        setUser({
          email: userDetails.email,
          uid: userDetails.uid,
          photoUrl: userDetails.photoUrl,
          fName: userDetails.fName,
          lName: userDetails.lName,
          username: userDetails.username,
          cloudinaryProfilePhotoPublicId:
            userDetails.cloudinaryProfilePhotoPublicId,
          likedPosts: userDetails.likedPosts,
        });
        setIsLoggedIn(true);
      } else {
        setUser({
          email: "",
          uid: "",
          photoUrl: "",
          fName: "",
          lName: "",
          username: "",
        });
        setIsLoggedIn(false);
      }
    });
  }, []);

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

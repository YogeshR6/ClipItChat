"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { getUserDetailsFromUid } from "@/utils/userFunctions";

type UserType = {
  email: string;
  uid: string;
  photoUrl?: string;
  fName?: string;
  lName?: string;
  username?: string;
};

interface AuthContextType {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
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
  isLoggedIn: false,
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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDetails = (await getUserDetailsFromUid(user.uid)) as UserType;
        setUser({
          email: userDetails.email,
          uid: userDetails.uid,
          photoUrl: userDetails.photoUrl,
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

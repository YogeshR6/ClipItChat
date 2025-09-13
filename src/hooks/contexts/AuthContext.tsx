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
  authStateUpdateCheck: boolean;
  setAuthStateUpdateCheck: React.Dispatch<React.SetStateAction<boolean>>;
}
const AuthContext = createContext<AuthContextType>({
  user: {
    email: "",
    uid: "",
    photoUrl: "",
    fName: "",
    lName: "",
    username: "",
    authUid: "",
  },
  setUser: () => {},
  isLoggedIn: null,
  setIsLoggedIn: () => {},
  authStateUpdateCheck: false,
  setAuthStateUpdateCheck: () => {},
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
    authUid: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [authStateUpdateCheck, setAuthStateUpdateCheck] =
    useState<boolean>(false);

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user && user.emailVerified) {
        const userDetails = (await getUserDetailsFromAuthUid(
          user.uid
        )) as UserType;
        setUser({
          ...userDetails,
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
          authUid: "",
        });
        setIsLoggedIn(false);
      }
    });
  }, [authStateUpdateCheck]);

  const value = {
    user,
    setUser,
    isLoggedIn,
    setIsLoggedIn,
    authStateUpdateCheck,
    setAuthStateUpdateCheck,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

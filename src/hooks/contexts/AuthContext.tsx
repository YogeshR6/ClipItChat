"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { getUserDetailsFromAuthUid } from "@/utils/userFunctions";
import { UserType } from "@/types/user";
import useMediaQuery from "@/hooks/useMediaQuery";

interface AuthContextType {
  user: UserType;
  setUser: React.Dispatch<React.SetStateAction<UserType>>;
  isLoggedIn: boolean | null;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean | null>>;
  authStateUpdateCheck: boolean;
  setAuthStateUpdateCheck: React.Dispatch<React.SetStateAction<boolean>>;
  isLessThanTablet: boolean;
  isLessThanMobile: boolean;
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
  authStateUpdateCheck: false,
  setAuthStateUpdateCheck: () => {},
  isLessThanTablet: false,
  isLessThanMobile: false,
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
  const [authStateUpdateCheck, setAuthStateUpdateCheck] =
    useState<boolean>(false);
  const isLessThanTablet = useMediaQuery("(max-width: 768px)");
  const isLessThanMobile = useMediaQuery("(max-width: 425px)");

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
    isLessThanTablet,
    isLessThanMobile,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

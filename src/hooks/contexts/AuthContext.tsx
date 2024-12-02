"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";

interface AuthContextType {
  user: any;
  setUser: any;
  isLoggedIn: boolean;
  setIsLoggedIn: any;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: null,
  isLoggedIn: false,
  setIsLoggedIn: null,
});

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({ ...user.providerData[0] });
        setIsLoggedIn(true);
      } else {
        setUser({});
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

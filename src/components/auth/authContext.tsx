"use client"
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { createContext, useState, useContext, useEffect } from "react";

interface AuthContextType {
  user: any;
  isLoggedIn: boolean;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoggedIn: false,
});

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, initializeUser);
      return unsubscribe;
    }, []);

    function initializeUser(user: any) {
      if (user) {
        setUser({...user});
        setIsLoggedIn(true);
      } else {
        setUser(null);
        setIsLoggedIn(false);
      }
    }

    const value = {
        user,
        isLoggedIn
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

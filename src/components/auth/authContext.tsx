"use client"
import { createContext, useState, useContext } from "react";

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
}
const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const value = {
        user,
        setUser
    };
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

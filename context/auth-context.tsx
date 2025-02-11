"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { User as FirebaseUser } from "firebase/auth";
import { STORAGE_KEY } from "@/lib/utils";
import { User } from "@/types/user";
import Cookies from "js-cookie";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    // Try to get user data from cookies first, then localStorage as fallback
    const userFromCookie = Cookies.get(STORAGE_KEY);
    const userFromStorage = localStorage.getItem(STORAGE_KEY);
    
    if (userFromCookie) {
      try {
        setUser(JSON.parse(userFromCookie));
      } catch (error) {
        console.error('Error parsing user data from cookie:', error);
      }
    } else if (userFromStorage) {
      try {
        const userData = JSON.parse(userFromStorage);
        setUser(userData);
        // Sync the cookie if it's missing
        Cookies.set(STORAGE_KEY, JSON.stringify(userData), { expires: 7 });
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

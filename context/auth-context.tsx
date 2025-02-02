"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { User as FirebaseUser} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { STORAGE_KEY } from '@/lib/utils';

interface AuthContextType {
  user: FirebaseUser | null;
  setUser: React.Dispatch<React.SetStateAction<FirebaseUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
useEffect(() => {
      const userDetail = localStorage.getItem(STORAGE_KEY);
      if(userDetail) {
        setUser(JSON.parse(userDetail));
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


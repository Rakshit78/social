"use client";

import React, { useState, useEffect, createContext, useContext } from "react";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { useRouter } from "next/navigation";

import { firebaseApp } from "@/utils/firebase";
import { AuthContextType } from "@/utils/types/context";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  loadingUser: true,
  authError: false,
});

export default function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = getAuth(firebaseApp);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true); // Helpful, to update the UI accordingly.
  const [authError, setAuthError] = useState(false);

  const route = useRouter();

  const moveToAuth = () => route.push("/auth");

  useEffect(() => {
    if (!user) {
      moveToAuth();
    } else {
      getDatabase(firebaseApp);
    }
  }, [user]);

  useEffect(() => {
    // Listen authenticated user
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setUser(user);
        } else {
          setUser(null);
        }
        setAuthError(false);
      } catch (error) {
        moveToAuth();
        setAuthError(true);
      } finally {
        setLoadingUser(false);
      }
    });

    // Unsubscribe auth listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loadingUser, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook that shorthands the context!
export const useAuth = () => useContext(AuthContext);

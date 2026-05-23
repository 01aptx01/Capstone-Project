"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { getMember, type MemberProfile } from "@/lib/api/members";
import { getPhoneFromCookie, saveSession, clearSession } from "@/lib/auth/session";

interface UserContextType {
  phone: string | null;
  profile: MemberProfile | null;
  isLoading: boolean;
  displayName: string;
  setDisplayName: (name: string) => void;
  loadMember: () => Promise<void>;
  loginWithPhone: (phone: string, displayName?: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [displayName, setDisplayName] = useState("มดเปา");
  const [isLoading, setIsLoading] = useState(true);

  const loadMember = useCallback(async () => {
    const stored = getPhoneFromCookie();
    if (!stored) {
      setPhone(null);
      setProfile(null);
      setIsLoading(false);
      return;
    }
    setPhone(stored);
    setIsLoading(true);
    try {
      const data = await getMember(stored);
      setProfile(data.found ? data : null);
    } catch {
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMember();
  }, [loadMember]);

  const loginWithPhone = (nextPhone: string, name?: string) => {
    saveSession(nextPhone);
    setPhone(nextPhone);
    if (name) setDisplayName(name);
    void loadMember();
  };

  const logout = () => {
    clearSession();
    setPhone(null);
    setProfile(null);
  };

  return (
    <UserContext.Provider
      value={{
        phone,
        profile,
        isLoading,
        displayName,
        setDisplayName,
        loadMember,
        loginWithPhone,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

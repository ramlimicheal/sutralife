"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@/types";

interface AuthContextType {
  user: SupabaseUser | null;
  profile: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createSupabaseBrowserClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      if (!supabase) return;
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) {
        setProfile({
          id: data.id,
          email: data.email ?? "",
          name: data.name ?? "",
          avatar_url: data.avatar_url ?? null,
          tier: data.tier ?? "free",
          nsfw_enabled: data.nsfw_enabled ?? false,
          age_verified: data.age_verified ?? false,
          role: data.role ?? "user",
          razorpay_customer_id: data.razorpay_customer_id ?? null,
          razorpay_subscription_id: data.razorpay_subscription_id ?? null,
          subscription_status: data.subscription_status ?? "inactive",
          subscription_expires_at: data.subscription_expires_at ?? null,
          created_at: data.created_at ?? "",
          updated_at: data.updated_at ?? "",
        });
      }
    },
    [supabase]
  );

  useEffect(() => {
    if (!supabase) {
      // No supabase client - schedule loading state update
      const t = setTimeout(() => setLoading(false), 0);
      return () => clearTimeout(t);
    }

    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase, fetchProfile]);

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

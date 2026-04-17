"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./supabase";

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    let { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    // If no profile exists, create one (handles users who signed up before trigger existed)
    if (!data) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const newProfile = {
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || "",
          phone: authUser.user_metadata?.phone || "",
          role: "customer",
        };
        await supabase.from("profiles").upsert(newProfile);
        const { data: refetched } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();
        data = refetched;
      }
    }

    setProfile(data);
    return data;
  };

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      }
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, fullName, phone) => {
    // Step 1: Create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    // If signup itself failed completely, throw
    if (error) throw error;

    // Step 2: If we got a session back, user is auto-confirmed — done
    if (data.session) {
      setUser(data.session.user);
      await fetchProfile(data.session.user.id);
      return data;
    }

    // Step 3: No session means email confirmation is still on,
    // so try to sign in directly (works if auto_confirm trigger exists)
    if (data.user) {
      // Small delay to let the DB trigger run
      await new Promise((r) => setTimeout(r, 500));

      const { data: loginData, error: loginError } =
        await supabase.auth.signInWithPassword({ email, password });

      if (!loginError && loginData.session) {
        setUser(loginData.session.user);
        await fetchProfile(loginData.session.user.id);
        return loginData;
      }
    }

    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, fetchProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);
  const [profile, setProfile] = useState<{
    company_name: string | null;
    contact_name: string | null;
    revenue_share_percent: number;
  } | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setRolesLoaded(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setLoading(false);
        setRolesLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setProfile(null);
      setRolesLoaded(true);
      return;
    }

    setRolesLoaded(false);

    Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id),
      supabase
        .from("profiles")
        .select("company_name, contact_name, revenue_share_percent")
        .eq("user_id", user.id)
        .single(),
    ]).then(([rolesResult, profileResult]) => {
      setIsAdmin(rolesResult.data?.some((r) => r.role === "admin") ?? false);
      setProfile(profileResult.data);
      setRolesLoaded(true);
      setLoading(false);
    });
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Only report fully loaded when both auth and roles are ready
  return { user, session, loading: loading || !rolesLoaded, isAdmin, profile, signOut };
}

// src/context/AuthContext.jsx
// Login state (Supabase Auth). Passwords are checked by Supabase, which stores
// them only as bcrypt hashes. The role ("admin" or "govt") comes from the
// table public.staff. Only these 2 fixed accounts are in that table.
import { createContext, useContext, useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../supabase";

const AuthContext = createContext(null);

async function ambilRole(userId) {
  const { data, error } = await supabase
    .from("staff").select("role").eq("user_id", userId).maybeSingle();
    if (error) console.error("[role]", error.message);
  return error ? null : data?.role ?? null;
}

// Map Supabase errors to the codes that Login.jsx already knows.
function kodeError(error) {
  if (error.status === 429) return "auth/too-many-requests";
  if (error.name === "AuthRetryableFetchError" || /fetch/i.test(error.message)) return "auth/network-request-failed";
  return "auth/invalid-credential";
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [sessionReady, setSessionReady] = useState(!isSupabaseConfigured);
  const [roleReady, setRoleReady] = useState(true);

  // 1. Restore the saved session on page load, then follow login/logout.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setSessionReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2. Whenever the user changes, load the role.
  const userId = session?.user?.id ?? null;
  useEffect(() => {
    if (!userId) { setRole(null); setRoleReady(true); return; }
    let batal = false;
    setRoleReady(false);
    ambilRole(userId).then((r) => {
      if (batal) return;
      setRole(r);
      setRoleReady(true);
    });
    return () => { batal = true; };
  }, [userId]);

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
      const err = new Error("Supabase belum dikonfigurasi.");
      err.code = "app/not-configured";
      throw err;
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const err = new Error(error.message);
      err.code = kodeError(error);
      throw err;
    }
    const r = await ambilRole(data.user.id);
    if (!r) {
      await supabase.auth.signOut();
      const err = new Error("Akun ini tidak terdaftar sebagai admin kelurahan.");
      err.code = "app/not-admin";
      throw err;
    }
    setRole(r);
    return data.user;
  };

  const logout = async () => {
    if (supabase) await supabase.auth.signOut();
    setRole(null);
  };

  const value = {
    user: session?.user ?? null,
    role,                       // "admin" | "govt" | null
    isAdmin: !!role,            // true for BOTH fixed accounts (name kept for existing pages)
    loading: !sessionReady || !roleReady,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth harus dipakai di dalam <AuthProvider>");
  return ctx;
};
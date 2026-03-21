"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

type AuthMode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const supabase = createSupabaseBrowserClient();

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Authentication is not configured. Please set up Supabase environment variables.");
      return;
    }

    setError(null);
    setMessage(null);
    setLoading(true);

    if (mode === "signup") {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setMessage("Check your email for a confirmation link!");
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
      } else {
        router.push("/discover");
        router.refresh();
      }
    }

    setLoading(false);
  }

  async function handleGoogleAuth() {
    if (!supabase) {
      setError("Authentication is not configured. Please set up Supabase environment variables.");
      return;
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-surface/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl shadow-accent/5">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl cta-gradient flex items-center justify-center shadow-lg shadow-accent/20 mb-4">
              <span
                className="material-symbols-outlined text-white text-[28px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                spa
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-accent-light tracking-tight">Sanctuary</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-text-tertiary font-label mt-1">
              Digital Persona Platform
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 p-1 bg-surface-high rounded-lg border border-border mb-6">
            <button
              onClick={() => { setMode("login"); setError(null); setMessage(null); }}
              className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors ${
                mode === "login"
                  ? "bg-surface-highest text-text-primary shadow-sm"
                  : "text-muted hover:text-text-primary"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(null); setMessage(null); }}
              className={`flex-1 py-2 rounded-md text-[13px] font-medium transition-colors ${
                mode === "signup"
                  ? "bg-surface-highest text-text-primary shadow-sm"
                  : "text-muted hover:text-text-primary"
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google OAuth */}
          <button
            onClick={handleGoogleAuth}
            className="w-full py-2.5 rounded-xl bg-surface-highest border border-border text-text-primary font-medium text-[13px] flex items-center justify-center gap-3 hover:bg-surface-high transition-colors mb-4"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-text-tertiary text-[11px] font-label uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary/50 outline-none"
                  placeholder="Your full name"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary/50 outline-none"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-[12px] font-label font-bold text-text-tertiary uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg py-2.5 px-4 text-[13px] text-text-primary focus:ring-1 focus:ring-accent focus:border-accent placeholder:text-text-tertiary/50 outline-none"
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg">
                <p className="text-coral text-[12px]">{error}</p>
              </div>
            )}

            {message && (
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <p className="text-success text-[12px]">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl cta-gradient text-white font-bold text-[14px] shadow-lg shadow-accent/15 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-text-tertiary text-[11px] mt-6">
            By continuing, you confirm you are 18+ and agree to our Terms of Service.
          </p>
        </div>
      </div>
    </div>
  );
}

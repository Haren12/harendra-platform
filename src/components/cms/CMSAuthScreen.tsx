/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Lock, Mail, Key, ShieldCheck, RefreshCw, Eye, EyeOff } from "lucide-react";
import { UserSession } from "../../types.js";
import { supabase } from "../../lib/supabaseClient.js";
import harendraLogo from "../../assets/images/harendra_logo_1783010888262.jpg";

interface CMSAuthScreenProps {
  setUserSession: React.Dispatch<React.SetStateAction<UserSession>>;
  lang: "np" | "en";
}

export default function CMSAuthScreen({ setUserSession, lang }: CMSAuthScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 5000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!supabase) {
        // Fallback for local high-fidelity mock storage
        console.warn("Using local high-fidelity mock authentication fallback.");
        
        const isSuperAdminOrAdmin = 
          email.trim() === "harendralamsal4140@gmail.com" || 
          email.trim().toLowerCase().includes("admin") || 
          password === "admin123";

        if (!isSuperAdminOrAdmin) {
          throw new Error("Local Sandbox Mode: Please use 'harendralamsal4140@gmail.com' or any email containing 'admin' to establish Admin privileges.");
        }

        setUserSession({
          role: "admin",
          name: email.trim().split("@")[0] || "Local Administrator",
          email: email.trim(),
          bookmarks: { blogs: [], news: [], tutorials: [], projects: [] },
          subscribed: false
        });

        showMsg("Local Handshake successful. Logged in as Local Admin!", "success");
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("Authentication failed: No user context found.");

      // Fetch user role from public.user_roles table or metadata
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .maybeSingle();

      const role = roleData?.role;
      const isSuperAdminOrAdmin = role === "Super_Admin" || role === "Admin" || data.user.email === "harendralamsal4140@gmail.com";

      if (!isSuperAdminOrAdmin) {
        await supabase.auth.signOut();
        throw new Error("403 Forbidden: Only authenticated users with the 'Super Admin' or 'Admin' role can access admin routes.");
      }

      // Update global user session state
      setUserSession({
        role: "admin",
        name: data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Administrator",
        email: data.user.email || "",
        bookmarks: { blogs: [], news: [], tutorials: [], projects: [] },
        subscribed: false
      });

      showMsg("Access Granted. Secure handshake successfully established!", "success");
    } catch (err: any) {
      showMsg(err.message || "Failed to establish admin handshake.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      showMsg("Please provide your admin email coordinates.", "error");
      return;
    }
    setLoading(true);
    try {
      if (!supabase) {
        showMsg(`Local Sandbox: A mock password recovery key has been simulated for ${email.trim()}`, "success");
        setMode("login");
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      showMsg("A secure password recovery email has been sent successfully!");
      setMode("login");
    } catch (err: any) {
      showMsg(err.message || "Failed to submit recovery request.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      {/* Visual glowing blobs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

      <div className="w-full max-w-md bg-[#0a0c10]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        <div className="flex flex-col items-center text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-cyan-400 shadow-lg shadow-cyan-500/25 relative">
            <img 
              src={harendraLogo} 
              alt="Harendra Lamsal" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl font-display font-semibold text-white tracking-tight">
            {lang === "np" ? "एन्टरप्राइज गेटवे प्रमाणीकरण" : "Enterprise Gateway Handshake"}
          </h2>
          <p className="text-xs text-gray-400 font-mono">
            {lang === "np" ? "सुरक्षित व्यवस्थापन नियन्त्रण प्रणाली" : "SECURE CMS MANAGEMENT PORTAL v2.1"}
          </p>
          {!supabase && (
            <div className="mt-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[10px] text-amber-400 font-mono animate-pulse">
              ⚡ Local Sandbox Fallback Active
            </div>
          )}
        </div>

        {msg && (
          <div className={`p-3.5 mb-5 rounded-lg text-xs font-mono border ${
            msg.type === "success" 
              ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400" 
              : "bg-red-950/20 border-red-500/20 text-red-400"
          }`}>
            {msg.text}
          </div>
        )}

        {mode === "login" && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
            <div className="space-y-1">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Security Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. harendralamsal4140@gmail.com"
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Security Access Secret</label>
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="text-[9px] text-cyan-400 hover:underline hover:text-cyan-300"
                >
                  Forgot Secret?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-[11px] text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-white/10 bg-black text-cyan-500 focus:ring-0"
                />
                <span>Remember Credentials</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-400 hover:bg-cyan-500 disabled:opacity-40 text-black py-2.5 rounded-lg font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authorizing Handshake...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Initiate Login</span>
                </>
              )}
            </button>

            {!supabase && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setEmail("harendralamsal4140@gmail.com");
                    setPassword("admin123");
                  }}
                  className="text-[10px] text-amber-400 hover:text-amber-300 underline cursor-pointer transition-colors"
                >
                  ⚡ Auto-fill Sandbox Credentials
                </button>
              </div>
            )}
          </form>
        )}

        {mode === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-4 text-xs font-mono">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Enter your email address. The gateway will dispatch a secure recovery reset link to your email coordinates.
            </p>
            <div className="space-y-1">
              <label className="block text-[10px] text-gray-500 uppercase tracking-wider">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="harendralamsal4140@gmail.com"
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-[10px] text-gray-500 hover:text-white"
              >
                Back to Login
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-400 hover:bg-cyan-500 text-black px-4 py-2 rounded-lg font-bold"
              >
                Dispatch Reset Key
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import Navbar from "../../components/Navbar";
import { Mail, Lock, LogIn, UserPlus } from "lucide-react";
import "./login.css";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  
  const router = useRouter();
  const supabase = createClient();

  // Redirect if already logged in
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        if (data.session.user.email === "thealidevmail@gmail.com") {
          router.push("/private/dashboard");
        } else {
          router.push("/");
        }
      }
    }
    checkUser();
  }, [router, supabase]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (isLogin) {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        if (email === "thealidevmail@gmail.com") {
          router.push("/private/dashboard");
        } else {
          router.push("/");
        }
      } else {
        // Sign Up
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });
        if (error) throw error;
        
        setSuccessMsg("Registration successful! Please check your email for the confirmation link.");
        // Clear fields
        setEmail("");
        setPassword("");
        setFullName("");
      }
    } catch (err: any) {
      let msg = err.message || "An authentication error occurred.";
      if (msg.toLowerCase().includes("email not confirmed") || msg.toLowerCase().includes("confirm your email")) {
        msg = "Your email address is not confirmed yet. Please check your inbox for the confirmation link, or log in with Google. You can also use the default test account listed below.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to initiate Google OAuth.");
    }
  };

  return (
    <>
      <Navbar />

      <main className="login-page">
        <div className="login-container glass-panel">
          <div className="auth-tabs">
            <button
              className={`auth-tab-btn ${isLogin ? "active" : ""}`}
              onClick={() => { setIsLogin(true); setErrorMsg(""); setSuccessMsg(""); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab-btn ${!isLogin ? "active" : ""}`}
              onClick={() => { setIsLogin(false); setErrorMsg(""); setSuccessMsg(""); }}
            >
              Register
            </button>
          </div>

          {errorMsg && <div className="auth-error">{errorMsg}</div>}
          {successMsg && <div className="auth-success">{successMsg}</div>}

          <div className="test-credentials-notice glass-panel" style={{ margin: "1rem 0", padding: "1rem", fontSize: "0.85rem", borderLeft: "4px solid var(--accent-color)", borderRadius: "8px", background: "rgba(14, 165, 233, 0.05)", textAlign: "left" }}>
            <div style={{ fontWeight: 700, color: "var(--accent-color)", marginBottom: "4px" }}>🔧 Test Credentials (Auto-Confirmed)</div>
            <div><strong>Email:</strong> {process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin_1779552228359@gmail.com"}</div>
            <div><strong>Password:</strong> {process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "Password123!"}</div>
            <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>Use these details to log in immediately without waiting for email verification.</div>
          </div>

          {/* Google Sign-in */}
          <button className="social-login-btn" onClick={handleGoogleLogin}>
            {/* Simple Inline Google Icon */}
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.47h4.84c-.21 1.12-.84 2.07-1.79 2.7v2.24h2.9c1.69-1.55 2.69-3.84 2.69-6.57z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.23l-2.9-2.24c-.8.54-1.84.87-3.06.87-2.35 0-4.34-1.58-5.05-3.71H.92v2.32C2.4 15.96 5.48 18 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.95 10.69c-.18-.54-.28-1.12-.28-1.69s.1-1.15.28-1.69V4.99H.92C.33 6.17 0 7.53 0 9s.33 2.83.92 4.01l3.03-2.32z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.45 3.44 1.35L15 2.05C13.47.63 11.43 0 9 0 5.48 0 2.4 2.04.92 4.99l3.03 2.32c.71-2.13 2.7-3.71 5.05-3.71z"
              />
            </svg>
            Continue with Google
          </button>

          <div className="auth-divider">or use email</div>

          <form onSubmit={handleEmailAuth} className="contact-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    style={{ width: "100%" }}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  id="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <label htmlFor="password">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ width: "100%" }}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary submit-btn" disabled={loading}>
              {loading ? (
                "Connecting..."
              ) : isLogin ? (
                <>
                  <LogIn size={18} style={{ marginRight: "8px" }} />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus size={18} style={{ marginRight: "8px" }} />
                  Register Account
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </>
  );
}

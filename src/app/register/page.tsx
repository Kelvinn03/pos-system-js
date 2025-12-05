"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error ?? "Failed to register");
      }

      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg"></div>
      <div className="auth-content">
        {/* Left Brand Side */}
        <div className="auth-brand-side">
          <div className="auth-logo">POS.</div>
          <div className="auth-tagline">
            <div className="auth-tagline-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h1>Join thousands<br />of businesses.</h1>
            <p>
              Create your account and start managing your business efficiently with our powerful point of sale system.
            </p>
          </div>
        </div>

        {/* Right Form Side */}
        <div className="auth-form-side">
          <div className="auth-form-card animate-fade-in">
            <h2>Create Account</h2>
            <p className="auth-subtitle">
              Already have an account? <Link href="/login">Sign in.</Link>
            </p>

            {error && (
              <div className="auth-alert error">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-1A6 6 0 1 0 8 2a6 6 0 0 0 0 12zM7.25 5v4.5h1.5V5h-1.5zm0 6v1.5h1.5V11h-1.5z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="auth-input-group">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  name="name"
                  placeholder="Full name"
                  autoFocus
                  required
                />
              </div>

              <div className="auth-input-group">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  required
                />
              </div>

              <div className="auth-input-group">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  required
                />
                <label className="password-toggle">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                  />
                  Show
                </label>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={isLoading} style={{ marginTop: "0.5rem" }}>
                {isLoading ? "Creating account..." : "Register"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#64748b", marginTop: "1.25rem" }}>
              By registering, you agree to our <Link href="#" style={{ color: "#5c6bc0" }}>Terms of Service</Link> and <Link href="#" style={{ color: "#5c6bc0" }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
      {/* Footer */}
      <div className="auth-footer">
        <div className="auth-footer-links">
          <a href="#">Terms of Service</a>
          <a href="#">Privacy Policy</a>
        </div>
        <p className="auth-footer-copyright">
          © {new Date().getFullYear()} POS System. All rights reserved.
        </p>
      </div>
    </div>
  );
}

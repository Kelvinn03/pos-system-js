"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setIsSubmitted(true);
        setIsLoading(false);
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
                                <circle cx="12" cy="12" r="10" />
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                        </div>
                        <h1>Forgot your<br />password?</h1>
                        <p>
                            No worries! It happens to the best of us. We&apos;ll help you recover your account in no time.
                        </p>
                    </div>
                </div>

                {/* Right Form Side */}
                <div className="auth-form-side">
                    <div className="auth-form-card animate-fade-in">
                        <h2>Reset Password</h2>
                        <p className="auth-subtitle">
                            Remember it? <Link href="/login">Back to login.</Link>
                        </p>

                        {isSubmitted ? (
                            <div className="auth-alert success">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm-.287-4.52l4.5-4.5-1.06-1.06-3.94 3.94-1.77-1.77-1.06 1.06 2.83 2.83z" />
                                </svg>
                                Check your email for reset instructions.
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <div className="auth-input-group">
                                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <button type="submit" className="auth-submit-btn" disabled={isLoading} style={{ marginTop: "0.5rem" }}>
                                    {isLoading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>
                        )}
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

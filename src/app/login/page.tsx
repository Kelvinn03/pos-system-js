"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    router.push("/");
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-gradient px-3 py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-10 col-lg-8">
            <div className="card shadow border-0 overflow-hidden login-card">
              <div className="row g-0">
                <div className="col-lg-5 bg-dark text-white p-4 d-flex flex-column justify-content-center gap-3">
                  <div>
                    <div className="brand-pill mb-3">POS</div>
                    <p className="text-uppercase letter-spacing-small small mb-2">POS System UAS Front-end</p>
                    <h2 className="h3 mb-2">Welcome back!</h2>
                  </div>
                  <p className="text-white-50 mb-0">
                    Sign in to manage products, run the POS terminal, and review transactions.
                  </p>
                  <div>
                    <p className="text-white-50 small mb-1">Don&apos;t have an account yet?</p>
                    <a href="/register" className="link-light fw-semibold">
                      Create one here
                    </a>
                  </div>
                </div>
                <div className="col-lg-7 p-4 p-lg-5 bg-white">
                  <h1 className="h4 mb-4">Login to your account</h1>
                  <div className={`alert ${error ? "alert-danger" : "alert-light text-muted border"}`} role="alert">
                    {error ? error : "Enter your credentials to access the POS dashboard."}
                  </div>
                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        autoFocus
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <label htmlFor="password" className="form-label mb-0">
                          Password
                        </label>
                        <a className="text-muted small text-decoration-none" href="#">
                          Forgot password?
                        </a>
                      </div>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        name="password"
                        required
                      />
                    </div>
                    <div className="form-check mb-4">
                      <input className="form-check-input" type="checkbox" value="" id="remember" defaultChecked />
                      <label className="form-check-label" htmlFor="remember">
                        Remember me
                      </label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100 py-2" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                    <p className="text-muted small mt-3 mb-0 text-center">
                      New to the system? <a href="/register">Register here</a>
                    </p>
                  </form>
                </div>
              </div>
            </div>
            <p className="text-center text-white-50 small mt-3">
              Powered by Kelvin POS Platform
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

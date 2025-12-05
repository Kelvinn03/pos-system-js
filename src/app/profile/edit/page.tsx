"use client";

import React, { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function EditProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data?.error || "Update failed" });
      } else {
        setMessage({ type: "success", text: "Profile updated successfully." });
        // if password changed or email changed we recommend sign out/in
        if (newPassword) {
          setTimeout(() => {
            signOut({ callbackUrl: "/login" });
          }, 800);
        }
      }
    } catch (err: any) {
      setMessage({ type: "error", text: String(err?.message || err) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-12">
          <h3 className="mb-3">Edit Profile</h3>

          {message && (
            <div className={`alert ${message.type === "success" ? "alert-success" : "alert-danger"}`} role="alert">
              {message.text}
            </div>
          )}

          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input className="form-control" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <hr />

                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input className="form-control" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Required to change password or email" />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">New Password</label>
                    <input className="form-control" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input className="form-control" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Save Changes"}</button>
                  <button className="btn btn-outline-secondary" type="button" onClick={() => { setName(user?.name ?? ""); setEmail(user?.email ?? ""); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setMessage(null); }}>Reset</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

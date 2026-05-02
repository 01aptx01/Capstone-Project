"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginCard() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate auth for now
    setTimeout(() => {
      setLoading(false);
      router.push("/");
    }, 600);
  };

  return (
    <div className="login-card">
      <div className="login-avatar">
        <Image src="/Logo_modpao.png" alt="logo" width={56} height={56} priority />
      </div>

      <h1 className="login-title">MOD PAO</h1>
      <div className="login-subtitle">admin</div>

      <form onSubmit={handleSubmit} className="mt-4">
        <label className="login-label">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="login-input" />

        <label className="login-label">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" />

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}


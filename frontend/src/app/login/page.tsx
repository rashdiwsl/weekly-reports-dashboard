"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { refreshUser } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      await refreshUser();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="bg-zinc-900 p-8 rounded-xl w-full max-w-sm space-y-4 border border-zinc-800"
      >
        <h1 className="text-2xl font-bold">Login</h1>

        {error && (
          <p className="text-red-500 text-sm bg-red-950 p-2 rounded">{error}</p>
        )}

        <div>
          <label className="text-sm text-zinc-400">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="text-sm text-zinc-400">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors py-2 rounded font-medium disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-zinc-400 text-center">
          Don't have an account?{" "}
          <a href="/register" className="text-emerald-500 hover:underline">
            Register
          </a>
        </p>
      </form>
    </div>
  );
}
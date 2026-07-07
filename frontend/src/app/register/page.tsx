"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("team_member");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(name, email, password, role);
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Registration failed");
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
        <h1 className="text-2xl font-bold">Register</h1>

        {error && (
          <p className="text-red-500 text-sm bg-red-950 p-2 rounded">{error}</p>
        )}

        <div>
          <label className="text-sm text-zinc-400">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-emerald-500"
          />
        </div>

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

        <div>
          <label className="text-sm text-zinc-400">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full mt-1 p-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-emerald-500"
          >
            <option value="team_member">Team Member</option>
            <option value="manager">Manager</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 transition-colors py-2 rounded font-medium disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-sm text-zinc-400 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-emerald-500 hover:underline">
            Login
          </a>
        </p>
      </form>
    </div>
  );
}
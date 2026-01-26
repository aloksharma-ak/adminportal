"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Spotlight } from "@/components/ui/spotlight";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";

type Mode = "login" | "register";

type LoginResponse =
  | { ok: true; message: string; user: { userId: string; userName: string } }
  | { ok: false; message: string; status?: number; data?: unknown };

type RegisterResponse =
  | { ok: true; message: string; user: { userId: string; userName: string } }
  | { ok: false; message: string; status?: number; data?: unknown };

export default function AuthPage() {
  const router = useRouter();

  const [mode, setMode] = React.useState<Mode>("login");

  const [username, setUsername] = React.useState<string>("");
  const [password, setPassword] = React.useState<string>("");

  const [firstName, setFirstName] = React.useState<string>("");
  const [lastName, setLastName] = React.useState<string>("");
  const [userName, setUserName] = React.useState<string>("");
  const [regPassword, setRegPassword] = React.useState<string>("");
  const [confirmPassword, setConfirmPassword] = React.useState<string>("");

  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    resetMessages();
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetMessages();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const json = (await res.json()) as LoginResponse;

      if (!res.ok || !json.ok) {
        throw new Error(json?.message || "Invalid credentials");
      }

      setSuccess(json.message || "Login success");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetMessages();

    if (regPassword !== confirmPassword) {
      setError("Password and Confirm Password must match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          userName,
          password: regPassword,
        }),
      });

      const json = (await res.json()) as RegisterResponse;

      if (!res.ok || !json.ok) {
        throw new Error(json?.message || "Registration failed");
      }

      setError(null);
      setSuccess("Account created. Logging you in...");

      const loginRes = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, password: regPassword }),
      });

      const loginJson = (await loginRes.json()) as LoginResponse;

      if (!loginRes.ok || !loginJson.ok) {
        throw new Error(
          loginJson?.message || "Auto login failed. Please login manually.",
        );
      }

      setSuccess("Logged in successfully. Redirecting...");
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-70 dark:opacity-60"
        fill="rgb(59 130 246)"
      />

      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-6 text-center">
            <Link href="/" className="text-4xl font-extrabold">
              <span className="bg-linear-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                CuetPlus
              </span>
            </Link>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {mode === "login"
                ? "Welcome back. Login to continue."
                : "Create your account to continue."}
            </p>
          </div>

          {/* Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
            <BorderBeam size={260} duration={12} delay={4} />

            {/* Toggle */}
            <div className="mb-5 grid grid-cols-2 rounded-2xl border border-slate-200 bg-white/60 p-1 text-sm dark:border-white/10 dark:bg-white/5">
              <button
                type="button"
                onClick={() => switchMode("login")}
                className={`h-10 rounded-2xl font-semibold transition ${
                  mode === "login"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10"
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => switchMode("register")}
                className={`h-10 rounded-2xl font-semibold transition ${
                  mode === "register"
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-700 hover:bg-white/70 dark:text-slate-200 dark:hover:bg-white/10"
                }`}
              >
                Register
              </button>
            </div>

            {/* Messages */}
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                {success}
              </div>
            ) : null}

            {/* Forms */}
            {mode === "login" ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Username</label>
                  <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="john123"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <ShimmerButton
                  type="submit"
                  className="h-11 w-full rounded-2xl"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </ShimmerButton>

                <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("register")}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Register
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">First Name</label>
                    <input
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="Alok"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Last Name</label>
                    <input
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="Sharma"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Username</label>
                  <input
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="john123"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <ShimmerButton
                  type="submit"
                  className="h-11 w-full rounded-2xl"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
                      Creating account...
                    </span>
                  ) : (
                    "Create account"
                  )}
                </ShimmerButton>

                <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-semibold text-blue-600 hover:underline"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

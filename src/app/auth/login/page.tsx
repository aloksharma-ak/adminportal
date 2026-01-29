"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { signIn, useSession } from "next-auth/react";

import { Spotlight } from "@/components/ui/spotlight";
import { BorderBeam } from "@/components/ui/border-beam";
import { ShimmerButton } from "@/components/ui/shimmer-button";

type Mode = "login" | "register";

type FormValues = {
  // login
  username: string;
  password: string;

  // register
  firstName: string;
  lastName: string;
  userName: string;
  regPassword: string;
  confirmPassword: string;
};

function prettyAuthError(err?: string | null) {
  if (!err) return null;

  // NextAuth typical credential error
  if (err === "CredentialsSignin") return "Invalid username or password";
  if (err === "AccessDenied") return "Access denied";
  return err;
}

export default function AuthPage() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const authError = prettyAuthError(searchParams.get("error"));

  const [mode, setMode] = React.useState<Mode>("login");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      userName: "",
      regPassword: "",
      confirmPassword: "",
    },
  });

  function resetMessages() {
    setError(null);
    setSuccess(null);
  }

  function switchMode(next: Mode) {
    setMode(next);
    resetMessages();
    setLoading(false);
  }

  // ✅ Client-safe redirect when already authenticated
  React.useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard/");
    }
  }, [status, router]);

  const onSubmit = async (data: FormValues) => {
    resetMessages();
    setLoading(true);

    try {
      if (mode === "login") {
        // ✅ Use redirect:false so we can show errors nicely
        const res = await signIn("credentials", {
          username: data.username,
          password: data.password,
          redirect: false,
        });

        if (!res || res.error) {
          setError(prettyAuthError(res?.error) || "Login failed");
          setLoading(false);
          return;
        }

        setSuccess("Login success. Redirecting...");
        router.push("/dashboard/");
        return;
      }

      // ✅ Register
      if (data.regPassword !== data.confirmPassword) {
        setError("Password and Confirm Password must match");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          userName: data.userName,
          password: data.regPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok || json?.status === false) {
        throw new Error(json?.message || "Registration failed");
      }

      setSuccess("Account created. Logging you in...");

      // ✅ Auto login after register
      const loginRes = await signIn("credentials", {
        username: data.userName,
        password: data.regPassword,
        redirect: false,
      });

      if (!loginRes || loginRes.error) {
        throw new Error("Auto login failed. Please login manually.");
      }

      router.push("/dashboard/");

      // optional clear
      setValue("firstName", "");
      setValue("lastName", "");
      setValue("userName", "");
      setValue("regPassword", "");
      setValue("confirmPassword", "");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

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
            {authError ? (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {authError}
              </div>
            ) : null}

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

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {mode === "login" ? (
                <>
                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <input
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="john123"
                      type="text"
                      {...register("username", {
                        required: "This is required",
                      })}
                    />
                    {errors.username?.message ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                        {errors.username.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <input
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="••••••••"
                      type="password"
                      {...register("password", {
                        required: "This is required",
                      })}
                    />
                    {errors.password?.message ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                        {errors.password.message}
                      </p>
                    ) : null}
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
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium">First Name</label>
                      <input
                        className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Alok"
                        {...register("firstName", {
                          required: "This is required",
                        })}
                      />
                      {errors.firstName?.message ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                          {errors.firstName.message}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="text-sm font-medium">Last Name</label>
                      <input
                        className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                        placeholder="Sharma"
                        {...register("lastName", {
                          required: "This is required",
                        })}
                      />
                      {errors.lastName?.message ? (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                          {errors.lastName.message}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Username</label>
                    <input
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="john123"
                      {...register("userName", {
                        required: "This is required",
                      })}
                    />
                    {errors.userName?.message ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                        {errors.userName.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Password</label>
                    <input
                      type="password"
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="••••••••"
                      {...register("regPassword", {
                        required: "This is required",
                      })}
                    />
                    {errors.regPassword?.message ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                        {errors.regPassword.message}
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="text-sm font-medium">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      className="mt-1 h-11 w-full rounded-2xl border border-slate-200 bg-white/70 px-4 text-sm outline-none focus:ring-2 focus:ring-blue-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
                      placeholder="••••••••"
                      {...register("confirmPassword", {
                        required: "This is required",
                      })}
                    />
                    {errors.confirmPassword?.message ? (
                      <p className="mt-1 text-xs text-red-600 dark:text-red-300">
                        {errors.confirmPassword.message}
                      </p>
                    ) : null}
                  </div>

                  <ShimmerButton
                    type="submit"
                    className="h-11 w-full rounded-2xl"
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create account"}
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
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

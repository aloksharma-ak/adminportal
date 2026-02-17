import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";

import { ActionButton } from "@/components/controls/Buttons";
import { authOptions } from "../api/auth/[...nextauth]/auth";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/dashboard");

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Background image */}
      <div className="absolute inset-0">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-slate-950/55 to-slate-950/90" />
        <div className="absolute inset-0 bg-[radial-linear(circle_at_20%_20%,rgba(59,130,246,0.28),transparent_55%),radial-linear(circle_at_80%_30%,rgba(34,211,238,0.18),transparent_50%),radial-linear(circle_at_50%_90%,rgba(168,85,247,0.18),transparent_55%)]" />
      </div>

      {/* Subtle floating glow blobs */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Left: Text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Premium Admin Portal
              <span className="mx-1 text-white/30">•</span>
              Secure & Fast
            </div>

            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Welcome to{" "}
              <span className="bg-linear-to-r from-cyan-300 via-blue-300 to-fuchsia-300 bg-clip-text text-transparent">
                Admin Portal
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
              Manage users, analytics, and operations with a clean interface
              built for speed, security, and clarity.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/auth/login" className="inline-flex">
                <ActionButton
                  className="group h-12 w-full rounded-2xl px-5 sm:w-auto"
                  type="button"
                  leftIcon={<ShieldCheck className="h-4 w-4" />}
                  rightIcon={
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  }
                >
                  Login to Continue
                </ActionButton>
              </Link>

              <div className="text-sm text-white/60">
                <span className="font-medium text-white/80">Tip:</span> Use your
                Organisation Code for branded login.
              </div>
            </div>

            {/* Trust badges */}
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur">
                <div className="font-semibold text-white/85">
                  Role Based Access
                </div>
                <div className="text-xs text-white/55">
                  Secure permissions & audit-ready
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur">
                <div className="font-semibold text-white/85">
                  Fast Onboarding
                </div>
                <div className="text-xs text-white/55">
                  OrgCode → Branded login in seconds
                </div>
              </div>
            </div>
          </div>

          {/* Right: Premium glass card */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-[28px] bg-linear-to-r from-cyan-500/30 via-blue-500/20 to-fuchsia-500/25 blur-xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-white/85">
                  Dashboard Preview
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                  Live-ready UI
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/55">Total Users</div>
                  <div className="mt-2 text-2xl font-bold">12,480</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[72%] rounded-full bg-white/70" />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/55">Active Today</div>
                  <div className="mt-2 text-2xl font-bold">1,304</div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full w-[54%] rounded-full bg-white/70" />
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-xs text-white/55">System Status</div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="text-sm font-semibold text-white/85">
                      All services operational
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[11px] text-white/55">Auth</div>
                      <div className="mt-1 text-sm font-semibold text-white/85">
                        Healthy
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[11px] text-white/55">API</div>
                      <div className="mt-1 text-sm font-semibold text-white/85">
                        Healthy
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[11px] text-white/55">DB</div>
                      <div className="mt-1 text-sm font-semibold text-white/85">
                        Healthy
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-white/10 bg-linear-to-r from-white/10 to-white/5 p-4">
                    <div className="text-sm font-semibold text-white/85">
                      Ready to sign in?
                    </div>
                    <div className="mt-1 text-xs text-white/60">
                      Continue with your Organisation Code and credentials.
                    </div>

                    <div className="mt-4">
                      <Link href="/auth/login" className="inline-flex w-full">
                        <ActionButton
                          className="group h-11 w-full rounded-2xl"
                          type="button"
                          rightIcon={
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                          }
                        >
                          Go to Login
                        </ActionButton>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /Right */}
        </div>
      </div>
    </main>
  );
}

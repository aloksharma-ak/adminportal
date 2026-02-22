"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, Activity, TrendingUp, Users, Zap } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Metric {
  label: string;
  value: number;
  delta: number;
  unit?: string;
  trend: "up" | "down" | "stable";
}

interface ServiceStatus {
  name: string;
  latency: number;
  status: "healthy" | "degraded" | "down";
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function nudge(val: number, maxDelta: number, min: number, max: number) {
  return clamp(val + randBetween(-maxDelta, maxDelta), min, max);
}

// ─── Animated Counter ────────────────────────────────────────────────────────

function AnimatedCounter({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prev = useRef(value);

  useEffect(() => {
    const start = prev.current;
    const end = value;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = end;
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

// ─── Sparkline ───────────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 120;
  const h = 28;
  const pts = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ─── Pulse Dot ───────────────────────────────────────────────────────────────

function PulseDot({ status }: { status: "healthy" | "degraded" | "down" }) {
  const colorMap = {
    healthy: "#34d399",   // emerald-400
    degraded: "#fbbf24",  // amber-400
    down: "#ef4444",      // red-500
  };
  const color = colorMap[status];
  return (
    <span className="relative flex h-2 w-2">
      <span
        className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Page() {
  // ── Metrics state ──────────────────────────────────────────────
  const [metrics, setMetrics] = useState<Metric[]>([
    { label: "Total Users", value: 12_480, delta: 0, trend: "up" },
    { label: "Active Now", value: 1_304, delta: 0, trend: "up" },
  ]);

  const [services, setServices] = useState<ServiceStatus[]>([
    { name: "Auth", latency: 12, status: "healthy" },
    { name: "API", latency: 28, status: "healthy" },
    { name: "DB", latency: 8, status: "healthy" },
  ]);

  const [requests, setRequests] = useState(randBetween(820, 960));
  const [reqHistory, setReqHistory] = useState<number[]>(
    Array.from({ length: 20 }, () => randBetween(700, 1000))
  );
  const [activeHistory, setActiveHistory] = useState<number[]>(
    Array.from({ length: 20 }, () => randBetween(1100, 1500))
  );

  const [uptime] = useState("99.98%");
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [tick, setTick] = useState(0);

  // ── Live update every 2s ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const [users, active] = prev;
        const newActive = nudge(active.value, 12, 900, 1800);
        const newUsers = users.value + randBetween(0, 3);
        return [
          { ...users, value: newUsers, delta: newUsers - users.value, trend: "up" },
          { ...active, value: newActive, delta: newActive - active.value, trend: newActive > active.value ? "up" : "down" },
        ];
      });

      setServices((prev) =>
        prev.map((s) => {
          const newLatency = nudge(s.latency, 4, 4, 120);
          const newStatus: ServiceStatus["status"] =
            newLatency > 110 ? "down" : newLatency > 80 ? "degraded" : "healthy";
          return { ...s, latency: newLatency, status: newStatus };
        })
      );

      const newReq = nudge(requests, 40, 600, 1200);
      setRequests(newReq);
      setReqHistory((h) => [...h.slice(1), newReq]);
      setActiveHistory((h) => {
        const last = h[h.length - 1];
        const next = nudge(last, 12, 900, 1800);
        return [...h.slice(1), next];
      });

      setLastUpdated(new Date());
      setTick((t) => t + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [requests]);

  const allHealthy = services.every((s) => s.status === "healthy");

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* ── Background ── */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-slate-950/55 to-slate-950/90" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-linear(circle at 20% 20%, rgba(59,130,246,0.28) 0%, transparent 55%), radial-linear(circle at 80% 30%, rgba(34,211,238,0.18) 0%, transparent 50%), radial-linear(circle at 50% 90%, rgba(168,85,247,0.18) 0%, transparent 55%)",
          }}
        />
      </div>

      {/* Glow blobs */}
      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-500/15 blur-3xl" />

      {/* ── Content ── */}
      <div className="relative mx-auto flex min-h-screen max-w-6xl items-center px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-2">

          {/* ── Left: Copy ── */}
          <div className="text-center md:text-left">
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

            <div className="mt-7 flex flex-col gap-3 sm:flex-row items-center">
              <Link href="/auth/login" className="inline-flex">
                <button
                  className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-400/30"
                  type="button"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Login to Continue
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="hidden mt-8 md:flex flex-wrap gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur">
                <div className="font-semibold text-white/85">Role Based Access</div>
                <div className="text-xs text-white/55">Secure permissions & audit-ready</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur">
                <div className="font-semibold text-white/85">Fast Onboarding</div>
                <div className="text-xs text-white/55">OrgCode → Branded login in seconds</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70 backdrop-blur">
                <div className="font-semibold text-white/85">Uptime {uptime}</div>
                <div className="text-xs text-white/55">SLA-backed infrastructure</div>
              </div>
            </div>
          </div>

          {/* ── Right: Live Dashboard Card ── */}
          <div className="relative">
            <div className="absolute -inset-1 rounded-[28px] bg-linear-to-r from-cyan-500/30 via-blue-500/20 to-fuchsia-500/25 blur-xl" />
            <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl">

              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white/85">
                  <Activity className="h-4 w-4 text-cyan-300" />
                  Live Dashboard
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                    Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              </div>

              {/* Metric cards */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                {/* Total Users */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-white/55">
                    <Users className="h-3 w-3" />
                    Total Users
                  </div>
                  <div className="mt-2 text-2xl font-bold tabular-nums">
                    <AnimatedCounter value={metrics[0].value} />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    <TrendingUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-xs text-emerald-400">
                      +{metrics[0].delta > 0 ? metrics[0].delta : 0} today
                    </span>
                  </div>
                  <div className="mt-3">
                    <Sparkline data={activeHistory} color="rgba(34,211,238,0.7)" />
                  </div>
                </div>

                {/* Active Now */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center gap-1.5 text-xs text-white/55">
                    <Zap className="h-3 w-3" />
                    Active Now
                  </div>
                  <div className="mt-2 text-2xl font-bold tabular-nums">
                    <AnimatedCounter value={metrics[1].value} />
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                    {metrics[1].trend === "up" ? (
                      <TrendingUp className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <TrendingUp className="h-3 w-3 rotate-180 text-rose-400" />
                    )}
                    <span
                      className={`text-xs ${metrics[1].trend === "up" ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                      {metrics[1].delta > 0 ? "+" : ""}
                      {metrics[1].delta} sessions
                    </span>
                  </div>
                  <div className="mt-3">
                    <Sparkline data={activeHistory} color="rgba(168,85,247,0.7)" />
                  </div>
                </div>
              </div>

              {/* Requests/s bar */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/55">API Requests / min</div>
                  <div className="text-sm font-bold tabular-nums text-white/90">
                    <AnimatedCounter value={requests} />
                  </div>
                </div>
                <div className="mt-3">
                  <Sparkline data={reqHistory} color="rgba(59,130,246,0.75)" />
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                    style={{ width: `${((requests - 600) / 600) * 100}%` }}
                  />
                </div>
              </div>

              {/* System Status */}
              <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white/55">System Status</div>
                  <div className="flex items-center gap-1.5">
                    <PulseDot status={allHealthy ? "healthy" : "degraded"} />
                    <span className="text-xs font-medium text-white/80">
                      {allHealthy ? "All systems operational" : "Degraded"}
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {services.map((s) => (
                    <div key={s.name} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[11px] text-white/55">{s.name}</div>
                        <PulseDot status={s.status} />
                      </div>
                      <div className="mt-1 text-xs font-semibold text-white/85 capitalize">
                        {s.status}
                      </div>
                      <div className="mt-0.5 text-[11px] tabular-nums text-white/45">
                        <AnimatedCounter value={s.latency} />ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="mt-4 rounded-2xl border border-white/10 bg-linear-to-r from-white/10 to-white/5 p-4">
                <div className="text-sm font-semibold text-white/85">Ready to sign in?</div>
                <div className="mt-1 text-xs text-white/60">
                  Continue with your Organisation Code and credentials.
                </div>
                <div className="mt-4">
                  <Link href="/auth/login" className="block w-full">
                    <button
                      className="group flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-cyan-500 to-blue-600 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 transition hover:from-cyan-400 hover:to-blue-500"
                      type="button"
                    >
                      Go to Login
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
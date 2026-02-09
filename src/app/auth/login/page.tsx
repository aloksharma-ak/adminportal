"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Globe, Mail, Phone, ExternalLink } from "lucide-react";

import { Spotlight } from "@/components/ui/spotlight";
import { BorderBeam } from "@/components/ui/border-beam";

import { OrganisationForm, type LoginFormValues } from "./OrganisationForm";
import { LoginForm } from "./LoginForm";
import { ActionButton } from "@/components/controls/Buttons";
import { Organisation } from "@/shared-types/organisation.types";
import { getOrganisationDetailAction, uploadBase64Image } from "@/app/utils";

function prettyAuthError(err?: string | null) {
  if (!err) return null;
  if (err === "CredentialsSignin") return "Invalid username / password / Org";
  if (err === "AccessDenied") return "Access denied";
  return err;
}

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const searchParams = useSearchParams();
  const authError = prettyAuthError(searchParams.get("error"));

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [step, setStep] = React.useState<"org" | "login">("org");
  const [org, setOrg] = React.useState<Organisation | null>(null);
  const [logoSrc, setLogoSrc] = React.useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    defaultValues: {
      orgCode: "",
      orgId: "",
      username: "",
      password: "",
    },
    mode: "onSubmit",
  });

  const resetMessages = React.useCallback(() => {
    setError(null);
    setSuccess(null);
  }, []);

  React.useEffect(() => {
    if (status === "authenticated") router.replace("/dashboard/");
  }, [status, router]);

  const brandColor: string | undefined = org?.brandColor ?? undefined;
  const brandName = org?.orgName || "Welcome back";

  const submitOrgCode = React.useCallback(
    async (orgCode: string) => {
      resetMessages();
      setLoading(true);

      try {
        const result = await getOrganisationDetailAction(orgCode);

        if (!result.success) {
          setError(result.message);
          return;
        }

        setOrg(result.organisation);
        form.setValue("orgId", String(result.organisation.orgId));
        setStep("login");
        setSuccess("Organisation verified. Please login.");
      } finally {
        setLoading(false);
      }
    },
    [form, resetMessages],
  );

  const submitLogin = React.useCallback(
    async (data: LoginFormValues) => {
      resetMessages();
      setLoading(true);

      try {
        const res = await signIn("credentials", {
          username: data.username.trim(),
          password: data.password,
          orgId: data.orgId,
          orgCode: data.orgCode,
          redirect: false,
        });

        if (!res || res.error) {
          setError(prettyAuthError(res?.error) || "Login failed");
          return;
        }

        setSuccess("Login success. Redirecting...");
        router.push("/dashboard/");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [router, resetMessages],
  );

  const goBackToOrg = React.useCallback(() => {
    resetMessages();
    setStep("org");
    setOrg(null);
    form.setValue("orgId", "");
    form.setValue("username", "");
    form.setValue("password", "");
  }, [form, resetMessages]);

  React.useEffect(() => {
    let active = true;
    setLogoSrc(null); // reset when org changes

    async function run() {
      const raw = org?.logo?.trim();
      if (!raw) return;

      try {
        // already URL/path
        if (
          raw.startsWith("/") ||
          raw.startsWith("http://") ||
          raw.startsWith("https://")
        ) {
          if (active) setLogoSrc(raw);
          return;
        }

        const dataUrl = raw.startsWith("data:image/")
          ? raw
          : `data:image/png;base64,${raw}`;

        const url = await uploadBase64Image(dataUrl);
        if (active) setLogoSrc(url?.trim() || null);
      } catch (e) {
        console.error(e);
        if (active) setLogoSrc(null);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [org?.logo]);

  const website = org?.website?.trim() || "";
  const email = org?.email?.trim() || "";
  const phone = org?.phone?.trim() || "";

  const showLeftPanel = Boolean(org);

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-70 dark:opacity-60"
        fill={brandColor}
      />

      <div
        className={`mx-auto grid min-h-screen w-full place-items-center px-4 py-8 sm:px-6 ${
          showLeftPanel ? "max-w-5xl" : "max-w-xl"
        }`}
      >
        <div
          className={`grid w-full grid-cols-1 gap-4 ${
            showLeftPanel ? "lg:grid-cols-2" : ""
          }`}
        >
          {/* LEFT SIDE: BRAND / CONTACT (only when org is available) */}
          {showLeftPanel && (
            <section className="relative overflow-hidden bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 md:p-8">
              <div className="flex flex-col items-center gap-4">
                {logoSrc && (
                  <div className="relative aspect-square w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-white/10 sm:w-20 md:w-24">
                    <Image
                      src={logoSrc}
                      alt={org?.orgName ?? "Organisation Logo"}
                      fill
                      sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                      priority
                      className="object-contain"
                    />
                  </div>
                )}

                <h1
                  className="text-center text-2xl font-extrabold md:text-3xl lg:text-4xl"
                  style={{ color: brandColor }}
                >
                  {org?.orgName ?? "Organisation Portal"}
                </h1>
              </div>

              <div className="mt-8 space-y-3">
                {/* Visit Site */}
                {website ? (
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {website}
                    </span>
                    <ExternalLink className="h-4 w-4 opacity-70 transition group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                    </span>
                    <span>Not available</span>
                  </div>
                )}

                {/* Mailto */}
                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
                  >
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Mailto
                    </span>
                    <span className="truncate pl-3 text-slate-700 dark:text-slate-300">
                      {email}
                    </span>
                  </a>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Mailto
                    </span>
                    <span>Not available</span>
                  </div>
                )}

                {/* Phone */}
                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
                  >
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone No.
                    </span>
                    <span className="pl-3 text-slate-700 dark:text-slate-300">
                      {phone}
                    </span>
                  </a>
                ) : (
                  <div className="flex items-center justify-between rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
                    <span className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone No.
                    </span>
                    <span>Not available</span>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* RIGHT SIDE: FORM (always visible) */}
          <section
            className={`relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 ${
              !showLeftPanel ? "mx-auto w-full max-w-xl" : ""
            }`}
          >
            <BorderBeam size={260} duration={12} delay={4} />

            <div className="mb-5 text-center">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {step === "org"
                  ? "Verify Organisation"
                  : `Login to ${brandName}`}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {step === "org"
                  ? "Enter your Organisation Code to continue."
                  : "Enter your credentials to access dashboard."}
              </p>
            </div>

            {authError && (
              <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-200">
                {authError}
              </div>
            )}

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
                {success}
              </div>
            )}

            {step === "org" ? (
              <OrganisationForm
                control={form.control}
                handleSubmit={form.handleSubmit}
                loading={loading}
                onContinue={submitOrgCode}
              />
            ) : org ? (
              <LoginForm
                org={org}
                control={form.control}
                register={form.register}
                handleSubmit={form.handleSubmit}
                loading={loading}
                onBack={goBackToOrg}
                onLogin={submitLogin}
              />
            ) : (
              <div className="space-y-3">
                <div className="text-sm text-slate-600 dark:text-slate-300">
                  Organisation not loaded.
                </div>
                <ActionButton
                  type="button"
                  color={brandColor}
                  onClick={goBackToOrg}
                  className="h-11 w-full rounded-2xl"
                  leftIcon={<ArrowLeft className="h-4 w-4" />}
                >
                  Back
                </ActionButton>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

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
  const [logoSrc, setLogoSrc] = React.useState("");

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

    async function run() {
      if (!org?.logo) return;
      try {
        const url = await uploadBase64Image(
          `data:image/png;base64,${org.logo}`,
        );
        if (active) setLogoSrc(url);
      } catch (e) {
        console.error(e);
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [org?.logo]);

  return (
    <main className="relative overflow-hidden bg-white dark:bg-slate-950">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-70 dark:opacity-60"
        fill={brandColor}
      />

      <div className="grid h-screen w-full grow grid-cols-1 place-items-center">
        <div className="w-full max-w-104 p-4 sm:px-5">
          <div className="mb-6 text-center">
            <Link
              href="/"
              aria-label={org?.orgName ? `${org.orgName} home` : "Home"}
              className="inline-flex items-center justify-center"
            >
              {org?.logo ? (
                <Image
                  src={logoSrc}
                  alt={org.orgName ?? "Logo"}
                  width={140}
                  height={56}
                  priority
                  className="h-14 w-auto object-contain"
                />
              ) : (
                <span
                  className="text-3xl md:text-4xl font-extrabold"
                  style={{ color: brandColor }}
                >
                  {org?.orgName ?? ""}
                </span>
              )}
            </Link>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {step === "org"
                ? "Enter your Organisation Code to continue."
                : `Login to ${brandName}`}
            </p>
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
            <BorderBeam size={260} duration={12} delay={4} />

            {org?.logo && (
              <div className="mb-4 flex items-center justify-center">
                <Image
                  src={org.logo}
                  alt={org.orgName ?? "Organisation Logo"}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-2xl border border-slate-200 object-contain bg-white p-2 dark:border-white/10"
                />
              </div>
            )}

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
          </div>
        </div>
      </div>
    </main>
  );
}

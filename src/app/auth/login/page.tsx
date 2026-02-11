"use client";

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
import { toast } from "sonner";
import {
  clearImageFromSession,
  getImagesFromSession,
  setImagesToSession,
  toImageSrc,
} from "@/lib/image-session.client";
import { getOrganisationDetail } from "@/app/utils";

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

  // ✅ show auth error from URL once
  const authErrorToastedRef = React.useRef(false);
  React.useEffect(() => {
    if (authError && !authErrorToastedRef.current) {
      toast.error(authError);
      authErrorToastedRef.current = true;
    }
  }, [authError]);

  const resetMessages = React.useCallback(() => {
    toast.dismiss();
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

      const tId = toast.loading("Verifying organisation...");

      try {
        const result = await getOrganisationDetail(orgCode);

        if (!result.success) {
          toast.error(result.message || "Organisation verification failed", {
            id: tId,
          });
          return;
        }

        setOrg(result.organisation);
        form.setValue("orgId", String(result.organisation.orgId));
        setStep("login");

        toast.success("Organisation verified. Please login.", { id: tId });
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong",
          {
            id: tId,
          },
        );
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

      const tId = toast.loading("Logging in...");

      try {
        const res = await signIn("credentials", {
          username: data.username.trim(),
          password: data.password,
          orgId: data.orgId,
          orgCode: data.orgCode,
          orgName: org?.orgName,
          brandColor: org?.brandColor,
          redirect: false,
        });

        if (!res || res.error) {
          toast.error(prettyAuthError(res?.error) || "Login failed", {
            id: tId,
          });
          return;
        }

        toast.success("Login success. Redirecting...", { id: tId });
        router.push("/dashboard/");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Something went wrong",
          {
            id: tId,
          },
        );
      } finally {
        setLoading(false);
      }
    },
    [router, org?.orgName, resetMessages],
  );

  const goBackToOrg = React.useCallback(() => {
    resetMessages();
    setStep("org");
    setOrg(null);
    setLogoSrc(null);
    clearImageFromSession();

    form.setValue("orgId", "");
    form.setValue("username", "");
    form.setValue("password", "");
  }, [form, resetMessages]);

  React.useEffect(() => {
    const orgCode = org?.orgCode?.trim().toUpperCase();
    if (!orgCode) {
      setLogoSrc(null);
      return;
    }

    // 1) Try session cache first
    const { logoSrc } = getImagesFromSession(orgCode);

    if (logoSrc) {
      setLogoSrc(logoSrc);
      return;
    }

    // 2) Build from API fields
    const logo = toImageSrc(org?.logo);
    const fullLogo = toImageSrc(org?.fullLogo);

    setLogoSrc(logo);

    // 3) Save both in session
    setImagesToSession({
      orgCode,
      logoSrc: logo,
      fullLogoSrc: fullLogo,
    });
  }, [org?.orgCode, org?.logo, org?.fullLogo]);

  const website = org?.website?.trim() || "";
  const email = org?.email?.trim() || "";
  const phone = org?.phone?.trim() || "";

  return (
    <main className="relative min-h-screen overflow-hidden bg-white dark:bg-slate-950">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20 opacity-70 dark:opacity-60"
        fill={brandColor}
      />

      <section
        className={`mx-auto min-h-screen max-w-8xl flex flex-col ${step === "org" ? "justify-center" : "justify-between"} items-center px-4 py-10`}
      >
        <section className="relative mx-auto w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white/70 p-6 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55">
          <BorderBeam size={260} duration={12} delay={4} />

          {/* centered header */}
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            {logoSrc && (
              <div className="relative aspect-square w-16 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 dark:border-white/10 sm:w-20 md:w-24">
                <Image
                  src={logoSrc}
                  alt={org?.orgName ?? "Organisation Logo"}
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                  priority
                  unoptimized={logoSrc.startsWith("data:image/")}
                  className="object-contain"
                />
              </div>
            )}

            <h2 className="w-full text-center text-xl font-semibold text-slate-900 dark:text-slate-100">
              {step === "org" ? (
                "Verify Organisation"
              ) : (
                <span className="flex flex-col items-center justify-center">
                  <span>Login to</span>
                  <span
                    className="text-3xl font-bold uppercase"
                    style={{ color: brandColor }}
                  >
                    {brandName}
                  </span>
                </span>
              )}
            </h2>
          </div>

          {/* ✅ form area centered */}
          <div className="mt-6">
            <div className="mx-auto w-full max-w-md">
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
        </section>

        {org && (
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {/* Visit Site */}
            {website ? (
              <a
                href={website}
                target="_blank"
                rel="noreferrer"
                className="group flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
              >
                <span className="flex items-center gap-2 truncate">
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="truncate">{website}</span>
                </span>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-70 transition group-hover:translate-x-0.5" />
              </a>
            ) : (
              <div className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
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
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
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
              <div className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
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
                className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
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
              <div className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone No.
                </span>
                <span>Not available</span>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  );
}

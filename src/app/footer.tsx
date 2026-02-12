import { Container } from "@/components/shared-ui/container";
import { ExternalLink, Globe, Mail, Phone } from "lucide-react";

export default function Footer({
  website,
  email,
  phone,
}: {
  website: string | null;
  email: string | null;
  phone: string | null;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-slate-300 dark:bg-slate-900/90 dark:border-slate-800/90">
      <Container className="mt-6 grid grid-cols-1 gap-3 justify-items-center md:grid-cols-3">
        {/* Visit Site */}
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noreferrer"
            className="group flex w-full items-center gap-4 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
          >
            <span className="flex items-center gap-2 truncate">
              <Globe className="h-4 w-4 shrink-0" />
              <span className="truncate">{website}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 opacity-70 transition group-hover:translate-x-0.5" />
          </a>
        ) : (
          <div className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
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
            className="flex w-full items-center gap-4 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
          >
            <span className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
            </span>
            <span className="truncate pl-1 text-slate-700 dark:text-slate-300">
              {email}
            </span>
          </a>
        ) : (
          <div className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
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
            className="flex w-full items-center gap-4 px-4 py-3 text-sm transition hover:bg-slate-50 dark:border-white/10 dark:hover:bg-slate-900/60"
          >
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
            </span>
            <span className="pl-1 text-slate-700 dark:text-slate-300">
              {phone}
            </span>
          </a>
        ) : (
          <div className="flex w-full items-center gap-4 rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-500 dark:border-white/20 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone No.
            </span>
            <span>Not available</span>
          </div>
        )}
      </Container>
    </div>
  );
}

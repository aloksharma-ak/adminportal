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
  const hasAny = website || email || phone;

  if (!hasAny) return null;

  return (
    <footer className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white/95 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95">
      <Container>
        <div className="flex items-center justify-center gap-x-6 gap-y-1 py-2">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <Globe className="h-3 w-3 shrink-0" />
              <span className="truncate max-w-44 hidden sm:block">{website}</span>
              <ExternalLink className="h-3 w-3 shrink-0 opacity-0 transition group-hover:opacity-70 hidden sm:block" />
            </a>
          )}

          {email && (
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <Mail className="h-3 w-3 shrink-0" />
              <span className="hidden sm:block">{email}</span>
            </a>
          )}

          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1.5 text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <Phone className="h-3 w-3 shrink-0" />
              <span className="hidden sm:block">{phone}</span>
            </a>
          )}
        </div>
      </Container>
    </footer>
  );
}

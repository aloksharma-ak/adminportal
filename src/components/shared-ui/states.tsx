import { AlertCircle, Inbox } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ErrorCard({ message }: { message: string }) {
  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
      <CardContent className="flex items-center gap-3 py-6 px-5">
        <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
        <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
      </CardContent>
    </Card>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
}: {
  icon?: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center py-16 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Icon className="h-7 w-7 text-slate-400 dark:text-slate-500" />
        </div>
        <p className="text-base font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </p>
        {description && (
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

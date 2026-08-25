import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { InfoHint } from "@/components/ui/info-hint";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function MetricCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  footer,
  accent = false,
  loading = false,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon?: LucideIcon;
  footer?: ReactNode;
  accent?: boolean;
  loading?: boolean;
}) {
  return (
    <div
      className={cn(
        "panel relative overflow-hidden p-4 sm:p-5",
        accent && "ring-1 ring-primary/30",
      )}
    >
      {accent ? (
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        />
      ) : null}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <p className="truncate text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </p>
          {hint ? <InfoHint text={hint} /> : null}
        </div>
        {Icon ? <Icon className={cn("size-4 shrink-0", accent ? "text-primary" : "text-muted-foreground")} /> : null}
      </div>

      {loading ? (
        <Skeleton className="mt-3 h-9 w-28" />
      ) : (
        <p className="metric-number mt-2 flex items-baseline gap-1 text-2xl font-semibold text-foreground sm:text-3xl">
          <span className={cn("truncate", accent && "text-gradient-brand")}>{value}</span>
          {unit ? <span className="text-sm font-medium text-muted-foreground">{unit}</span> : null}
        </p>
      )}

      {footer ? <div className="mt-2 text-xs text-muted-foreground">{footer}</div> : null}
    </div>
  );
}

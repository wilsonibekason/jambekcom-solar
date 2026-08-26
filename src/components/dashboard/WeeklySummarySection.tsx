import { CalendarRange, CloudRain, Sun, Zap } from "lucide-react";

import { InfoHint } from "@/components/ui/info-hint";
import { Progress } from "@/components/ui/progress";
import type { WeeklySummary } from "@/types/solar";
import { formatEnergy, formatHours, formatNumber, formatSignedPercent } from "@/utils/formatting";

function ImpactBadge({ impact }: { impact: number }) {
  const tone =
    impact <= 0 ? "text-emerald-400" : impact < 0.3 ? "text-primary" : "text-destructive";
  return (
    <span className={`metric-number text-sm font-semibold ${tone}`}>
      {formatSignedPercent(-impact)}
    </span>
  );
}

export function WeeklySummarySection({ weeks }: { weeks: WeeklySummary[] }) {
  if (!weeks.length) return null;

  return (
    <section aria-labelledby="weekly-summary-heading" className="space-y-4">
      <div className="flex items-center gap-2">
        <CalendarRange className="size-4 text-primary" />
        <h2 id="weekly-summary-heading" className="text-sm font-semibold uppercase tracking-wider">
          Weekly forecast summary
        </h2>
        <InfoHint text="Weather impact compares average effective peak sun hours against the 5 PSH baseline used in the original spreadsheet." />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {weeks.map((week) => (
          <article key={week.label} className="panel space-y-4 p-4 sm:p-5">
            <header className="flex items-baseline justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">{week.label}</h3>
                <p className="text-xs text-muted-foreground">{week.rangeLabel}</p>
              </div>
              <ImpactBadge impact={week.weatherImpact} />
            </header>

            <p className="metric-number text-2xl font-semibold text-gradient-brand">
              {formatEnergy(week.totalUsableEnergyKwh)}
            </p>

            <dl className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Sun className="size-3.5" /> Avg effective PSH
                </dt>
                <dd className="metric-number mt-0.5 text-sm text-foreground">
                  {formatNumber(week.avgEffectivePsh, 2)} h
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <CloudRain className="size-3.5" /> Avg rain chance
                </dt>
                <dd className="metric-number mt-0.5 text-sm text-foreground">
                  {formatNumber(week.avgRainProbability, 0)}%
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Sun className="size-3.5" /> Avg sunshine
                </dt>
                <dd className="metric-number mt-0.5 text-sm text-foreground">
                  {formatHours(week.avgSunshineHours)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1 text-muted-foreground">
                  <Zap className="size-3.5" /> Days
                </dt>
                <dd className="metric-number mt-0.5 text-sm text-foreground">{week.days}</dd>
              </div>
            </dl>

            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                Production vs baseline
              </p>
              <Progress value={Math.max(0, Math.min(100, (week.avgEffectivePsh / 5) * 100))} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

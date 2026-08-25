import { CloudRain, Sun } from "lucide-react";

import { WeatherIcon } from "@/components/weather/WeatherIcon";
import type { WeatherForecastDay } from "@/types/weather";
import { formatDayLabel, formatHours, formatNumber } from "@/utils/formatting";

export function ForecastCards({ days }: { days: WeatherForecastDay[] }) {
  return (
    <ul className="space-y-2">
      {days.map((day) => (
        <li
          key={day.date}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-background/40 p-3"
        >
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <WeatherIcon category={day.condition.category} label={day.condition.label} />
              <p className="truncate text-sm font-semibold">{formatDayLabel(day.date)}</p>
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">{day.condition.label}</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sun className="size-3.5 text-primary-glow" />
                {formatHours(day.sunshineDurationHours)}
              </span>
              <span className="flex items-center gap-1">
                <CloudRain className="size-3.5 text-chart-4" />
                {Math.round(day.precipitationProbability)}%
              </span>
            </div>
          </div>
          <div className="shrink-0 text-right">
            <p className="metric-number text-lg font-semibold text-primary">
              {formatNumber(day.usableEnergyKwh, 2)}
            </p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">kWh</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

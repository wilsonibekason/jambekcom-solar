import { ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import { WeatherIcon } from "@/components/weather/WeatherIcon";
import type { WeatherForecastDay } from "@/types/weather";
import { formatDayLabel, formatNumber } from "@/utils/formatting";

type SortKey = "date" | "usableEnergyKwh" | "sunshineDurationHours" | "precipitationProbability";

export function ForecastTable({ days }: { days: WeatherForecastDay[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [asc, setAsc] = useState(true);

  const sorted = useMemo(() => {
    const copy = [...days];
    copy.sort((a, b) => {
      const av = sortKey === "date" ? a.date : a[sortKey];
      const bv = sortKey === "date" ? b.date : b[sortKey];
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * (asc ? 1 : -1);
    });
    return copy;
  }, [days, sortKey, asc]);

  const toggle = (key: SortKey) => {
    if (key === sortKey) setAsc((v) => !v);
    else {
      setSortKey(key);
      setAsc(key === "date");
    }
  };

  const SortButton = ({ label, sortBy }: { label: string; sortBy: SortKey }) => (
    <button
      type="button"
      onClick={() => toggle(sortBy)}
      aria-label={`Sort by ${label}`}
      className="inline-flex items-center gap-1 whitespace-nowrap transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {label}
      <ArrowUpDown className="size-3" />
    </button>
  );

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">Daily solar production forecast</caption>
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
            <th scope="col" className="py-2 pr-3 font-medium">
              <SortButton label="Date" sortBy="date" />
            </th>
            <th scope="col" className="py-2 pr-3 font-medium">Weather</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">
              <SortButton label="Rain" sortBy="precipitationProbability" />
            </th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">
              <SortButton label="Sunshine" sortBy="sunshineDurationHours" />
            </th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">PSH</th>
            <th scope="col" className="py-2 pr-3 text-right font-medium">Radiation</th>
            <th scope="col" className="py-2 text-right font-medium">
              <SortButton label="Expected energy" sortBy="usableEnergyKwh" />
            </th>
          </tr>
        </thead>
        <tbody className="tabular">
          {sorted.map((day) => (
            <tr key={day.date} className="border-b border-border/60 transition-colors hover:bg-accent/40">
              <th scope="row" className="whitespace-nowrap py-2.5 pr-3 text-left font-medium">
                {formatDayLabel(day.date)}
              </th>
              <td className="py-2.5 pr-3">
                <span className="flex items-center gap-2 whitespace-nowrap text-muted-foreground">
                  <WeatherIcon category={day.condition.category} className="size-4" />
                  {day.condition.label}
                </span>
              </td>
              <td className="py-2.5 pr-3 text-right text-muted-foreground">
                {Math.round(day.precipitationProbability)}%
              </td>
              <td className="py-2.5 pr-3 text-right text-muted-foreground">
                {formatNumber(day.sunshineDurationHours, 1)} h
              </td>
              <td className="py-2.5 pr-3 text-right text-muted-foreground">
                {formatNumber(day.effectivePsh, 2)}
              </td>
              <td className="py-2.5 pr-3 text-right text-muted-foreground">
                {formatNumber(day.shortwaveRadiationMjM2, 1)} MJ/m²
              </td>
              <td className="py-2.5 text-right font-semibold text-primary">
                {formatNumber(day.usableEnergyKwh, 2)} kWh
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

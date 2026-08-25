import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { WeatherIcon } from "@/components/weather/WeatherIcon";
import type { WeatherForecastDay } from "@/types/weather";
import { formatEnergy, formatDayLabel, formatHours, formatShortDay } from "@/utils/formatting";

interface ChartPoint {
  date: string;
  label: string;
  energy: number;
  day: WeatherForecastDay;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: Array<{ payload: ChartPoint }> }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  const { day } = point;

  return (
    <div className="panel min-w-48 p-3 text-xs">
      <p className="text-sm font-semibold">{formatDayLabel(day.date)}</p>
      <p className="metric-number mt-1 text-lg font-semibold text-primary">
        {formatEnergy(day.usableEnergyKwh)}
      </p>
      <div className="mt-2 space-y-1 text-muted-foreground">
        <p className="flex items-center gap-1.5">
          <WeatherIcon category={day.condition.category} className="size-3.5" />
          {day.condition.label}
        </p>
        <p>Sunshine: {formatHours(day.sunshineDurationHours)}</p>
        <p>Rain probability: {Math.round(day.precipitationProbability)}%</p>
        <p>Radiation: {day.shortwaveRadiationMjM2.toFixed(1)} MJ/m²</p>
      </div>
    </div>
  );
}

export function ProductionChart({
  days,
  baselineDailyEnergyKwh,
}: {
  days: WeatherForecastDay[];
  baselineDailyEnergyKwh: number;
}) {
  const data: ChartPoint[] = days.map((day) => ({
    date: day.date,
    label: formatShortDay(day.date),
    energy: Number(day.usableEnergyKwh.toFixed(3)),
    day,
  }));

  const summaryText = days.length
    ? `Expected daily production over ${days.length} days, ranging from ${formatEnergy(
        Math.min(...days.map((d) => d.usableEnergyKwh)),
      )} to ${formatEnergy(Math.max(...days.map((d) => d.usableEnergyKwh)))}.`
    : "No forecast data available.";

  return (
    <figure className="m-0">
      <div className="h-64 w-full sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.55} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              minTickGap={16}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={44}
              unit=" kWh"
            />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.35 }} />
            {baselineDailyEnergyKwh > 0 ? (
              <ReferenceLine
                y={Number(baselineDailyEnergyKwh.toFixed(2))}
                stroke="var(--color-muted-foreground)"
                strokeDasharray="4 4"
                label={{
                  value: "Baseline 5 PSH",
                  position: "insideTopRight",
                  fill: "var(--color-muted-foreground)",
                  fontSize: 10,
                }}
              />
            ) : null}
            <Area
              type="monotone"
              dataKey="energy"
              name="Expected energy"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#energyFill)"
              activeDot={{ r: 4, fill: "var(--color-primary)" }}
              animationDuration={600}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <figcaption className="sr-only">{summaryText}</figcaption>
    </figure>
  );
}

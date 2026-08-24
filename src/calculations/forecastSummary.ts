import type { ForecastSummary, WeeklySummary } from "@/types/solar";
import type { RawForecastDay, WeatherForecastDay } from "@/types/weather";
import { getWeatherCondition } from "@/utils/weatherCodes";
import { calculateDailyEnergy, calculateWeatherImpact } from "./solarEstimator";

const avg = (values: number[]) =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

export function buildForecastDays(
  rawDays: RawForecastDay[],
  params: { arrayDcCapacityWatts: number; performanceFactor: number },
): WeatherForecastDay[] {
  return rawDays.map((day) => {
    const effectivePsh = day.sunshineDurationHours;
    return {
      ...day,
      condition: getWeatherCondition(day.weatherCode),
      effectivePsh,
      usableEnergyKwh: calculateDailyEnergy({
        arrayDcCapacityWatts: params.arrayDcCapacityWatts,
        sunshineDurationHours: effectivePsh,
        performanceFactor: params.performanceFactor,
      }),
    };
  });
}

function summarizePeriod(
  label: string,
  rangeLabel: string,
  days: WeatherForecastDay[],
): WeeklySummary {
  const avgEffectivePsh = avg(days.map((d) => d.effectivePsh));
  return {
    label,
    rangeLabel,
    days: days.length,
    avgRainProbability: avg(days.map((d) => d.precipitationProbability)),
    avgEffectivePsh,
    totalUsableEnergyKwh: days.reduce((sum, d) => sum + d.usableEnergyKwh, 0),
    avgSunshineHours: avg(days.map((d) => d.sunshineDurationHours)),
    weatherImpact: calculateWeatherImpact(avgEffectivePsh),
  };
}

export function calculateForecastSummary(days: WeatherForecastDay[]): ForecastSummary {
  const totalEnergyKwh = days.reduce((sum, d) => sum + d.usableEnergyKwh, 0);
  const avgEffectivePsh = avg(days.map((d) => d.effectivePsh));

  const sortedByEnergy = [...days].sort((a, b) => a.usableEnergyKwh - b.usableEnergyKwh);

  const periods: Array<[string, string, WeatherForecastDay[]]> = [
    ["Week 1", "Days 1–7", days.slice(0, 7)],
    ["Week 2", "Days 8–14", days.slice(7, 14)],
    ["Final period", `Days 15–${days.length}`, days.slice(14)],
  ];

  return {
    totalEnergyKwh,
    averageDailyEnergyKwh: avg(days.map((d) => d.usableEnergyKwh)),
    bestDay: sortedByEnergy[sortedByEnergy.length - 1] ?? null,
    worstDay: sortedByEnergy[0] ?? null,
    avgSunshineHours: avg(days.map((d) => d.sunshineDurationHours)),
    avgRainProbability: avg(days.map((d) => d.precipitationProbability)),
    avgEffectivePsh,
    weatherImpact: calculateWeatherImpact(avgEffectivePsh),
    weeks: periods
      .filter(([, , periodDays]) => periodDays.length > 0)
      .map(([label, range, periodDays]) => summarizePeriod(label, range, periodDays)),
  };
}

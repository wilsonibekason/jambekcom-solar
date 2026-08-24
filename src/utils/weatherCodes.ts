import type { WeatherCondition } from "@/types/weather";

/** WMO weather interpretation codes (Open-Meteo). */
export function getWeatherCondition(code: number): WeatherCondition {
  if (code === 0) return { label: "Clear sky", category: "clear", severity: 0 };
  if (code === 1) return { label: "Mainly clear", category: "clear", severity: 0 };
  if (code === 2) return { label: "Partly cloudy", category: "partly-cloudy", severity: 1 };
  if (code === 3) return { label: "Overcast", category: "cloudy", severity: 2 };
  if (code === 45 || code === 48) return { label: "Fog", category: "fog", severity: 2 };
  if (code >= 51 && code <= 57) return { label: "Drizzle", category: "drizzle", severity: 2 };
  if (code >= 61 && code <= 67) return { label: "Rain", category: "rain", severity: 2 };
  if (code >= 71 && code <= 77) return { label: "Snow", category: "snow", severity: 3 };
  if (code >= 80 && code <= 82) return { label: "Showers", category: "showers", severity: 3 };
  if (code === 85 || code === 86) return { label: "Snow showers", category: "snow", severity: 3 };
  if (code >= 95 && code <= 99) return { label: "Thunderstorm", category: "thunderstorm", severity: 3 };
  return { label: "Unknown", category: "other", severity: 1 };
}

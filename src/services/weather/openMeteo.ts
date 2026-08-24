import type { RawForecastDay, WeatherForecast } from "@/types/weather";

export interface ForecastRequest {
  latitude: number;
  longitude: number;
  forecastDays: number;
  signal?: AbortSignal;
}

export class WeatherServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WeatherServiceError";
  }
}

const DAILY_VARIABLES = [
  "weather_code",
  "precipitation_probability_max",
  "precipitation_sum",
  "sunshine_duration",
  "shortwave_radiation_sum",
  "temperature_2m_min",
  "temperature_2m_max",
  "wind_speed_10m_max",
  "daylight_duration",
  "precipitation_hours",
  "sunrise",
  "sunset",
].join(",");

const num = (value: unknown): number => (typeof value === "number" && isFinite(value) ? value : 0);

async function fetchWithTimeout(url: string, signal?: AbortSignal, timeoutMs = 12_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const onAbort = () => controller.abort();
  signal?.addEventListener("abort", onAbort);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", onAbort);
  }
}

/** Fetches the Open-Meteo daily forecast and normalizes it to application types. */
export async function fetchSolarForecast({
  latitude,
  longitude,
  forecastDays,
  signal,
}: ForecastRequest): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    daily: DAILY_VARIABLES,
    timezone: "auto",
    forecast_days: String(Math.min(Math.max(Math.round(forecastDays), 1), 16)),
  });
  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  let response: Response;
  try {
    response = await fetchWithTimeout(url, signal);
  } catch {
    throw new WeatherServiceError("Unable to reach the weather service.");
  }

  if (!response.ok) {
    throw new WeatherServiceError(
      response.status === 429
        ? "Weather service rate limit reached. Please try again shortly."
        : "Unable to refresh weather data.",
    );
  }

  const json = (await response.json()) as {
    timezone?: string;
    daily?: Record<string, unknown[]>;
  };
  const daily = json.daily;
  const dates = (daily?.["time"] as string[] | undefined) ?? [];
  if (!dates.length) throw new WeatherServiceError("No forecast data available for this location.");

  const col = (key: string) => (daily?.[key] as unknown[] | undefined) ?? [];

  const days: RawForecastDay[] = dates.map((date, i) => ({
    date,
    weatherCode: num(col("weather_code")[i]),
    precipitationProbability: num(col("precipitation_probability_max")[i]),
    precipitationMm: num(col("precipitation_sum")[i]),
    // Open-Meteo returns sunshine duration in seconds
    sunshineDurationHours: num(col("sunshine_duration")[i]) / 3600,
    shortwaveRadiationMjM2: num(col("shortwave_radiation_sum")[i]),
    temperatureMinC: num(col("temperature_2m_min")[i]),
    temperatureMaxC: num(col("temperature_2m_max")[i]),
    windSpeedMaxKmh: num(col("wind_speed_10m_max")[i]),
    daylightDurationHours: num(col("daylight_duration")[i]) / 3600,
    sunrise: col("sunrise")[i] as string | undefined,
    sunset: col("sunset")[i] as string | undefined,
  }));

  return {
    latitude,
    longitude,
    timezone: json.timezone ?? "auto",
    fetchedAt: new Date().toISOString(),
    days,
  };
}

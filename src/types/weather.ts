export type WeatherCategory =
  | "clear"
  | "partly-cloudy"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "showers"
  | "snow"
  | "thunderstorm"
  | "other";

export interface WeatherCondition {
  label: string;
  category: WeatherCategory;
  /** 0 (best for production) - 3 (worst) */
  severity: 0 | 1 | 2 | 3;
}

export interface WeatherForecastDay {
  date: string;
  weatherCode: number;
  condition: WeatherCondition;
  precipitationProbability: number;
  precipitationMm: number;
  sunshineDurationHours: number;
  /** Spreadsheet methodology: effective PSH = sunshine duration in hours */
  effectivePsh: number;
  shortwaveRadiationMjM2: number;
  usableEnergyKwh: number;
  temperatureMinC?: number | undefined;
  temperatureMaxC?: number | undefined;
  windSpeedMaxKmh?: number | undefined;
  daylightDurationHours?: number | undefined;
  sunrise?: string | undefined;
  sunset?: string | undefined;
}

/** Weather data normalized out of the Open-Meteo response, before solar maths. */
export interface RawForecastDay {
  date: string;
  weatherCode: number;
  precipitationProbability: number;
  precipitationMm: number;
  sunshineDurationHours: number;
  shortwaveRadiationMjM2: number;
  temperatureMinC?: number | undefined;
  temperatureMaxC?: number | undefined;
  windSpeedMaxKmh?: number | undefined;
  daylightDurationHours?: number | undefined;
  sunrise?: string | undefined;
  sunset?: string | undefined;
}

export interface WeatherForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  fetchedAt: string;
  days: RawForecastDay[];
}

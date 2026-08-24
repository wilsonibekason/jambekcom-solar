import type { AppLocation, SolarSystem } from "@/types/solar";
import type { WeatherForecast } from "@/types/weather";

const KEYS = {
  system: "jambekcom.solar.system",
  location: "jambekcom.solar.location",
  forecast: "jambekcom.solar.forecast",
  preferences: "jambekcom.solar.preferences",
} as const;

export interface AppPreferences {
  forecastDays: number;
}

export const DEFAULT_SYSTEM: SolarSystem = {
  panelRatedPowerW: 650,
  panelsInSeries: 4,
  parallelStrings: 2,
  performanceFactor: 0.8,
};

export const DEFAULT_LOCATION: AppLocation = {
  name: "Abuja",
  country: "Nigeria",
  latitude: 9.0765,
  longitude: 7.3986,
  timezone: "Africa/Lagos",
};

export const DEFAULT_PREFERENCES: AppPreferences = { forecastDays: 16 };

function read<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable — non fatal */
  }
}

export const storage = {
  loadSystem: () => read<SolarSystem>(KEYS.system),
  saveSystem: (system: SolarSystem) => write(KEYS.system, system),
  loadLocation: () => read<AppLocation>(KEYS.location),
  saveLocation: (location: AppLocation) => write(KEYS.location, location),
  loadForecast: () => read<WeatherForecast>(KEYS.forecast),
  saveForecast: (forecast: WeatherForecast) => write(KEYS.forecast, forecast),
  loadPreferences: () => read<AppPreferences>(KEYS.preferences),
  savePreferences: (prefs: AppPreferences) => write(KEYS.preferences, prefs),
  clearAll: () => {
    if (typeof window === "undefined") return;
    Object.values(KEYS).forEach((key) => window.localStorage.removeItem(key));
  },
};

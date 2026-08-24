import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toast } from "sonner";

import { buildForecastDays, calculateForecastSummary } from "@/calculations/forecastSummary";
import { calculateSystemConfiguration, validateSolarSystem } from "@/calculations/solarEstimator";
import { fetchSolarForecast, WeatherServiceError } from "@/services/weather/openMeteo";
import type { AppLocation, ForecastSummary, SolarSystem, SystemConfigurationResult } from "@/types/solar";
import type { WeatherForecast, WeatherForecastDay } from "@/types/weather";
import {
  DEFAULT_LOCATION,
  DEFAULT_PREFERENCES,
  DEFAULT_SYSTEM,
  storage,
  type AppPreferences,
} from "@/utils/storage";

const AUTO_REFRESH_MS = 30 * 60 * 1000;
const STALE_AFTER_MS = 60 * 60 * 1000;

interface SolarAppValue {
  system: SolarSystem;
  setSystem: (patch: Partial<SolarSystem>) => void;
  resetSystem: () => void;
  systemIssues: ReturnType<typeof validateSolarSystem>;
  configuration: SystemConfigurationResult;
  location: AppLocation;
  setLocation: (location: AppLocation) => void;
  preferences: AppPreferences;
  setPreferences: (patch: Partial<AppPreferences>) => void;
  forecast: WeatherForecast | null;
  days: WeatherForecastDay[];
  summary: ForecastSummary;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  isOffline: boolean;
  isStale: boolean;
  refresh: () => void;
  clearCache: () => void;
}

const SolarAppContext = createContext<SolarAppValue | null>(null);

export function SolarAppProvider({ children }: { children: ReactNode }) {
  const [system, setSystemState] = useState<SolarSystem>(DEFAULT_SYSTEM);
  const [location, setLocationState] = useState<AppLocation>(DEFAULT_LOCATION);
  const [preferences, setPreferencesState] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const inFlight = useRef(false);

  // Hydrate persisted state on the client only (SSR safe).
  useEffect(() => {
    const storedSystem = storage.loadSystem();
    const storedLocation = storage.loadLocation();
    const storedPrefs = storage.loadPreferences();
    const storedForecast = storage.loadForecast();
    if (storedSystem) setSystemState({ ...DEFAULT_SYSTEM, ...storedSystem });
    if (storedLocation) setLocationState(storedLocation);
    if (storedPrefs) setPreferencesState({ ...DEFAULT_PREFERENCES, ...storedPrefs });
    if (storedForecast) setForecast(storedForecast);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setIsOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  const load = useCallback(
    async (target: AppLocation, days: number, mode: "initial" | "refresh") => {
      if (inFlight.current) return;
      inFlight.current = true;
      if (mode === "refresh") setIsRefreshing(true);
      else setIsLoading(true);

      try {
        const result = await fetchSolarForecast({
          latitude: target.latitude,
          longitude: target.longitude,
          forecastDays: days,
        });
        setForecast(result);
        storage.saveForecast(result);
        setError(null);
        if (mode === "refresh") toast.success("Forecast updated");
      } catch (err) {
        const message =
          typeof navigator !== "undefined" && !navigator.onLine
            ? "You are offline. Showing the last available forecast."
            : err instanceof WeatherServiceError
              ? err.message
              : "Unable to refresh weather data.";
        setError(message);
        toast.error(message);
      } finally {
        inFlight.current = false;
        setIsRefreshing(false);
        setIsLoading(false);
      }
    },
    [],
  );

  // Initial + location/horizon driven fetch.
  useEffect(() => {
    if (!hydrated) return;
    void load(location, preferences.forecastDays, forecast ? "refresh" : "initial");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, location.latitude, location.longitude, preferences.forecastDays]);

  // Periodic refresh while the tab is active.
  useEffect(() => {
    if (!hydrated) return;
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void load(location, preferences.forecastDays, "refresh");
      }
    }, AUTO_REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [hydrated, load, location, preferences.forecastDays]);

  const setSystem = useCallback((patch: Partial<SolarSystem>) => {
    setSystemState((prev) => {
      const next = { ...prev, ...patch };
      storage.saveSystem(next);
      return next;
    });
  }, []);

  const resetSystem = useCallback(() => {
    setSystemState(DEFAULT_SYSTEM);
    storage.saveSystem(DEFAULT_SYSTEM);
  }, []);

  const setLocation = useCallback((next: AppLocation) => {
    setLocationState(next);
    storage.saveLocation(next);
  }, []);

  const setPreferences = useCallback((patch: Partial<AppPreferences>) => {
    setPreferencesState((prev) => {
      const next = { ...prev, ...patch };
      storage.savePreferences(next);
      return next;
    });
  }, []);

  const systemIssues = useMemo(() => validateSolarSystem(system), [system]);

  const configuration = useMemo(() => {
    const safe: SolarSystem = {
      panelRatedPowerW: system.panelRatedPowerW > 0 ? system.panelRatedPowerW : 0,
      panelsInSeries: system.panelsInSeries > 0 ? system.panelsInSeries : 0,
      parallelStrings: system.parallelStrings > 0 ? system.parallelStrings : 0,
      performanceFactor:
        system.performanceFactor > 0 && system.performanceFactor <= 1 ? system.performanceFactor : 0,
    };
    return calculateSystemConfiguration(safe);
  }, [system]);

  const days = useMemo(
    () =>
      forecast
        ? buildForecastDays(forecast.days, {
            arrayDcCapacityWatts: configuration.arrayDcCapacityWatts,
            performanceFactor: system.performanceFactor,
          })
        : [],
    [forecast, configuration.arrayDcCapacityWatts, system.performanceFactor],
  );

  const summary = useMemo(() => calculateForecastSummary(days), [days]);

  const refresh = useCallback(() => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      toast.error("You are offline. Showing the last available forecast.");
      return;
    }
    void load(location, preferences.forecastDays, "refresh");
  }, [load, location, preferences.forecastDays]);

  const clearCache = useCallback(() => {
    storage.clearAll();
    setSystemState(DEFAULT_SYSTEM);
    setLocationState(DEFAULT_LOCATION);
    setPreferencesState(DEFAULT_PREFERENCES);
    setForecast(null);
    toast.success("Cached data cleared");
  }, []);

  const isStale = forecast ? Date.now() - new Date(forecast.fetchedAt).getTime() > STALE_AFTER_MS : false;

  const value: SolarAppValue = {
    system,
    setSystem,
    resetSystem,
    systemIssues,
    configuration,
    location,
    setLocation,
    preferences,
    setPreferences,
    forecast,
    days,
    summary,
    isLoading: isLoading && !forecast,
    isRefreshing,
    error,
    isOffline,
    isStale,
    refresh,
    clearCache,
  };

  return <SolarAppContext.Provider value={value}>{children}</SolarAppContext.Provider>;
}

export function useSolarApp() {
  const ctx = useContext(SolarAppContext);
  if (!ctx) throw new Error("useSolarApp must be used within SolarAppProvider");
  return ctx;
}

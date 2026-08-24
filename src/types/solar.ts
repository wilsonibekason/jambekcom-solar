export interface SolarSystem {
  panelRatedPowerW: number;
  panelsInSeries: number;
  parallelStrings: number;
  /** 0 - 1 performance / derating factor (0.8 = 80% usable performance) */
  performanceFactor: number;
}

export interface SystemConfigurationResult {
  totalPanels: number;
  arrayDcCapacityWatts: number;
  arrayDcCapacityKw: number;
  baselineDailyEnergyKwh: number;
}

export interface AppLocation {
  name: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface WeeklySummary {
  label: string;
  rangeLabel: string;
  days: number;
  avgRainProbability: number;
  avgEffectivePsh: number;
  totalUsableEnergyKwh: number;
  avgSunshineHours: number;
  /** Spreadsheet formula: 1 - (avg effective PSH / 5) */
  weatherImpact: number;
}

export interface ForecastSummary {
  totalEnergyKwh: number;
  averageDailyEnergyKwh: number;
  bestDay: import("./weather").WeatherForecastDay | null;
  worstDay: import("./weather").WeatherForecastDay | null;
  avgSunshineHours: number;
  avgRainProbability: number;
  avgEffectivePsh: number;
  weatherImpact: number;
  weeks: WeeklySummary[];
}

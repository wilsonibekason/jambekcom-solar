import type { SolarSystem, SystemConfigurationResult } from "@/types/solar";

export const BASELINE_PSH = 5;

export interface ValidationIssue {
  field: string;
  message: string;
}

export function validateSolarSystem(system: SolarSystem): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const isPositiveInt = (n: number) => Number.isFinite(n) && Number.isInteger(n) && n > 0;

  if (!Number.isFinite(system.panelRatedPowerW) || system.panelRatedPowerW <= 0) {
    issues.push({ field: "panelRatedPowerW", message: "Panel rated power must be greater than 0 W." });
  }
  if (!isPositiveInt(system.panelsInSeries)) {
    issues.push({ field: "panelsInSeries", message: "Panels in series must be a positive whole number." });
  }
  if (!isPositiveInt(system.parallelStrings)) {
    issues.push({ field: "parallelStrings", message: "Parallel strings must be a positive whole number." });
  }
  if (
    !Number.isFinite(system.performanceFactor) ||
    system.performanceFactor <= 0 ||
    system.performanceFactor > 1
  ) {
    issues.push({
      field: "performanceFactor",
      message: "Performance factor must be between 0% and 100%.",
    });
  }
  return issues;
}

export function validateCoordinates(latitude: number, longitude: number): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    issues.push({ field: "latitude", message: "Latitude must be between -90 and 90." });
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    issues.push({ field: "longitude", message: "Longitude must be between -180 and 180." });
  }
  return issues;
}

/**
 * Spreadsheet parity:
 *   total panels        = series x parallel
 *   array DC capacity W = panel rated power x total panels
 *   array DC capacity kW= capacity / 1000
 *   baseline energy     = capacity x 5 PSH x performance / 1000
 */
export function calculateSystemConfiguration(system: SolarSystem): SystemConfigurationResult {
  const totalPanels = system.panelsInSeries * system.parallelStrings;
  const arrayDcCapacityWatts = system.panelRatedPowerW * totalPanels;
  const arrayDcCapacityKw = arrayDcCapacityWatts / 1000;
  const baselineDailyEnergyKwh =
    (arrayDcCapacityWatts * BASELINE_PSH * system.performanceFactor) / 1000;

  return { totalPanels, arrayDcCapacityWatts, arrayDcCapacityKw, baselineDailyEnergyKwh };
}

/** Usable energy (kWh) = array DC capacity (W) x effective PSH x performance factor / 1000 */
export function calculateDailyEnergy(params: {
  arrayDcCapacityWatts: number;
  sunshineDurationHours: number;
  performanceFactor: number;
}): number {
  return (
    (params.arrayDcCapacityWatts * params.sunshineDurationHours * params.performanceFactor) / 1000
  );
}

/** Spreadsheet formula: weather impact = 1 - (average effective PSH / 5) */
export function calculateWeatherImpact(averageEffectivePsh: number): number {
  return 1 - averageEffectivePsh / BASELINE_PSH;
}

export type ProductionOutlook = "good" | "moderate" | "low";

export function getProductionOutlook(averageEffectivePsh: number): ProductionOutlook {
  if (averageEffectivePsh >= 5) return "good";
  if (averageEffectivePsh >= 3.5) return "moderate";
  return "low";
}

export const formatEnergy = (kwh: number, decimals = 2) =>
  `${kwh.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} kWh`;

export const formatNumber = (value: number, decimals = 1) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

export const formatHours = (hours: number) => `${formatNumber(hours, 1)} h`;

export const formatPercent = (fraction: number, decimals = 0) =>
  `${formatNumber(fraction * 100, decimals)}%`;

export const formatSignedPercent = (fraction: number, decimals = 1) =>
  `${fraction >= 0 ? "+" : ""}${formatNumber(fraction * 100, decimals)}%`;

export function formatDayLabel(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

export function formatShortDay(isoDate: string) {
  const date = new Date(`${isoDate}T12:00:00`);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(iso: string, now = Date.now()) {
  const diffMs = now - new Date(iso).getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

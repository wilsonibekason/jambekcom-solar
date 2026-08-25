import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  CloudSunRain,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { WeatherCategory } from "@/types/weather";

const ICONS: Record<WeatherCategory, typeof Sun> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  showers: CloudSunRain,
  snow: Snowflake,
  thunderstorm: CloudLightning,
  other: Cloud,
};

const TONE: Record<WeatherCategory, string> = {
  clear: "text-primary",
  "partly-cloudy": "text-primary-glow",
  cloudy: "text-muted-foreground",
  fog: "text-muted-foreground",
  drizzle: "text-chart-4",
  rain: "text-chart-4",
  showers: "text-chart-4",
  snow: "text-chart-4",
  thunderstorm: "text-destructive",
  other: "text-muted-foreground",
};

export function WeatherIcon({
  category,
  className,
  label,
}: {
  category: WeatherCategory;
  className?: string;
  label?: string;
}) {
  const Icon = ICONS[category];
  return (
    <Icon
      aria-hidden={label ? undefined : true}
      aria-label={label}
      role={label ? "img" : undefined}
      className={cn("size-5 shrink-0", TONE[category], className)}
    />
  );
}

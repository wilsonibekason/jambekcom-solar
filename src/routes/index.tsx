import { createFileRoute } from "@tanstack/react-router";
import {
  BatteryCharging,
  CloudOff,
  CloudRain,
  Gauge,
  RefreshCw,
  Sun,
  Trash2,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

import { Logo } from "@/components/brand/Logo";
import { ProductionChart } from "@/components/charts/ProductionChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { WeeklySummarySection } from "@/components/dashboard/WeeklySummarySection";
import { ForecastCards } from "@/components/forecast/ForecastCards";
import { ForecastTable } from "@/components/forecast/ForecastTable";
import { SystemConfigCard } from "@/components/system/SystemConfigCard";
import { LocationCard } from "@/components/weather/LocationCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SolarAppProvider, useSolarApp } from "@/hooks/useSolarApp";
import { getProductionOutlook } from "@/calculations/solarEstimator";
import {
  formatDayLabel,
  formatEnergy,
  formatNumber,
  formatRelativeTime,
  formatSignedPercent,
} from "@/utils/formatting";

const title = "Solar Energy Estimator — Jambekcom Solutions";
const description =
  "Live 16-day solar generation forecast for your PV array. Configure panels, strings and derating, then see usable energy, effective peak sun hours and weather impact.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#0b0b0f" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Jambekcom Solar" },
    ],
    links: [
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.png" },
    ],
  }),
  component: SolarEstimatorPage,
});

function SolarEstimatorPage() {
  return (
    <SolarAppProvider>
      <Dashboard />
      <Toaster position="top-center" richColors />
    </SolarAppProvider>
  );
}

function Dashboard() {
  const {
    configuration,
    days,
    summary,
    forecast,
    isLoading,
    isRefreshing,
    isOffline,
    isStale,
    error,
    refresh,
    clearCache,
    preferences,
    setPreferences,
  } = useSolarApp();

  const outlook = getProductionOutlook(summary.avgEffectivePsh);
  const outlookLabel = { good: "Good", moderate: "Moderate", low: "Low" }[outlook];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold sm:text-base">
              Solar Energy Generation Estimator
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {forecast
                ? `Updated ${formatRelativeTime(forecast.fetchedAt)}`
                : "Fetching live weather…"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isOffline ? (
              <Badge variant="outline" className="gap-1 text-xs">
                <CloudOff className="size-3" /> Offline
              </Badge>
            ) : null}
            {isStale && !isOffline ? (
              <Badge variant="outline" className="text-xs">
                Stale data
              </Badge>
            ) : null}
            <Button
              size="sm"
              variant="secondary"
              onClick={refresh}
              disabled={isRefreshing}
              aria-label="Refresh forecast"
            >
              <RefreshCw className={isRefreshing ? "size-4 animate-spin" : "size-4"} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 sm:py-8">
        {error ? (
          <p role="status" className="panel border-destructive/40 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <section aria-labelledby="overview-heading" className="space-y-4">
          <h2 id="overview-heading" className="sr-only">
            Production overview
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              accent
              label="Array DC capacity"
              value={formatNumber(configuration.arrayDcCapacityKw, 2)}
              unit="kW"
              icon={Zap}
              hint="Panel rated power × total panels."
              footer={`${configuration.totalPanels} panels installed`}
            />
            <MetricCard
              label="Baseline daily energy"
              value={formatNumber(configuration.baselineDailyEnergyKwh, 2)}
              unit="kWh/day"
              icon={BatteryCharging}
              hint="Capacity × 5 peak sun hours × performance factor."
            />
            <MetricCard
              label="Avg daily production"
              value={formatNumber(summary.averageDailyEnergyKwh, 2)}
              unit="kWh/day"
              icon={Sun}
              loading={isLoading}
              hint="Average usable energy across the forecast window."
              footer={`${formatNumber(summary.avgEffectivePsh, 2)} h effective PSH · outlook ${outlookLabel}`}
            />
            <MetricCard
              label="Weather impact"
              value={formatSignedPercent(-summary.weatherImpact)}
              icon={Gauge}
              loading={isLoading}
              hint="1 − (average effective PSH ÷ 5 PSH baseline)."
              footer={`${formatNumber(summary.avgRainProbability, 0)}% average rain chance`}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              label={`Total over ${days.length || preferences.forecastDays} days`}
              value={formatNumber(summary.totalEnergyKwh, 1)}
              unit="kWh"
              icon={Zap}
              loading={isLoading}
            />
            <MetricCard
              label="Best day"
              value={summary.bestDay ? formatEnergy(summary.bestDay.usableEnergyKwh) : "—"}
              icon={TrendingUp}
              loading={isLoading}
              footer={summary.bestDay ? formatDayLabel(summary.bestDay.date) : undefined}
            />
            <MetricCard
              label="Lowest day"
              value={summary.worstDay ? formatEnergy(summary.worstDay.usableEnergyKwh) : "—"}
              icon={TrendingDown}
              loading={isLoading}
              footer={summary.worstDay ? formatDayLabel(summary.worstDay.date) : undefined}
            />
            <MetricCard
              label="Avg sunshine"
              value={formatNumber(summary.avgSunshineHours, 1)}
              unit="h/day"
              icon={CloudRain}
              loading={isLoading}
            />
          </div>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section aria-labelledby="chart-heading" className="panel order-2 p-4 sm:p-5 lg:order-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 id="chart-heading" className="text-sm font-semibold uppercase tracking-wider">
                Daily production forecast
              </h2>
              <div className="flex gap-1" role="group" aria-label="Forecast horizon">
                {[7, 14, 16].map((option) => (
                  <Button
                    key={option}
                    size="sm"
                    variant={preferences.forecastDays === option ? "default" : "ghost"}
                    onClick={() => setPreferences({ forecastDays: option })}
                  >
                    {option}d
                  </Button>
                ))}
              </div>
            </div>
            <ProductionChart
              days={days}
              baselineDailyEnergyKwh={configuration.baselineDailyEnergyKwh}
            />
          </section>

          <div className="order-1 space-y-6 lg:order-2">
            <SystemConfigCard />
            <LocationCard />
          </div>
        </div>

        <section aria-labelledby="forecast-heading" className="space-y-4">
          <h2 id="forecast-heading" className="text-sm font-semibold uppercase tracking-wider">
            Day-by-day forecast
          </h2>
          <Tabs defaultValue="cards">
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
            <TabsContent value="cards" className="mt-4">
              <ForecastCards days={days} />
            </TabsContent>
            <TabsContent value="table" className="mt-4">
              <ForecastTable days={days} />
            </TabsContent>
          </Tabs>
        </section>

        <WeeklySummarySection weeks={summary.weeks} />

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          <p>
            Weather data by Open-Meteo · Calculations mirror the Jambekcom Solutions solar
            estimator spreadsheet.
          </p>
          <Button size="sm" variant="ghost" onClick={clearCache}>
            <Trash2 className="size-4" /> Clear cached data
          </Button>
        </footer>
      </main>
    </div>
  );
}

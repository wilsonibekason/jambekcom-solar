import { Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSolarApp } from "@/hooks/useSolarApp";
import { validateCoordinates } from "@/calculations/solarEstimator";
import { openMeteoGeocoding } from "@/services/weather/geocoding";
import type { AppLocation } from "@/types/solar";
import { formatNumber } from "@/utils/formatting";

function LocationSearch({ onSelect }: { onSelect: (location: AppLocation) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<AppLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const found = await openMeteoGeocoding.search(query, controller.signal);
        setResults(found);
        setError(found.length ? null : "No matching location found.");
      } catch (err) {
        if ((err as Error).name !== "AbortError") setError("Location search is unavailable right now.");
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a city, e.g. Abuja, Lagos, Enugu"
          aria-label="Search for a location"
          className="h-11 pl-9"
        />
        {searching ? (
          <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        ) : null}
      </div>

      {error ? <p className="text-xs text-muted-foreground">{error}</p> : null}

      <ul className="max-h-64 space-y-1.5 overflow-y-auto">
        {results.map((result) => (
          <li key={`${result.latitude},${result.longitude}`}>
            <button
              type="button"
              onClick={() => onSelect(result)}
              className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5 text-left transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{result.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{result.country}</span>
              </span>
              <span className="metric-number shrink-0 text-[11px] text-muted-foreground">
                {formatNumber(result.latitude, 2)}, {formatNumber(result.longitude, 2)}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ManualCoordinates({ onSelect }: { onSelect: (location: AppLocation) => void }) {
  const { location } = useSolarApp();
  const [name, setName] = useState(location.name);
  const [lat, setLat] = useState(String(location.latitude));
  const [lon, setLon] = useState(String(location.longitude));

  const issues = validateCoordinates(Number(lat), Number(lon));

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        if (issues.length) return;
        onSelect({
          name: name.trim() || "Custom site",
          country: "Custom coordinates",
          latitude: Number(lat),
          longitude: Number(lon),
        });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="site-name">Site name</Label>
        <Input id="site-name" value={name} onChange={(e) => setName(e.target.value)} className="h-11" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="site-lat">Latitude</Label>
          <Input
            id="site-lat"
            inputMode="decimal"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            className="metric-number h-11"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="site-lon">Longitude</Label>
          <Input
            id="site-lon"
            inputMode="decimal"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            className="metric-number h-11"
          />
        </div>
      </div>
      {issues.length ? (
        <p className="text-xs text-destructive">{issues[0]?.message}</p>
      ) : null}
      <Button type="submit" className="w-full" disabled={issues.length > 0}>
        Use these coordinates
      </Button>
    </form>
  );
}

export function LocationDialog({ children }: { children: React.ReactNode }) {
  const { setLocation } = useSolarApp();
  const [open, setOpen] = useState(false);

  const handleSelect = (next: AppLocation) => {
    setLocation(next);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Installation location</DialogTitle>
          <DialogDescription>
            Search for a site or enter coordinates for installations outside major cities.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="search">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="manual">Coordinates</TabsTrigger>
          </TabsList>
          <TabsContent value="search" className="mt-4">
            <LocationSearch onSelect={handleSelect} />
          </TabsContent>
          <TabsContent value="manual" className="mt-4">
            <ManualCoordinates onSelect={handleSelect} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function LocationCard() {
  const { location, forecast } = useSolarApp();

  const rows = [
    { label: "Location", value: location.name },
    { label: "Country", value: location.country ?? "—" },
    { label: "Latitude", value: formatNumber(location.latitude, 4) },
    { label: "Longitude", value: formatNumber(location.longitude, 4) },
    { label: "Timezone", value: forecast?.timezone ?? location.timezone ?? "—" },
  ];

  return (
    <section aria-labelledby="location-heading" className="panel p-4 sm:p-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <MapPin className="size-4 shrink-0 text-primary" />
          <h2 id="location-heading" className="truncate text-sm font-semibold uppercase tracking-wide">
            Installation Location
          </h2>
        </div>
        <LocationDialog>
          <Button size="sm" variant="secondary" className="shrink-0">
            Change
          </Button>
        </LocationDialog>
      </header>

      <dl className="mt-4 divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 py-2.5">
            <dt className="truncate text-xs uppercase tracking-wide text-muted-foreground">{row.label}</dt>
            <dd className="metric-number truncate text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

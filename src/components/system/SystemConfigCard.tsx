import { Cpu, RotateCcw } from "lucide-react";

import { ArrayVisual } from "@/components/system/ArrayVisual";
import { Button } from "@/components/ui/button";
import { InfoHint } from "@/components/ui/info-hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSolarApp } from "@/hooks/useSolarApp";
import { formatNumber } from "@/utils/formatting";

function Field({
  id,
  label,
  hint,
  value,
  suffix,
  min,
  max,
  step,
  error,
  onChange,
}: {
  id: string;
  label: string;
  hint: string;
  value: number;
  suffix: string;
  min: number;
  max?: number;
  step?: number;
  error?: string | undefined;
  onChange: (value: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id} className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </Label>
        <InfoHint text={hint} />
      </div>
      <div className="relative">
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step ?? 1}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(event) => onChange(event.target.valueAsNumber)}
          className="metric-number h-11 pr-16 text-base"
        />
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
          {suffix}
        </span>
      </div>
      {error ? (
        <p id={`${id}-error`} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function SystemConfigCard() {
  const { system, setSystem, resetSystem, systemIssues, configuration } = useSolarApp();
  const errorFor = (field: string) => systemIssues.find((i) => i.field === field)?.message;

  return (
    <section aria-labelledby="system-config-heading" className="panel p-4 sm:p-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Cpu className="size-4 shrink-0 text-primary" />
          <h2 id="system-config-heading" className="truncate text-sm font-semibold uppercase tracking-wide">
            Solar System Configuration
          </h2>
        </div>
        <Button variant="ghost" size="sm" onClick={resetSystem} className="shrink-0 gap-1.5">
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </header>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field
          id="panel-power"
          label="Panel rated power"
          hint="Rated power of a single PV panel under standard test conditions."
          value={system.panelRatedPowerW}
          suffix="W"
          min={1}
          step={5}
          error={errorFor("panelRatedPowerW")}
          onChange={(v) => setSystem({ panelRatedPowerW: v })}
        />
        <Field
          id="panels-series"
          label="Panels in series"
          hint="Number of panels wired in series within one string."
          value={system.panelsInSeries}
          suffix="panels"
          min={1}
          error={errorFor("panelsInSeries")}
          onChange={(v) => setSystem({ panelsInSeries: v })}
        />
        <Field
          id="parallel-strings"
          label="Parallel strings"
          hint="Number of identical strings wired in parallel."
          value={system.parallelStrings}
          suffix="strings"
          min={1}
          error={errorFor("parallelStrings")}
          onChange={(v) => setSystem({ parallelStrings: v })}
        />
        <Field
          id="performance-factor"
          label="Performance factor"
          hint="Overall usable-performance factor after temperature, wiring, mismatch, inverter and dust losses. 80% means 80% of DC capacity is usable — not 80% loss."
          value={Math.round(system.performanceFactor * 1000) / 10}
          suffix="%"
          min={1}
          max={100}
          step={1}
          error={errorFor("performanceFactor")}
          onChange={(v) => setSystem({ performanceFactor: Number.isFinite(v) ? v / 100 : NaN })}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "Total panels", value: `${configuration.totalPanels}` },
          { label: "Array DC capacity", value: `${formatNumber(configuration.arrayDcCapacityWatts, 0)} W` },
          { label: "System capacity", value: `${formatNumber(configuration.arrayDcCapacityKw, 2)} kW` },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-border bg-background/40 p-3">
            <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</dt>
            <dd className="metric-number mt-1 text-base font-semibold">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <ArrayVisual
          panelsInSeries={system.panelsInSeries}
          parallelStrings={system.parallelStrings}
          totalPanels={configuration.totalPanels}
          capacityKw={configuration.arrayDcCapacityKw}
        />
      </div>
    </section>
  );
}

import { formatNumber } from "@/utils/formatting";

export function ArrayVisual({
  panelsInSeries,
  parallelStrings,
  totalPanels,
  capacityKw,
}: {
  panelsInSeries: number;
  parallelStrings: number;
  totalPanels: number;
  capacityKw: number;
}) {
  const rows = Math.max(0, Math.min(parallelStrings, 12));
  const cols = Math.max(0, Math.min(panelsInSeries, 16));

  return (
    <div className="rounded-lg border border-border bg-background/40 p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <p className="metric-number text-lg font-semibold text-foreground">
            {totalPanels} panels
          </p>
          <p className="text-xs text-muted-foreground">
            {panelsInSeries} × {parallelStrings} configuration
          </p>
        </div>
        <p className="metric-number shrink-0 text-lg font-semibold text-primary">
          {formatNumber(capacityKw, 2)} kW
        </p>
      </div>

      <div
        className="mt-4 flex flex-col gap-1.5 overflow-x-auto pb-1"
        role="img"
        aria-label={`Solar array of ${totalPanels} panels arranged in ${parallelStrings} strings of ${panelsInSeries} panels`}
      >
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-1.5">
            {Array.from({ length: cols }).map((__, c) => (
              <span
                key={c}
                className="h-6 w-5 shrink-0 rounded-[3px] border border-primary/40 bg-gradient-to-b from-primary/45 to-primary/10"
              />
            ))}
          </div>
        ))}
      </div>
      {parallelStrings > rows || panelsInSeries > cols ? (
        <p className="mt-2 text-[11px] text-muted-foreground">Layout preview is simplified for large arrays.</p>
      ) : null}
    </div>
  );
}

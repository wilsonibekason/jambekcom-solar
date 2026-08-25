import logoAsset from "@/assets/jambekcom-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="Jambekcom Solutions"
      width={273}
      height={236}
      className={cn("h-9 w-auto shrink-0 object-contain", className)}
    />
  );
}

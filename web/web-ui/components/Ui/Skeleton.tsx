import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-stone-200/80 animate-skeleton",
        className,
      )}
    />
  );
}

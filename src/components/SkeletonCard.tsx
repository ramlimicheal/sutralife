export default function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-border animate-pulse">
      <div className="h-56 bg-surface-high" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-surface-high rounded w-3/4" />
        <div className="h-3 bg-surface-high rounded w-full" />
        <div className="h-3 bg-surface-high rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-5 bg-surface-high rounded w-16" />
          <div className="h-5 bg-surface-high rounded w-12" />
        </div>
      </div>
    </div>
  );
}

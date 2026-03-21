export function formatViewCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function getTierBadgeColor(tier: string): string {
  switch (tier) {
    case "premium":
      return "bg-purple-900/20 text-purple-300 border border-purple-900/50";
    case "collector":
      return "bg-yellow-900/20 text-yellow-300 border border-yellow-900/50";
    case "basic":
      return "bg-gray-700/30 text-gray-400 border border-gray-700";
    default:
      return "bg-gray-700/30 text-gray-400 border border-gray-700";
  }
}

export function getStatusBadge(status: string): string {
  switch (status) {
    case "active":
      return "bg-success/10 text-success border border-success/20";
    case "cancelled":
      return "bg-coral/10 text-coral border border-coral/20";
    case "past_due":
      return "bg-yellow-900/20 text-yellow-400 border border-yellow-900/50";
    default:
      return "bg-surface-highest text-text-secondary border border-border";
  }
}

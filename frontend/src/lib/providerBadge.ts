// bg-muted/text-muted-foreground fails WCAG AA contrast at this size
// (4.34:1 vs the 4.5:1 minimum) — bg-secondary/text-secondary-foreground
// is the same neutral family with enough contrast.
export function providerBadgeClassName(provider: string): string {
  return provider === 'mock'
    ? 'bg-secondary text-secondary-foreground'
    : 'bg-status-won text-status-won-foreground'
}

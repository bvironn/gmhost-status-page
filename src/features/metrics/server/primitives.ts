export const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

export const toIsoOrNull = (unixSeconds?: number | null): string | null => {
  if (!unixSeconds || !Number.isFinite(unixSeconds) || unixSeconds <= 0) return null;
  return new Date(unixSeconds * 1000).toISOString();
};

export const parseNodeOrder = (value: string): { prefix: string; base: number | null; variant: number | null; hasVariant: boolean } => {
  const normalized = value.trim();
  const match = normalized.match(/^(.*?)(\d+)(?:\.(\d+))?$/);
  if (!match) {
    return { prefix: normalized.toLowerCase(), base: null, variant: null, hasVariant: false };
  }

  const [, rawPrefix, rawBase, rawVariant] = match;
  return {
    prefix: rawPrefix.toLowerCase(),
    base: Number(rawBase),
    variant: rawVariant ? Number(rawVariant) : null,
    hasVariant: rawVariant !== undefined,
  };
};

export const compareNodeName = (left: string, right: string): number => {
  const a = parseNodeOrder(left);
  const b = parseNodeOrder(right);

  if (a.prefix !== b.prefix) return a.prefix.localeCompare(b.prefix);
  if (a.hasVariant !== b.hasVariant) return a.hasVariant ? 1 : -1;

  if (a.base !== null && b.base !== null && a.base !== b.base) return a.base - b.base;
  if (a.variant !== null && b.variant !== null && a.variant !== b.variant) return a.variant - b.variant;

  return left.localeCompare(right);
};

export const formatSnapshotParam = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const match = trimmed.match(/^(\d{2})(\d{2})(\d{4})[\sT]?(\d{2})(\d{2})(\d{2})$/);
  if (!match) return null;

  const [, dd, mm, yyyy, HH, MM, SS] = match;
  const date = new Date(Date.UTC(Number(yyyy), Number(mm) - 1, Number(dd), Number(HH), Number(MM), Number(SS)));
  if (
    date.getUTCFullYear() !== Number(yyyy) ||
    date.getUTCMonth() !== Number(mm) - 1 ||
    date.getUTCDate() !== Number(dd) ||
    date.getUTCHours() !== Number(HH) ||
    date.getUTCMinutes() !== Number(MM) ||
    date.getUTCSeconds() !== Number(SS)
  ) {
    return null;
  }

  return `${dd}${mm}${yyyy} ${HH}${MM}${SS}`;
};

export const parseRequestedAt = (raw: string | null): { atUnixSeconds?: number; requestedAt: string | null } => {
  if (!raw) return { requestedAt: null };
  const normalized = raw.trim();
  if (!normalized) return { requestedAt: null };

  const match = normalized.match(/^(\d{2})(\d{2})(\d{4})[\sT]?(\d{2})(\d{2})(\d{2})$/);
  if (!match) {
    throw new Error('Formato inválido para "at". Usa DDMMYYYY HHMMSS');
  }

  const [, dd, mm, yyyy, HH, MM, SS] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const hour = Number(HH);
  const minute = Number(MM);
  const second = Number(SS);

  const date = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day ||
    date.getUTCHours() !== hour ||
    date.getUTCMinutes() !== minute ||
    date.getUTCSeconds() !== second
  ) {
    throw new Error('Fecha/hora inválida para "at"');
  }

  return {
    atUnixSeconds: Math.floor(date.getTime() / 1000),
    requestedAt: `${dd}${mm}${yyyy} ${HH}${MM}${SS}`,
  };
};

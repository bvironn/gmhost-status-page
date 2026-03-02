import { useEffect, useMemo, useState } from 'react';

export type ComponentStatus = 'operational' | 'degraded' | 'maintenance' | 'unknown';

export type NodeEntry = {
  nodeName: string;
  up: boolean;
  stale: boolean;
  lastSeenAt: string | null;
};

export type ComponentEntry = {
  id: string;
  name: string;
  group: 'node' | 'raid' | 'disks';
  nodeName: string;
  status: ComponentStatus;
  detail: string;
  lastSeenAt: string | null;
};

export type IncidentEntry = {
  id: string;
  title: string;
  severity: 'critical' | 'warning';
  status: 'open';
  nodeName: string;
  componentId: string;
  startedAt: string;
  detail: string;
};

export type MetricsData = {
  generatedAt: string;
  requestedAt: string | null;
  summary: {
    total: number;
    operational: number;
    degraded: number;
    maintenance: number;
    unknown: number;
  };
  nodes: NodeEntry[];
  components: ComponentEntry[];
  incidents: IncidentEntry[];
};

const REFRESH_MS = 15000;

const formatSnapshotParam = (value: string): string | null => {
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

export function useMetricsDashboard() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [snapshotInput, setSnapshotInput] = useState('');

  const loadData = async (silent = false, customSnapshot?: string) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const normalizedSnapshot = formatSnapshotParam(customSnapshot ?? snapshotInput);
      const endpoint = normalizedSnapshot ? `/api/metrics.json?at=${encodeURIComponent(normalizedSnapshot)}` : '/api/metrics.json';
      const response = await fetch(endpoint, { cache: 'no-store' });
      const payload = (await response.json()) as MetricsData & { error?: boolean; message?: string };

      if (!response.ok || payload.error) {
        throw new Error(payload.message ?? 'No se pudieron cargar las métricas');
      }

      setData(payload);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error inesperado';
      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadData();
    const id = setInterval(() => {
      if (formatSnapshotParam(snapshotInput)) return;
      void loadData(true);
    }, REFRESH_MS);
    return () => clearInterval(id);
  }, [snapshotInput]);

  const componentsByGroup = useMemo(() => {
    if (!data) return { node: [], raid: [], disks: [] } as Record<'node' | 'raid' | 'disks', ComponentEntry[]>;

    return {
      node: data.components.filter((item) => item.group === 'node'),
      raid: data.components.filter((item) => item.group === 'raid'),
      disks: data.components.filter((item) => item.group === 'disks'),
    };
  }, [data]);

  const applySnapshot = async () => {
    const normalized = formatSnapshotParam(snapshotInput);
    if (!normalized) {
      setError('Formato inválido. Usa DDMMYYYY HHMMSS');
      return;
    }

    setSnapshotInput(normalized);
    await loadData(false, normalized);
  };

  const clearSnapshot = async () => {
    setSnapshotInput('');
    await loadData();
  };

  return {
    data,
    error,
    loading,
    refreshing,
    snapshotInput,
    setSnapshotInput,
    loadData,
    applySnapshot,
    clearSnapshot,
    hasSnapshot: Boolean(formatSnapshotParam(snapshotInput)),
    componentsByGroup,
  };
}

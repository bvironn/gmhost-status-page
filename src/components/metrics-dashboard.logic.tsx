import { useEffect, useMemo, useState } from 'react';

export type NodeEntry = {
  nodeName: string;
  ip: string;
  cpuTotalCores: number;
  cpuUsedCores: number;
  cpuFreeCores: number;
  cpuUsagePercent: number;
  hostCpuUsagePercent: number;
  memoryTotalBytes: number;
  memoryUsedBytes: number;
  memoryFreeBytes: number;
  memoryUsagePercent: number;
  hostMemoryUsagePercent: number;
  diskTotalBytes: number;
  diskUsedBytes: number;
  diskFreeBytes: number;
  diskUsagePercent: number;
  volumesTotalBytes: number | null;
  volumesUsedBytes: number | null;
  volumesFreeBytes: number | null;
  volumesUsagePercent: number | null;
  containerCount: number;
};

export type ContainerEntry = {
  id: string;
  nodeName: string;
  cpuPercent: number;
  memoryBytes: number;
  rxBytesPerSecond: number;
  txBytesPerSecond: number;
  panelUrl: string;
};

export type MetricsData = {
  generatedAt: string;
  requestedAt: string | null;
  nodes: NodeEntry[];
  summary: {
    totalNodes: number;
    totalContainers: number;
    cpuTotalCores: number;
    cpuUsedCores: number;
    cpuFreeCores: number;
    cpuUsagePercent: number;
    memoryTotalBytes: number;
    memoryUsedBytes: number;
    memoryFreeBytes: number;
    memoryUsagePercent: number;
    diskTotalBytes: number;
    diskUsedBytes: number;
    diskFreeBytes: number;
    diskUsagePercent: number;
  };
  containers: ContainerEntry[];
};

export type ContainerSort =
  | 'memory_desc'
  | 'memory_asc'
  | 'cpu_desc'
  | 'cpu_asc'
  | 'rx_desc'
  | 'tx_desc';

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

export const formatBytes = (value: number): string => {
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let size = value;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(size >= 100 ? 0 : size >= 10 ? 1 : 2)} ${units[unit]}`;
};

export const formatRate = (value: number): string => `${formatBytes(value)}/s`;
export const formatPercent = (value: number): string => `${value.toFixed(1)}%`;
export const formatNumber = (value: number): string => value.toFixed(value >= 100 ? 0 : 0);

export function useMetricsDashboard() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState('all');
  const [sortBy, setSortBy] = useState<ContainerSort>('memory_desc');
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
        throw new Error(payload.message ?? 'No se pudo cargar métricas');
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

  const nodeOptions = useMemo(() => {
    const names = new Set((data?.containers ?? []).map((container) => container.nodeName));
    return ['all', ...Array.from(names).sort((a, b) => a.localeCompare(b))];
  }, [data]);

  const filteredContainers = useMemo(() => {
    if (!data) return [];

    const query = searchTerm.trim().toLowerCase();
    const filtered = data.containers.filter((container) => {
      const nodeMatch = selectedNode === 'all' || container.nodeName === selectedNode;
      const searchMatch =
        query.length === 0 ||
        container.id.toLowerCase().includes(query) ||
        container.nodeName.toLowerCase().includes(query);
      return nodeMatch && searchMatch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'memory_asc':
          return a.memoryBytes - b.memoryBytes;
        case 'cpu_desc':
          return b.cpuPercent - a.cpuPercent;
        case 'cpu_asc':
          return a.cpuPercent - b.cpuPercent;
        case 'rx_desc':
          return b.rxBytesPerSecond - a.rxBytesPerSecond;
        case 'tx_desc':
          return b.txBytesPerSecond - a.txBytesPerSecond;
        case 'memory_desc':
        default:
          return b.memoryBytes - a.memoryBytes;
      }
    });

    return filtered.slice(0, 80);
  }, [data, searchTerm, selectedNode, sortBy]);

  const resetFilters = async () => {
    const hadSnapshot = Boolean(formatSnapshotParam(snapshotInput));
    setSearchTerm('');
    setSelectedNode('all');
    setSortBy('memory_desc');
    setSnapshotInput('');

    if (hadSnapshot) {
      await loadData(false, '');
    }
  };

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
    searchTerm,
    selectedNode,
    sortBy,
    snapshotInput,
    nodeOptions,
    filteredContainers,
    setSearchTerm,
    setSelectedNode,
    setSortBy,
    setSnapshotInput,
    loadData,
    resetFilters,
    applySnapshot,
    clearSnapshot,
    hasSnapshot: Boolean(formatSnapshotParam(snapshotInput)),
  };
}

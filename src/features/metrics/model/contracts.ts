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

export type RaidComponentStatus = 'operational' | 'degraded' | 'maintenance' | 'unknown';

export type RaidComponentEntry = {
  id: string;
  name: string;
  nodeName: string;
  kind: 'raid' | 'disks';
  status: RaidComponentStatus;
  detail: string;
  lastSeenAt: string | null;
};

export type RaidIncidentEntry = {
  id: string;
  nodeName: string;
  severity: 'critical' | 'warning';
  title: string;
  detail: string;
  startedAt: string;
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
  raidStatus: {
    components: RaidComponentEntry[];
    incidents: RaidIncidentEntry[];
  };
};

export type ContainerSort =
  | 'memory_desc'
  | 'memory_asc'
  | 'cpu_desc'
  | 'cpu_asc'
  | 'rx_desc'
  | 'tx_desc';

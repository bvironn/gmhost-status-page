export type ResourceStatus = 'operational' | 'degraded' | 'maintenance' | 'unknown';
export type IncidentSeverity = 'critical' | 'warning';

export interface RaidComponent {
    id: string;
    name: string;
    nodeName: string;
    kind: 'raid' | 'disks';
    status: ResourceStatus;
    detail: string;
    lastSeenAt: string | null;
}

export interface RaidIncident {
    id: string;
    nodeName: string;
    severity: IncidentSeverity;
    title: string;
    detail: string;
    startedAt: string;
}

export interface ResourceUsage {
    cpuUsagePercent: number;
    memoryUsagePercent: number;
    diskUsagePercent: number;
}

export interface ResourceCapacity {
    totalBytes: number;
    usedBytes: number;
    freeBytes: number;
    usagePercent: number;
}

export interface NodeMetrics {
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
    // Optional internal fields
    nodeExporterInstance?: string;
    cadvisorInstance?: string;
}

export interface ContainerMetrics {
    id: string;
    nodeName: string;
    cpuPercent: number;
    memoryBytes: number;
    rxBytesPerSecond: number;
    txBytesPerSecond: number;
    panelUrl: string;
    instance?: string;
}

export interface MetricsSummary {
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
}

export interface MetricsPayload {
    generatedAt: string;
    requestedAt: string | null;
    nodes: NodeMetrics[];
    summary: MetricsSummary;
    containers: ContainerMetrics[];
    raidStatus: {
        components: RaidComponent[];
        incidents: RaidIncident[];
    };
}

export type ContainerSortOption =
    | 'memory_desc'
    | 'memory_asc'
    | 'cpu_desc'
    | 'cpu_asc'
    | 'rx_desc'
    | 'tx_desc';

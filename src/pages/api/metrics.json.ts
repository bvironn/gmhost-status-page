import type { APIRoute } from 'astro';

type PromMetric = Record<string, string>;
type PromResult = { metric: PromMetric; value: [number, string] };
type PromResponse = { status: string; data?: { resultType: string; result: PromResult[] }; error?: string };

type NodeEntry = {
  nodeName: string;
  ip: string;
  nodeExporterInstance: string;
  cadvisorInstance: string;
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

type ContainerEntry = {
  id: string;
  nodeName: string;
  instance: string;
  cpuPercent: number;
  memoryBytes: number;
  rxBytesPerSecond: number;
  txBytesPerSecond: number;
  panelUrl: string;
};

type MetricsPayload = {
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

const PROMETHEUS_URL = (import.meta.env.PROMETHEUS_URL as string | undefined)?.trim();
const PANEL_BASE = (import.meta.env.PTERODACTYL_PANEL_URL as string | undefined)?.trim()?.replace(/\/$/, '');

const parseValue = (result?: PromResult): number => {
  if (!result) return 0;
  const raw = result.value?.[1];
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
};

const toNumberMap = (results: PromResult[], keyOf: (r: PromResult) => string): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const item of results) {
    map[keyOf(item)] = parseValue(item);
  }
  return map;
};

const runQuery = async (query: string, atUnixSeconds?: number): Promise<PromResult[]> => {
  const url = new URL('/api/v1/query', PROMETHEUS_URL);
  url.searchParams.set('query', query);
  if (typeof atUnixSeconds === 'number' && Number.isFinite(atUnixSeconds)) {
    url.searchParams.set('time', String(atUnixSeconds));
  }

  const response = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new Error(`Prometheus query failed (${response.status})`);
  }

  const body = (await response.json()) as PromResponse;
  if (body.status !== 'success' || !body.data?.result) {
    throw new Error(body.error ?? 'Invalid Prometheus response');
  }

  return body.data.result;
};

const clamp = (value: number, min = 0, max = 100): number => Math.min(max, Math.max(min, value));

const parseRequestedAt = (raw: string | null): { atUnixSeconds?: number; requestedAt: string | null } => {
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

export const GET: APIRoute = async ({ request }) => {
  try {
    if (!PROMETHEUS_URL) {
      throw new Error('Falta configurar PROMETHEUS_URL en el entorno');
    }
    if (!PANEL_BASE) {
      throw new Error('Falta configurar PTERODACTYL_PANEL_URL en el entorno');
    }

    const requestUrl = new URL(request.url);
    const { atUnixSeconds, requestedAt } = parseRequestedAt(requestUrl.searchParams.get('at'));

    const [
      nodeInfo,
      cpuCores,
      memoryTotal,
      nodeHostCpu,
      nodeMemTotal,
      nodeMemAvail,
      nodeDiskTotal,
      nodeDiskAvail,
      nodeVolumesUsed,
      nodeVolumesFsTotal,
      nodeVolumesFsAvail,
      containerCpuByNode,
      containerMemByNode,
      containerCountByNode,
      containerMemById,
      containerCpuById,
      containerRxById,
      containerTxById,
    ] = await Promise.all([
      runQuery('node_uname_info{job="node_exporter"}', atUnixSeconds),
      runQuery('machine_cpu_cores{job="cadvisor"}', atUnixSeconds),
      runQuery('machine_memory_bytes{job="cadvisor"}', atUnixSeconds),
      runQuery('100 - (avg by(instance) (rate(node_cpu_seconds_total{job="node_exporter",mode="idle"}[2m])) * 100)', atUnixSeconds),
      runQuery('node_memory_MemTotal_bytes{job="node_exporter"}', atUnixSeconds),
      runQuery('node_memory_MemAvailable_bytes{job="node_exporter"}', atUnixSeconds),
      runQuery('node_filesystem_size_bytes{job="node_exporter",mountpoint="/",fstype!~"tmpfs|overlay|squashfs|ramfs"}', atUnixSeconds),
      runQuery('node_filesystem_avail_bytes{job="node_exporter",mountpoint="/",fstype!~"tmpfs|overlay|squashfs|ramfs"}', atUnixSeconds),
      runQuery('(pterodactyl_volumes_used_bytes{job="node_exporter"} or pterodactyl_volumes_bytes{job="node_exporter"})', atUnixSeconds),
      runQuery('pterodactyl_volumes_fs_total_bytes{job="node_exporter"}', atUnixSeconds),
      runQuery('pterodactyl_volumes_fs_avail_bytes{job="node_exporter"}', atUnixSeconds),
      runQuery('sum by(instance) (rate(container_cpu_usage_seconds_total{job="cadvisor",container_label_ContainerType="server_process"}[2m])) * 100', atUnixSeconds),
      runQuery('sum by(instance) (container_memory_usage_bytes{job="cadvisor",container_label_ContainerType="server_process"})', atUnixSeconds),
      runQuery('count by(instance) (container_memory_usage_bytes{job="cadvisor",container_label_ContainerType="server_process"})', atUnixSeconds),
      runQuery('sum by(instance,name) (container_memory_usage_bytes{job="cadvisor",container_label_ContainerType="server_process"})', atUnixSeconds),
      runQuery('sum by(instance,name) (rate(container_cpu_usage_seconds_total{job="cadvisor",container_label_ContainerType="server_process"}[2m]) * 100)', atUnixSeconds),
      runQuery('sum by(instance,name) (rate(container_network_receive_bytes_total{job="cadvisor",container_label_ContainerType="server_process"}[5m]))', atUnixSeconds),
      runQuery('sum by(instance,name) (rate(container_network_transmit_bytes_total{job="cadvisor",container_label_ContainerType="server_process"}[5m]))', atUnixSeconds),
    ]);

    const coresByCadvisor = toNumberMap(cpuCores, (r) => r.metric.instance);
    const memoryByCadvisor = toNumberMap(memoryTotal, (r) => r.metric.instance);
    const hostCpuByNodeExporter = toNumberMap(nodeHostCpu, (r) => r.metric.instance);
    const hostMemTotalByNodeExporter = toNumberMap(nodeMemTotal, (r) => r.metric.instance);
    const hostMemAvailByNodeExporter = toNumberMap(nodeMemAvail, (r) => r.metric.instance);
    const diskTotalByNodeExporter = toNumberMap(nodeDiskTotal, (r) => r.metric.instance);
    const diskAvailByNodeExporter = toNumberMap(nodeDiskAvail, (r) => r.metric.instance);
    const volumesUsedByNodeExporter = toNumberMap(nodeVolumesUsed, (r) => r.metric.instance);
    const volumesFsTotalByNodeExporter = toNumberMap(nodeVolumesFsTotal, (r) => r.metric.instance);
    const volumesFsAvailByNodeExporter = toNumberMap(nodeVolumesFsAvail, (r) => r.metric.instance);
    const containersCpuByCadvisor = toNumberMap(containerCpuByNode, (r) => r.metric.instance);
    const containersMemByCadvisor = toNumberMap(containerMemByNode, (r) => r.metric.instance);
    const containersCountByCadvisor = toNumberMap(containerCountByNode, (r) => r.metric.instance);

    const nodeMap = new Map<string, NodeEntry>();
    for (const info of nodeInfo) {
      const nodeExporterInstance = info.metric.instance;
      const ip = nodeExporterInstance.split(':')[0] ?? nodeExporterInstance;
      const cadvisorInstance = `${ip}:9091`;
      const nodeName = info.metric.nodename ?? ip;

      const cpuTotalCores = coresByCadvisor[cadvisorInstance] ?? 0;
      const cpuUsedPercentOfSingleCore = containersCpuByCadvisor[cadvisorInstance] ?? 0;
      const cpuUsedCores = cpuUsedPercentOfSingleCore / 100;
      const cpuFreeCores = Math.max(0, cpuTotalCores - cpuUsedCores);
      const cpuUsagePercent = cpuTotalCores > 0 ? clamp((cpuUsedCores / cpuTotalCores) * 100) : 0;

      const memoryTotalBytes = memoryByCadvisor[cadvisorInstance] ?? hostMemTotalByNodeExporter[nodeExporterInstance] ?? 0;
      const memoryUsedBytes = containersMemByCadvisor[cadvisorInstance] ?? 0;
      const memoryFreeBytes = Math.max(0, memoryTotalBytes - memoryUsedBytes);
      const memoryUsagePercent = memoryTotalBytes > 0 ? clamp((memoryUsedBytes / memoryTotalBytes) * 100) : 0;

      const hostMemoryTotal = hostMemTotalByNodeExporter[nodeExporterInstance] ?? memoryTotalBytes;
      const hostMemoryAvail = hostMemAvailByNodeExporter[nodeExporterInstance] ?? memoryFreeBytes;
      const hostMemoryUsagePercent = hostMemoryTotal > 0 ? clamp(((hostMemoryTotal - hostMemoryAvail) / hostMemoryTotal) * 100) : 0;

      const diskTotalBytes = diskTotalByNodeExporter[nodeExporterInstance] ?? 0;
      const diskFreeBytes = diskAvailByNodeExporter[nodeExporterInstance] ?? 0;
      const diskUsedBytes = Math.max(0, diskTotalBytes - diskFreeBytes);
      const diskUsagePercent = diskTotalBytes > 0 ? clamp((diskUsedBytes / diskTotalBytes) * 100) : 0;

      const volumesUsedRaw = volumesUsedByNodeExporter[nodeExporterInstance];
      const hasVolumesMetrics = Number.isFinite(volumesUsedRaw);
      const volumesTotalRaw = volumesFsTotalByNodeExporter[nodeExporterInstance];
      const volumesAvailRaw = volumesFsAvailByNodeExporter[nodeExporterInstance];
      const volumesTotalBytes = hasVolumesMetrics
        ? Number.isFinite(volumesTotalRaw)
          ? volumesTotalRaw
          : diskTotalBytes
        : null;
      const volumesUsedSanitized = hasVolumesMetrics ? Math.max(0, volumesUsedRaw) : null;
      const volumesUsedBytes =
        hasVolumesMetrics && volumesUsedSanitized !== null && volumesTotalBytes !== null
          ? Math.min(volumesUsedSanitized, volumesTotalBytes)
          : null;
      const volumesFreeBytes =
        hasVolumesMetrics && volumesTotalBytes !== null
          ? Number.isFinite(volumesAvailRaw)
            ? Math.max(0, volumesAvailRaw)
            : volumesUsedBytes !== null
              ? Math.max(0, volumesTotalBytes - volumesUsedBytes)
              : null
          : null;
      const volumesUsagePercent =
        hasVolumesMetrics && volumesTotalBytes && volumesUsedBytes !== null
          ? clamp((volumesUsedBytes / volumesTotalBytes) * 100)
          : null;

      nodeMap.set(cadvisorInstance, {
        nodeName,
        ip,
        nodeExporterInstance,
        cadvisorInstance,
        cpuTotalCores,
        cpuUsedCores,
        cpuFreeCores,
        cpuUsagePercent,
        hostCpuUsagePercent: clamp(hostCpuByNodeExporter[nodeExporterInstance] ?? 0),
        memoryTotalBytes,
        memoryUsedBytes,
        memoryFreeBytes,
        memoryUsagePercent,
        hostMemoryUsagePercent,
        diskTotalBytes,
        diskUsedBytes,
        diskFreeBytes,
        diskUsagePercent,
        volumesTotalBytes,
        volumesUsedBytes,
        volumesFreeBytes,
        volumesUsagePercent,
        containerCount: Math.round(containersCountByCadvisor[cadvisorInstance] ?? 0),
      });
    }

    const nodeEntries = Array.from(nodeMap.values()).sort((a, b) => a.nodeName.localeCompare(b.nodeName));

    const containersCpuMap = toNumberMap(containerCpuById, (r) => `${r.metric.instance}|${r.metric.name}`);
    const containersRxMap = toNumberMap(containerRxById, (r) => `${r.metric.instance}|${r.metric.name}`);
    const containersTxMap = toNumberMap(containerTxById, (r) => `${r.metric.instance}|${r.metric.name}`);

    const containers: ContainerEntry[] = containerMemById
      .map((item) => {
        const instance = item.metric.instance;
        const id = item.metric.name;
        const key = `${instance}|${id}`;
        const node = nodeMap.get(instance);

        return {
          id,
          nodeName: node?.nodeName ?? instance,
          instance,
          cpuPercent: containersCpuMap[key] ?? 0,
          memoryBytes: parseValue(item),
          rxBytesPerSecond: containersRxMap[key] ?? 0,
          txBytesPerSecond: containersTxMap[key] ?? 0,
          panelUrl: `${PANEL_BASE}/${id}`,
        };
      })
      .sort((a, b) => b.memoryBytes - a.memoryBytes);

    const summary = nodeEntries.reduce(
      (acc, node) => {
        acc.totalNodes += 1;
        acc.totalContainers += node.containerCount;
        acc.cpuTotalCores += node.cpuTotalCores;
        acc.cpuUsedCores += node.cpuUsedCores;
        acc.memoryTotalBytes += node.memoryTotalBytes;
        acc.memoryUsedBytes += node.memoryUsedBytes;
        acc.diskTotalBytes += node.diskTotalBytes;
        acc.diskUsedBytes += node.diskUsedBytes;
        return acc;
      },
      {
        totalNodes: 0,
        totalContainers: 0,
        cpuTotalCores: 0,
        cpuUsedCores: 0,
        memoryTotalBytes: 0,
        memoryUsedBytes: 0,
        diskTotalBytes: 0,
        diskUsedBytes: 0,
      },
    );

    const cpuFreeCores = Math.max(0, summary.cpuTotalCores - summary.cpuUsedCores);
    const memoryFreeBytes = Math.max(0, summary.memoryTotalBytes - summary.memoryUsedBytes);
    const diskFreeBytes = Math.max(0, summary.diskTotalBytes - summary.diskUsedBytes);

    const payload: MetricsPayload = {
      generatedAt: new Date().toISOString(),
      requestedAt,
      nodes: nodeEntries,
      summary: {
        totalNodes: summary.totalNodes,
        totalContainers: summary.totalContainers,
        cpuTotalCores: summary.cpuTotalCores,
        cpuUsedCores: summary.cpuUsedCores,
        cpuFreeCores,
        cpuUsagePercent: summary.cpuTotalCores > 0 ? clamp((summary.cpuUsedCores / summary.cpuTotalCores) * 100) : 0,
        memoryTotalBytes: summary.memoryTotalBytes,
        memoryUsedBytes: summary.memoryUsedBytes,
        memoryFreeBytes,
        memoryUsagePercent: summary.memoryTotalBytes > 0 ? clamp((summary.memoryUsedBytes / summary.memoryTotalBytes) * 100) : 0,
        diskTotalBytes: summary.diskTotalBytes,
        diskUsedBytes: summary.diskUsedBytes,
        diskFreeBytes,
        diskUsagePercent: summary.diskTotalBytes > 0 ? clamp((summary.diskUsedBytes / summary.diskTotalBytes) * 100) : 0,
      },
      containers,
    };

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(
      JSON.stringify({
        error: true,
        message,
        generatedAt: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
        },
      },
    );
  }
};

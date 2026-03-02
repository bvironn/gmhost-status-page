import { compareNodeName } from '@/features/metrics/model/node-order';
import type { MetricsQueryResults } from '@/features/metrics/server/metrics-queries';
import { clamp } from '@/features/metrics/server/primitives';
import { toNumberMap } from '@/features/metrics/server/prometheus';
import type { BuildNodesResult, NodeRuntimeEntry } from '@/features/metrics/server/payload/types';
import type { PromMetric } from '@/features/metrics/server/prometheus';

export const buildNodes = (results: MetricsQueryResults): BuildNodesResult => {
  const coresByCadvisor = toNumberMap(results.cpuCores, (r) => r.metric.instance);
  const memoryByCadvisor = toNumberMap(results.memoryTotal, (r) => r.metric.instance);
  const hostCpuByNodeExporter = toNumberMap(results.nodeHostCpu, (r) => r.metric.instance);
  const hostMemTotalByNodeExporter = toNumberMap(results.nodeMemTotal, (r) => r.metric.instance);
  const hostMemAvailByNodeExporter = toNumberMap(results.nodeMemAvail, (r) => r.metric.instance);
  const diskTotalByNodeExporter = toNumberMap(results.nodeDiskTotal, (r) => r.metric.instance);
  const diskAvailByNodeExporter = toNumberMap(results.nodeDiskAvail, (r) => r.metric.instance);
  const volumesUsedByNodeExporter = toNumberMap(results.nodeVolumesUsed, (r) => r.metric.instance);
  const volumesFsTotalByNodeExporter = toNumberMap(results.nodeVolumesFsTotal, (r) => r.metric.instance);
  const volumesFsAvailByNodeExporter = toNumberMap(results.nodeVolumesFsAvail, (r) => r.metric.instance);
  const containersCpuByCadvisor = toNumberMap(results.containerCpuByNode, (r) => r.metric.instance);
  const containersMemByCadvisor = toNumberMap(results.containerMemByNode, (r) => r.metric.instance);
  const containersCountByCadvisor = toNumberMap(results.containerCountByNode, (r) => r.metric.instance);

  const nodeMap = new Map<string, NodeRuntimeEntry>();

  for (const info of results.nodeInfo) {
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

  const nodeEntries = Array.from(nodeMap.values()).sort((a, b) => compareNodeName(a.nodeName, b.nodeName));
  const nodeNameByExporterInstance = new Map(nodeEntries.map((node) => [node.nodeExporterInstance, node.nodeName]));
  const nodeNameByIp = new Map(nodeEntries.map((node) => [node.ip, node.nodeName]));

  const resolveNodeName = (metric: PromMetric): string => {
    if (metric.node) return metric.node;
    if (metric.nodename) return metric.nodename;
    const instance = metric.instance ?? '';
    if (nodeNameByExporterInstance.has(instance)) return nodeNameByExporterInstance.get(instance)!;
    const ip = instance.split(':')[0] ?? instance;
    if (nodeNameByIp.has(ip)) return nodeNameByIp.get(ip)!;
    return ip || 'unknown';
  };

  return { nodeMap, nodeEntries, resolveNodeName };
};

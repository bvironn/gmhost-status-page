import type { ContainerEntry } from '@/features/metrics/model/contracts';
import type { MetricsQueryResults } from '@/features/metrics/server/metrics-queries';
import { clamp } from '@/features/metrics/server/primitives';
import { parseValue, toNumberMap } from '@/features/metrics/server/prometheus';
import type { NodeRuntimeEntry } from '@/features/metrics/server/payload/types';

export const buildContainersAndSummary = ({
  results,
  nodeMap,
  nodeEntries,
  panelBase,
}: {
  results: MetricsQueryResults;
  nodeMap: Map<string, NodeRuntimeEntry>;
  nodeEntries: NodeRuntimeEntry[];
  panelBase: string;
}): {
  containers: ContainerEntry[];
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
} => {
  const containersCpuMap = toNumberMap(results.containerCpuById, (r) => `${r.metric.instance}|${r.metric.name}`);
  const containersRxMap = toNumberMap(results.containerRxById, (r) => `${r.metric.instance}|${r.metric.name}`);
  const containersTxMap = toNumberMap(results.containerTxById, (r) => `${r.metric.instance}|${r.metric.name}`);

  const containers: ContainerEntry[] = results.containerMemById
    .map((item) => {
      const instance = item.metric.instance;
      const id = item.metric.name;
      const key = `${instance}|${id}`;
      const node = nodeMap.get(instance);

        return {
          id,
          nodeName: node?.nodeName ?? instance,
          cpuPercent: containersCpuMap[key] ?? 0,
          memoryBytes: parseValue(item),
          rxBytesPerSecond: containersRxMap[key] ?? 0,
          txBytesPerSecond: containersTxMap[key] ?? 0,
        panelUrl: `${panelBase}/${id}`,
      };
    })
    .sort((a, b) => b.memoryBytes - a.memoryBytes);

  const rawSummary = nodeEntries.reduce(
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

  const cpuFreeCores = Math.max(0, rawSummary.cpuTotalCores - rawSummary.cpuUsedCores);
  const memoryFreeBytes = Math.max(0, rawSummary.memoryTotalBytes - rawSummary.memoryUsedBytes);
  const diskFreeBytes = Math.max(0, rawSummary.diskTotalBytes - rawSummary.diskUsedBytes);

  return {
    containers,
    summary: {
      totalNodes: rawSummary.totalNodes,
      totalContainers: rawSummary.totalContainers,
      cpuTotalCores: rawSummary.cpuTotalCores,
      cpuUsedCores: rawSummary.cpuUsedCores,
      cpuFreeCores,
      cpuUsagePercent: rawSummary.cpuTotalCores > 0 ? clamp((rawSummary.cpuUsedCores / rawSummary.cpuTotalCores) * 100) : 0,
      memoryTotalBytes: rawSummary.memoryTotalBytes,
      memoryUsedBytes: rawSummary.memoryUsedBytes,
      memoryFreeBytes,
      memoryUsagePercent:
        rawSummary.memoryTotalBytes > 0 ? clamp((rawSummary.memoryUsedBytes / rawSummary.memoryTotalBytes) * 100) : 0,
      diskTotalBytes: rawSummary.diskTotalBytes,
      diskUsedBytes: rawSummary.diskUsedBytes,
      diskFreeBytes,
      diskUsagePercent: rawSummary.diskTotalBytes > 0 ? clamp((rawSummary.diskUsedBytes / rawSummary.diskTotalBytes) * 100) : 0,
    },
  };
};

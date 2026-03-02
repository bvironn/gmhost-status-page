import { describe, expect, test } from 'bun:test';
import type { MetricsQueryResults } from '@/features/metrics/server/metrics-queries';
import type { PromResult } from '@/features/metrics/server/prometheus';
import { buildContainersAndSummary } from '@/features/metrics/server/payload/build-containers-summary';
import { buildRaidStatus } from '@/features/metrics/server/payload/build-raid-status';
import type { NodeRuntimeEntry } from '@/features/metrics/server/payload/types';

const prom = (metric: Record<string, string>, value: number, ts = 1000): PromResult => ({
  metric,
  value: [ts, String(value)],
});

const emptyResults = (): MetricsQueryResults => ({
  nodeInfo: [],
  nodeExporterUp: [],
  nodeExporterUpTs: [],
  cpuCores: [],
  memoryTotal: [],
  nodeHostCpu: [],
  nodeMemTotal: [],
  nodeMemAvail: [],
  nodeDiskTotal: [],
  nodeDiskAvail: [],
  nodeVolumesUsed: [],
  nodeVolumesFsTotal: [],
  nodeVolumesFsAvail: [],
  containerCpuByNode: [],
  containerMemByNode: [],
  containerCountByNode: [],
  containerMemById: [],
  containerCpuById: [],
  containerRxById: [],
  containerTxById: [],
  mdFailedByNode: [],
  mdFailedTsByNode: [],
  mdActivityByNode: [],
  mdActivityTsByNode: [],
  mdActiveByNode: [],
  mdActiveTsByNode: [],
  md1ActiveByNode: [],
  smartHealthyMaxByNode: [],
  smartHealthyMinByNode: [],
  smartHealthyTsByNode: [],
  smartHealthyRaw: [],
  smartFailedByNode: [],
  smartFailedTsByNode: [],
  smartFailedRaw: [],
});

const makeNode = (): NodeRuntimeEntry => ({
  nodeName: 'GM-1',
  ip: '10.0.0.1',
  nodeExporterInstance: '10.0.0.1:9100',
  cadvisorInstance: '10.0.0.1:9091',
  cpuTotalCores: 8,
  cpuUsedCores: 2,
  cpuFreeCores: 6,
  cpuUsagePercent: 25,
  hostCpuUsagePercent: 30,
  memoryTotalBytes: 1600,
  memoryUsedBytes: 400,
  memoryFreeBytes: 1200,
  memoryUsagePercent: 25,
  hostMemoryUsagePercent: 35,
  diskTotalBytes: 10000,
  diskUsedBytes: 2500,
  diskFreeBytes: 7500,
  diskUsagePercent: 25,
  volumesTotalBytes: 5000,
  volumesUsedBytes: 1200,
  volumesFreeBytes: 3800,
  volumesUsagePercent: 24,
  containerCount: 1,
});

describe('metrics payload helpers', () => {
  test('buildContainersAndSummary returns contract-safe containers', () => {
    const results = emptyResults();
    results.containerMemById = [prom({ instance: '10.0.0.1:9091', name: 'abc123' }, 256)];
    results.containerCpuById = [prom({ instance: '10.0.0.1:9091', name: 'abc123' }, 12.5)];
    results.containerRxById = [prom({ instance: '10.0.0.1:9091', name: 'abc123' }, 1024)];
    results.containerTxById = [prom({ instance: '10.0.0.1:9091', name: 'abc123' }, 2048)];

    const node = makeNode();
    const { containers, summary } = buildContainersAndSummary({
      results,
      nodeMap: new Map([[node.cadvisorInstance, node]]),
      nodeEntries: [node],
      panelBase: 'https://panel.example/server',
    });

    expect(containers).toHaveLength(1);
    expect(containers[0].id).toBe('abc123');
    expect(containers[0].panelUrl).toBe('https://panel.example/server/abc123');
    expect(Object.prototype.hasOwnProperty.call(containers[0], 'instance')).toBe(false);
    expect(summary.totalNodes).toBe(1);
    expect(summary.totalContainers).toBe(1);
    expect(summary.cpuUsagePercent).toBe(25);
  });

  test('buildRaidStatus emits degraded RAID and SMART incidents', () => {
    const results = emptyResults();
    results.nodeExporterUp = [prom({ instance: '10.0.0.1:9100' }, 1)];
    results.nodeExporterUpTs = [prom({ instance: '10.0.0.1:9100' }, 1000)];
    results.mdFailedByNode = [prom({ instance: '10.0.0.1:9100' }, 1)];
    results.mdFailedTsByNode = [prom({ instance: '10.0.0.1:9100' }, 1000)];
    results.mdActivityByNode = [prom({ instance: '10.0.0.1:9100' }, 0)];
    results.mdActivityTsByNode = [prom({ instance: '10.0.0.1:9100' }, 1000)];
    results.mdActiveByNode = [prom({ instance: '10.0.0.1:9100' }, 1)];
    results.mdActiveTsByNode = [prom({ instance: '10.0.0.1:9100' }, 1000)];
    results.md1ActiveByNode = [prom({ instance: '10.0.0.1:9100' }, 1)];
    results.smartHealthyMaxByNode = [prom({ instance: '10.0.0.1:9100' }, 0)];
    results.smartHealthyMinByNode = [prom({ instance: '10.0.0.1:9100' }, 0)];
    results.smartHealthyTsByNode = [prom({ instance: '10.0.0.1:9100' }, 1000)];
    results.smartFailedByNode = [prom({ node: 'GM-1' }, 1)];
    results.smartFailedTsByNode = [prom({ node: 'GM-1' }, 1000)];
    results.smartHealthyRaw = [prom({ instance: '10.0.0.1:9100', device: 'nvme0n1' }, 0)];
    results.smartFailedRaw = [prom({ node: 'GM-1', disk: 'nvme1n1' }, 1)];

    const node = makeNode();
    const raid = buildRaidStatus({
      results,
      nodeEntries: [node],
      resolveNodeName: (metric) => metric.node ?? metric.nodename ?? 'GM-1',
      atUnixSeconds: 1100,
    });

    expect(raid.components).toHaveLength(2);
    const raidComponent = raid.components.find((component) => component.kind === 'raid');
    const disksComponent = raid.components.find((component) => component.kind === 'disks');

    expect(raidComponent?.status).toBe('degraded');
    expect(disksComponent?.status).toBe('degraded');
    expect(raid.incidents.some((incident) => incident.id === 'raid-degraded-GM-1')).toBe(true);
    expect(raid.incidents.some((incident) => incident.id === 'smart-failed-GM-1')).toBe(true);
  });
});

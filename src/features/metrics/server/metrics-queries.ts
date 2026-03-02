import type { PromResult } from '@/features/metrics/server/prometheus';

export type MetricsQueryResults = {
  nodeInfo: PromResult[];
  nodeExporterUp: PromResult[];
  nodeExporterUpTs: PromResult[];
  cpuCores: PromResult[];
  memoryTotal: PromResult[];
  nodeHostCpu: PromResult[];
  nodeMemTotal: PromResult[];
  nodeMemAvail: PromResult[];
  nodeDiskTotal: PromResult[];
  nodeDiskAvail: PromResult[];
  nodeVolumesUsed: PromResult[];
  nodeVolumesFsTotal: PromResult[];
  nodeVolumesFsAvail: PromResult[];
  containerCpuByNode: PromResult[];
  containerMemByNode: PromResult[];
  containerCountByNode: PromResult[];
  containerMemById: PromResult[];
  containerCpuById: PromResult[];
  containerRxById: PromResult[];
  containerTxById: PromResult[];
  mdFailedByNode: PromResult[];
  mdFailedTsByNode: PromResult[];
  mdActivityByNode: PromResult[];
  mdActivityTsByNode: PromResult[];
  mdActiveByNode: PromResult[];
  mdActiveTsByNode: PromResult[];
  md1ActiveByNode: PromResult[];
  smartHealthyMaxByNode: PromResult[];
  smartHealthyMinByNode: PromResult[];
  smartHealthyTsByNode: PromResult[];
  smartHealthyRaw: PromResult[];
  smartFailedByNode: PromResult[];
  smartFailedTsByNode: PromResult[];
  smartFailedRaw: PromResult[];
};

const METRICS_QUERIES = {
  nodeInfo: 'node_uname_info{job="node_exporter"}',
  nodeExporterUp: 'up{job="node_exporter"}',
  nodeExporterUpTs: 'timestamp(up{job="node_exporter"})',
  cpuCores: 'machine_cpu_cores{job="cadvisor"}',
  memoryTotal: 'machine_memory_bytes{job="cadvisor"}',
  nodeHostCpu: '100 - (avg by(instance) (rate(node_cpu_seconds_total{job="node_exporter",mode="idle"}[2m])) * 100)',
  nodeMemTotal: 'node_memory_MemTotal_bytes{job="node_exporter"}',
  nodeMemAvail: 'node_memory_MemAvailable_bytes{job="node_exporter"}',
  nodeDiskTotal: 'node_filesystem_size_bytes{job="node_exporter",mountpoint="/",fstype!~"tmpfs|overlay|squashfs|ramfs"}',
  nodeDiskAvail: 'node_filesystem_avail_bytes{job="node_exporter",mountpoint="/",fstype!~"tmpfs|overlay|squashfs|ramfs"}',
  nodeVolumesUsed: '(pterodactyl_volumes_used_bytes{job="node_exporter"} or pterodactyl_volumes_bytes{job="node_exporter"})',
  nodeVolumesFsTotal: 'pterodactyl_volumes_fs_total_bytes{job="node_exporter"}',
  nodeVolumesFsAvail: 'pterodactyl_volumes_fs_avail_bytes{job="node_exporter"}',
  containerCpuByNode: 'sum by(instance) (rate(container_cpu_usage_seconds_total{job="cadvisor",container_label_ContainerType="server_process"}[2m])) * 100',
  containerMemByNode: 'sum by(instance) (container_memory_usage_bytes{job="cadvisor",container_label_ContainerType="server_process"})',
  containerCountByNode: 'count by(instance) (container_memory_usage_bytes{job="cadvisor",container_label_ContainerType="server_process"})',
  containerMemById: 'sum by(instance,name) (container_memory_usage_bytes{job="cadvisor",container_label_ContainerType="server_process"})',
  containerCpuById: 'sum by(instance,name) (rate(container_cpu_usage_seconds_total{job="cadvisor",container_label_ContainerType="server_process"}[2m]) * 100)',
  containerRxById: 'sum by(instance,name) (rate(container_network_receive_bytes_total{job="cadvisor",container_label_ContainerType="server_process"}[5m]))',
  containerTxById: 'sum by(instance,name) (rate(container_network_transmit_bytes_total{job="cadvisor",container_label_ContainerType="server_process"}[5m]))',
  mdFailedByNode: 'sum by(instance) (node_md_disks{job="node_exporter",state="failed"})',
  mdFailedTsByNode: 'max by(instance) (timestamp(node_md_disks{job="node_exporter",state="failed"}))',
  mdActivityByNode: 'max by(instance) (node_md_state{job="node_exporter",state=~"resync|recovering|check"})',
  mdActivityTsByNode: 'max by(instance) (timestamp(node_md_state{job="node_exporter",state=~"resync|recovering|check"}))',
  mdActiveByNode: 'max by(instance) (node_md_state{job="node_exporter",state="active"})',
  mdActiveTsByNode: 'max by(instance) (timestamp(node_md_state{job="node_exporter",state="active"}))',
  md1ActiveByNode: 'max by(instance) ((node_md_state{job="node_exporter",state="active",device="md1"}) or (node_md_state{job="node_exporter",state="active",md_device="md1"}))',
  smartHealthyMaxByNode: 'max by(instance) (node_smartmon_device_smart_healthy{job="node_exporter"})',
  smartHealthyMinByNode: 'min by(instance) (node_smartmon_device_smart_healthy{job="node_exporter"})',
  smartHealthyTsByNode: 'max by(instance) (timestamp(node_smartmon_device_smart_healthy{job="node_exporter"}))',
  smartHealthyRaw: 'node_smartmon_device_smart_healthy{job="node_exporter"}',
  smartFailedByNode: 'max by(node) (smart_failed{job="node_exporter"})',
  smartFailedTsByNode: 'max by(node) (timestamp(smart_failed{job="node_exporter"}))',
  smartFailedRaw: 'smart_failed{job="node_exporter"}',
} as const;

export const fetchMetricsQueryResults = async (
  runQuery: (query: string, atUnixSeconds?: number) => Promise<PromResult[]>,
  atUnixSeconds?: number,
): Promise<MetricsQueryResults> => {
  const entries = Object.entries(METRICS_QUERIES) as [keyof MetricsQueryResults, string][];
  const values = await Promise.all(entries.map(([, query]) => runQuery(query, atUnixSeconds)));

  const result = {} as MetricsQueryResults;
  for (let index = 0; index < entries.length; index += 1) {
    const [key] = entries[index];
    result[key] = values[index];
  }

  return result;
};

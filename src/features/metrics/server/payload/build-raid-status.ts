import {
  type RaidComponentEntry,
  type RaidComponentStatus,
  type RaidIncidentEntry,
} from '@/features/metrics/model/contracts';
import { compareNodeName } from '@/features/metrics/model/node-order';
import type { MetricsQueryResults } from '@/features/metrics/server/metrics-queries';
import { toIsoOrNull } from '@/features/metrics/server/primitives';
import { parseValue, type PromMetric, type PromResult } from '@/features/metrics/server/prometheus';
import type { NodeRuntimeEntry } from '@/features/metrics/server/payload/types';

const STALE_SECONDS = 300;

export const buildRaidStatus = ({
  results,
  nodeEntries,
  resolveNodeName,
  atUnixSeconds,
}: {
  results: MetricsQueryResults;
  nodeEntries: NodeRuntimeEntry[];
  resolveNodeName: (metric: PromMetric) => string;
  atUnixSeconds?: number;
}): { components: RaidComponentEntry[]; incidents: RaidIncidentEntry[] } => {
  const toByNodeMap = (queryResults: PromResult[]): Record<string, number> => {
    const map: Record<string, number> = {};
    for (const item of queryResults) {
      const nodeName = resolveNodeName(item.metric);
      const value = parseValue(item);
      if (!(nodeName in map) || value > map[nodeName]) {
        map[nodeName] = value;
      }
    }
    return map;
  };

  const upByNode = toByNodeMap(results.nodeExporterUp);
  const upTsByNode = toByNodeMap(results.nodeExporterUpTs);
  const mdFailedByNodeMap = toByNodeMap(results.mdFailedByNode);
  const mdFailedTsByNodeMap = toByNodeMap(results.mdFailedTsByNode);
  const mdActivityByNodeMap = toByNodeMap(results.mdActivityByNode);
  const mdActivityTsByNodeMap = toByNodeMap(results.mdActivityTsByNode);
  const mdActiveByNodeMap = toByNodeMap(results.mdActiveByNode);
  const mdActiveTsByNodeMap = toByNodeMap(results.mdActiveTsByNode);
  const md1ActiveByNodeMap = toByNodeMap(results.md1ActiveByNode);
  const smartHealthyMaxByNodeMap = toByNodeMap(results.smartHealthyMaxByNode);
  const smartHealthyMinByNodeMap = toByNodeMap(results.smartHealthyMinByNode);
  const smartHealthyTsByNodeMap = toByNodeMap(results.smartHealthyTsByNode);
  const smartFailedByNodeMap = toByNodeMap(results.smartFailedByNode);
  const smartFailedTsByNodeMap = toByNodeMap(results.smartFailedTsByNode);

  const smartUnhealthyDisksByNode: Record<string, string[]> = {};
  for (const item of results.smartHealthyRaw) {
    if (parseValue(item) >= 1) continue;
    const nodeName = resolveNodeName(item.metric);
    const disk = item.metric.device ?? item.metric.disk ?? item.metric.dev ?? item.metric.name;
    if (!disk) continue;
    if (!smartUnhealthyDisksByNode[nodeName]) {
      smartUnhealthyDisksByNode[nodeName] = [];
    }
    smartUnhealthyDisksByNode[nodeName].push(disk);
  }

  const smartFailedDisksByNode: Record<string, string[]> = {};
  for (const item of results.smartFailedRaw) {
    if (parseValue(item) < 1) continue;
    const nodeName = resolveNodeName(item.metric);
    const disk = item.metric.disk ?? item.metric.device ?? item.metric.dev ?? item.metric.name;
    if (!disk) continue;
    if (!smartFailedDisksByNode[nodeName]) {
      smartFailedDisksByNode[nodeName] = [];
    }
    smartFailedDisksByNode[nodeName].push(disk);
  }

  const components: RaidComponentEntry[] = [];
  const incidents: RaidIncidentEntry[] = [];
  const nowUnix = atUnixSeconds ?? Math.floor(Date.now() / 1000);

  for (const node of nodeEntries) {
    const nodeName = node.nodeName;
    const upValue = upByNode[nodeName] ?? 0;
    const upTs = upTsByNode[nodeName] ?? 0;
    const mdFailed = mdFailedByNodeMap[nodeName] ?? 0;
    const mdActivity = mdActivityByNodeMap[nodeName] ?? 0;
    const mdActive = mdActiveByNodeMap[nodeName] ?? 0;
    const hasMd1 = (md1ActiveByNodeMap[nodeName] ?? 0) > 0;
    const smartHealthyMax = smartHealthyMaxByNodeMap[nodeName];
    const smartHealthyMin = smartHealthyMinByNodeMap[nodeName];
    const smartFailed = smartFailedByNodeMap[nodeName];
    const smartHealthyPresent = Number.isFinite(smartHealthyMax) || Number.isFinite(smartHealthyMin);
    const smartFailedPresent = Number.isFinite(smartFailed);
    const smartMetricsPresent = smartHealthyPresent || smartFailedPresent;

    const latestTs = Math.max(
      upTs,
      mdFailedTsByNodeMap[nodeName] ?? 0,
      mdActivityTsByNodeMap[nodeName] ?? 0,
      mdActiveTsByNodeMap[nodeName] ?? 0,
      smartHealthyTsByNodeMap[nodeName] ?? 0,
      smartFailedTsByNodeMap[nodeName] ?? 0,
    );
    const stale = latestTs <= 0 || nowUnix - latestTs > STALE_SECONDS;

    const unknownByReachability = upValue < 1 || stale;
    let raidStatus: RaidComponentStatus = 'unknown';
    let disksStatus: RaidComponentStatus = 'unknown';

    if (!unknownByReachability) {
      if (mdFailed > 0) {
        raidStatus = 'degraded';
      } else if (mdActivity >= 1) {
        raidStatus = 'maintenance';
      } else if (mdActive >= 1) {
        raidStatus = 'operational';
      }

      if (!smartMetricsPresent) {
        disksStatus = 'unknown';
      } else if ((smartHealthyPresent && (smartHealthyMin ?? 1) < 1) || (smartFailedPresent && (smartFailed ?? 0) >= 1)) {
        disksStatus = 'degraded';
      } else {
        disksStatus = 'operational';
      }
    }

    const unhealthySmartDisks = Array.from(
      new Set([...(smartUnhealthyDisksByNode[nodeName] ?? []), ...(smartFailedDisksByNode[nodeName] ?? [])]),
    );
    const lastSeenAt = toIsoOrNull(latestTs);
    const md1Warning = hasMd1 ? '' : ' · Warning: EFI no espejado (md1)';

    components.push({
      id: `raid-${nodeName}`,
      name: `${nodeName} RAID`,
      nodeName,
      kind: 'raid',
      status: raidStatus,
      detail:
        raidStatus === 'unknown'
          ? 'Sin métricas recientes de RAID'
          : raidStatus === 'degraded'
            ? `Array degradado${md1Warning}`
            : raidStatus === 'maintenance'
              ? `Rebuild/sync en progreso${md1Warning}`
              : `RAID activo y sin discos failed${md1Warning}`,
      lastSeenAt,
    });

    components.push({
      id: `disks-${nodeName}`,
      name: `${nodeName} Disks`,
      nodeName,
      kind: 'disks',
      status: disksStatus,
      detail:
        disksStatus === 'unknown'
          ? smartMetricsPresent
            ? 'Sin métricas recientes de SMART'
            : 'SMART no configurado (faltan node_smartmon_device_smart_healthy y smart_failed)'
          : disksStatus === 'degraded'
            ? `SMART unhealthy en: ${unhealthySmartDisks.join(', ') || 'disco no identificado'}`
            : 'SMART OK',
      lastSeenAt,
    });

    if (mdFailed > 0) {
      incidents.push({
        id: `raid-degraded-${nodeName}`,
        nodeName,
        severity: 'critical',
        title: `Disk failure, array degraded (${nodeName})`,
        detail: `node_md_disks{state="failed"}=${mdFailed}`,
        startedAt: lastSeenAt ?? new Date(nowUnix * 1000).toISOString(),
      });
    }

    if (smartMetricsPresent && ((smartHealthyPresent && (smartHealthyMin ?? 1) < 1) || (smartFailedPresent && (smartFailed ?? 0) >= 1))) {
      incidents.push({
        id: `smart-failed-${nodeName}`,
        nodeName,
        severity: 'critical',
        title: `S.M.A.R.T. failure detected (${nodeName})`,
        detail:
          unhealthySmartDisks.length > 0
            ? `node_smartmon_device_smart_healthy=0 (${unhealthySmartDisks.join(', ')})`
            : 'SMART unhealthy detectado',
        startedAt: lastSeenAt ?? new Date(nowUnix * 1000).toISOString(),
      });
    }

    if (mdActivity >= 1 && mdFailed <= 0) {
      incidents.push({
        id: `raid-syncing-${nodeName}`,
        nodeName,
        severity: 'warning',
        title: `RAID rebuild in progress (${nodeName})`,
        detail: 'node_md_state{state=~"resync|recovering|check"}=1',
        startedAt: lastSeenAt ?? new Date(nowUnix * 1000).toISOString(),
      });
    }
  }

  return {
    components: components.sort((a, b) => {
      const nodeCmp = compareNodeName(a.nodeName, b.nodeName);
      if (nodeCmp !== 0) return nodeCmp;
      if (a.kind !== b.kind) return a.kind === 'raid' ? -1 : 1;
      return a.name.localeCompare(b.name);
    }),
    incidents: incidents.sort((a, b) => {
      const rank = (severity: RaidIncidentEntry['severity']) => (severity === 'critical' ? 0 : 1);
      return rank(a.severity) - rank(b.severity);
    }),
  };
};

import type { MetricsData } from '@/features/metrics/model/contracts';
import type { MetricsQueryResults } from '@/features/metrics/server/metrics-queries';
import { buildContainersAndSummary } from '@/features/metrics/server/payload/build-containers-summary';
import { buildNodes } from '@/features/metrics/server/payload/build-nodes';
import { buildRaidStatus } from '@/features/metrics/server/payload/build-raid-status';

export const buildMetricsPayload = ({
  results,
  panelBase,
  requestedAt,
  atUnixSeconds,
}: {
  results: MetricsQueryResults;
  panelBase: string;
  requestedAt: string | null;
  atUnixSeconds?: number;
}): MetricsData => {
  const { nodeMap, nodeEntries, resolveNodeName } = buildNodes(results);
  const raidStatus = buildRaidStatus({
    results,
    nodeEntries,
    resolveNodeName,
    atUnixSeconds,
  });
  const { containers, summary } = buildContainersAndSummary({
    results,
    nodeMap,
    nodeEntries,
    panelBase,
  });

  return {
    generatedAt: new Date().toISOString(),
    requestedAt,
    nodes: nodeEntries,
    summary,
    containers,
    raidStatus,
  };
};

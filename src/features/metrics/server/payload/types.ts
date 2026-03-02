import type { NodeEntry } from '@/features/metrics/model/contracts';
import type { PromMetric } from '@/features/metrics/server/prometheus';

export type NodeRuntimeEntry = NodeEntry & {
  nodeExporterInstance: string;
  cadvisorInstance: string;
};

export type BuildNodesResult = {
  nodeMap: Map<string, NodeRuntimeEntry>;
  nodeEntries: NodeRuntimeEntry[];
  resolveNodeName: (metric: PromMetric) => string;
};

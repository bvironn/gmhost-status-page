import type { APIRoute } from 'astro';

type PromMetric = Record<string, string>;
type PromResult = { metric: PromMetric; value: [number, string] };
type PromResponse = { status: string; data?: { resultType: string; result: PromResult[] }; error?: string };

type ComponentStatus = 'operational' | 'degraded' | 'maintenance' | 'unknown';

type NodeEntry = {
  nodeName: string;
  up: boolean;
  stale: boolean;
  lastSeenAt: string | null;
};

type ComponentEntry = {
  id: string;
  name: string;
  group: 'node' | 'raid' | 'disks';
  nodeName: string;
  status: ComponentStatus;
  detail: string;
  lastSeenAt: string | null;
};

type IncidentEntry = {
  id: string;
  title: string;
  severity: 'critical' | 'warning';
  status: 'open';
  nodeName: string;
  componentId: string;
  startedAt: string;
  detail: string;
};

type MetricsPayload = {
  generatedAt: string;
  requestedAt: string | null;
  summary: {
    total: number;
    operational: number;
    degraded: number;
    maintenance: number;
    unknown: number;
  };
  nodes: NodeEntry[];
  components: ComponentEntry[];
  incidents: IncidentEntry[];
};

type NodeAccumulator = {
  nodeName: string;
  up: number | null;
  raidDegraded: number | null;
  raidSyncing: number | null;
  raidArraysOk: number | null;
  smartFailed: number | null;
  smartFailedDisks: string[];
  hasMd1: boolean;
  lastSeenUnix: number | null;
};

const PROMETHEUS_URL = (import.meta.env.PROMETHEUS_URL as string | undefined)?.trim();
const STALE_SECONDS = 300;

const parseValue = (result?: PromResult): number => {
  if (!result) return 0;
  const raw = result.value?.[1];
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
};

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

const normalizeNodeName = (metric: PromMetric): string => {
  if (metric.node) return metric.node;
  if (metric.nodename) return metric.nodename;
  if (metric.instance) return metric.instance.split(':')[0] ?? metric.instance;
  return 'unknown';
};

const ensureNode = (map: Map<string, NodeAccumulator>, nodeName: string): NodeAccumulator => {
  const existing = map.get(nodeName);
  if (existing) return existing;

  const fresh: NodeAccumulator = {
    nodeName,
    up: null,
    raidDegraded: null,
    raidSyncing: null,
    raidArraysOk: null,
    smartFailed: null,
    smartFailedDisks: [],
    hasMd1: false,
    lastSeenUnix: null,
  };

  map.set(nodeName, fresh);
  return fresh;
};

const setMetricFlag = (current: number | null, next: number): number => {
  const normalized = next >= 1 ? 1 : 0;
  if (current === null) return normalized;
  return Math.max(current, normalized);
};

const setLastSeen = (acc: NodeAccumulator, ts: number) => {
  if (!Number.isFinite(ts) || ts <= 0) return;
  if (acc.lastSeenUnix === null || ts > acc.lastSeenUnix) {
    acc.lastSeenUnix = ts;
  }
};

const statusForNode = (acc: NodeAccumulator, stale: boolean): ComponentStatus => {
  if (acc.up !== 1 || stale) return 'unknown';
  return 'operational';
};

const statusForRaid = (acc: NodeAccumulator, stale: boolean): ComponentStatus => {
  if (acc.up !== 1 || stale || acc.raidDegraded === null || acc.raidSyncing === null) return 'unknown';
  if (acc.raidDegraded === 1) return 'degraded';
  if (acc.raidSyncing === 1) return 'maintenance';
  return 'operational';
};

const statusForDisks = (acc: NodeAccumulator, stale: boolean): ComponentStatus => {
  if (acc.up !== 1 || stale || acc.smartFailed === null || acc.raidSyncing === null) return 'unknown';
  if (acc.smartFailed === 1) return 'degraded';
  if (acc.raidSyncing === 1) return 'maintenance';
  return 'operational';
};

const asIso = (unixSeconds: number | null): string | null => {
  if (unixSeconds === null) return null;
  return new Date(unixSeconds * 1000).toISOString();
};

export const GET: APIRoute = async ({ request }) => {
  try {
    if (!PROMETHEUS_URL) {
      throw new Error('Falta configurar PROMETHEUS_URL en el entorno');
    }

    const requestUrl = new URL(request.url);
    const { atUnixSeconds, requestedAt } = parseRequestedAt(requestUrl.searchParams.get('at'));

    const [
      upResults,
      upTsResults,
      raidDegradedResults,
      raidDegradedTsResults,
      raidSyncingResults,
      raidSyncingTsResults,
      raidArraysOkResults,
      raidArraysOkTsResults,
      smartFailedResults,
      smartFailedTsResults,
      md1Results,
    ] = await Promise.all([
      runQuery('up{job="node_exporter"}', atUnixSeconds),
      runQuery('timestamp(up{job="node_exporter"})', atUnixSeconds),
      runQuery('raid_degraded', atUnixSeconds),
      runQuery('timestamp(raid_degraded)', atUnixSeconds),
      runQuery('raid_syncing', atUnixSeconds),
      runQuery('timestamp(raid_syncing)', atUnixSeconds),
      runQuery('raid_arrays_ok', atUnixSeconds),
      runQuery('timestamp(raid_arrays_ok)', atUnixSeconds),
      runQuery('smart_failed', atUnixSeconds),
      runQuery('timestamp(smart_failed)', atUnixSeconds),
      runQuery('node_md_disks{job="node_exporter",md_device="md1"}', atUnixSeconds),
    ]);

    const nodes = new Map<string, NodeAccumulator>();

    for (const item of upResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      acc.up = setMetricFlag(acc.up, parseValue(item));
    }

    for (const item of raidDegradedResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      acc.raidDegraded = setMetricFlag(acc.raidDegraded, parseValue(item));
    }

    for (const item of raidSyncingResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      acc.raidSyncing = setMetricFlag(acc.raidSyncing, parseValue(item));
    }

    for (const item of raidArraysOkResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      acc.raidArraysOk = setMetricFlag(acc.raidArraysOk, parseValue(item));
    }

    for (const item of smartFailedResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      const value = parseValue(item);
      acc.smartFailed = setMetricFlag(acc.smartFailed, value);
      if (value >= 1 && item.metric.disk) {
        acc.smartFailedDisks.push(item.metric.disk);
      }
    }

    for (const item of md1Results) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      if (parseValue(item) >= 1) {
        acc.hasMd1 = true;
      }
    }

    for (const item of upTsResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      setLastSeen(acc, parseValue(item));
    }

    for (const item of raidDegradedTsResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      setLastSeen(acc, parseValue(item));
    }

    for (const item of raidSyncingTsResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      setLastSeen(acc, parseValue(item));
    }

    for (const item of raidArraysOkTsResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      setLastSeen(acc, parseValue(item));
    }

    for (const item of smartFailedTsResults) {
      const nodeName = normalizeNodeName(item.metric);
      const acc = ensureNode(nodes, nodeName);
      setLastSeen(acc, parseValue(item));
    }

    const nowUnix = atUnixSeconds ?? Math.floor(Date.now() / 1000);
    const nodeEntries: NodeEntry[] = [];
    const components: ComponentEntry[] = [];
    const incidents: IncidentEntry[] = [];

    for (const acc of Array.from(nodes.values()).sort((a, b) => a.nodeName.localeCompare(b.nodeName))) {
      const stale = requestedAt
        ? false
        : acc.lastSeenUnix === null || nowUnix - acc.lastSeenUnix > STALE_SECONDS;
      const lastSeenAt = asIso(acc.lastSeenUnix);

      nodeEntries.push({
        nodeName: acc.nodeName,
        up: acc.up === 1,
        stale,
        lastSeenAt,
      });

      const nodeStatus = statusForNode(acc, stale);
      const raidStatus = statusForRaid(acc, stale);
      const disksStatus = statusForDisks(acc, stale);

      const nodeComponentId = `node-${acc.nodeName}`;
      const raidComponentId = `raid-${acc.nodeName}`;
      const disksComponentId = `disks-${acc.nodeName}`;

      components.push({
        id: nodeComponentId,
        name: `Nodo ${acc.nodeName}`,
        group: 'node',
        nodeName: acc.nodeName,
        status: nodeStatus,
        detail:
          nodeStatus === 'unknown'
            ? stale
              ? 'Sin métricas recientes o node_exporter no disponible'
              : 'Node exporter no reporta up=1'
            : 'Node exporter reportando correctamente',
        lastSeenAt,
      });

      const missingMd1Warning = acc.hasMd1 ? '' : ' · Warning: EFI (md1) no espejado';
      components.push({
        id: raidComponentId,
        name: `RAID ${acc.nodeName}`,
        group: 'raid',
        nodeName: acc.nodeName,
        status: raidStatus,
        detail:
          raidStatus === 'degraded'
            ? `Array degradado${missingMd1Warning}`
            : raidStatus === 'maintenance'
              ? `Rebuild/sync en progreso${missingMd1Warning}`
              : raidStatus === 'unknown'
                ? 'Sin datos recientes de RAID'
                : `Arrays OK${missingMd1Warning}`,
        lastSeenAt,
      });

      const failedDisks = Array.from(new Set(acc.smartFailedDisks));
      components.push({
        id: disksComponentId,
        name: `Disks ${acc.nodeName}`,
        group: 'disks',
        nodeName: acc.nodeName,
        status: disksStatus,
        detail:
          disksStatus === 'degraded'
            ? `SMART failed en: ${failedDisks.join(', ') || 'disco no identificado'}`
            : disksStatus === 'maintenance'
              ? 'Rendimiento degradado por rebuild/sync'
              : disksStatus === 'unknown'
                ? 'Sin datos recientes de SMART'
                : 'SMART OK',
        lastSeenAt,
      });

      if (acc.raidDegraded === 1) {
        incidents.push({
          id: `inc-raid-degraded-${acc.nodeName}`,
          title: `Disk failure, array degraded (${acc.nodeName})`,
          severity: 'critical',
          status: 'open',
          nodeName: acc.nodeName,
          componentId: raidComponentId,
          startedAt: lastSeenAt ?? new Date(nowUnix * 1000).toISOString(),
          detail: 'raid_degraded=1',
        });
      }

      if (acc.smartFailed === 1) {
        incidents.push({
          id: `inc-smart-failed-${acc.nodeName}`,
          title: `S.M.A.R.T. failure detected (${acc.nodeName})`,
          severity: 'critical',
          status: 'open',
          nodeName: acc.nodeName,
          componentId: disksComponentId,
          startedAt: lastSeenAt ?? new Date(nowUnix * 1000).toISOString(),
          detail: failedDisks.length > 0 ? `smart_failed=1 (${failedDisks.join(', ')})` : 'smart_failed=1',
        });
      }

      if (acc.raidSyncing === 1 && acc.raidDegraded !== 1) {
        incidents.push({
          id: `inc-raid-syncing-${acc.nodeName}`,
          title: `RAID rebuild in progress (${acc.nodeName})`,
          severity: 'warning',
          status: 'open',
          nodeName: acc.nodeName,
          componentId: raidComponentId,
          startedAt: lastSeenAt ?? new Date(nowUnix * 1000).toISOString(),
          detail: 'raid_syncing=1',
        });
      }
    }

    const summary = components.reduce(
      (acc, component) => {
        acc.total += 1;
        acc[component.status] += 1;
        return acc;
      },
      { total: 0, operational: 0, degraded: 0, maintenance: 0, unknown: 0 },
    );

    const payload: MetricsPayload = {
      generatedAt: new Date().toISOString(),
      requestedAt,
      summary,
      nodes: nodeEntries,
      components,
      incidents: incidents.sort((a, b) => {
        const severityRank = (severity: IncidentEntry['severity']) => (severity === 'critical' ? 0 : 1);
        return severityRank(a.severity) - severityRank(b.severity);
      }),
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

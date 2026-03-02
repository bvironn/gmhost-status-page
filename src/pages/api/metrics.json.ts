import type { APIRoute } from 'astro';
<<<<<<< HEAD
import type {
  NodeMetrics as NodeEntry,
  ContainerMetrics as ContainerEntry,
  MetricsPayload,
  ResourceStatus as RaidComponentStatus,
  RaidComponent as RaidComponentEntry,
  RaidIncident as RaidIncidentEntry
} from '../../lib/types/metrics';

type PromMetric = Record<string, string>;
type PromResult = { metric: PromMetric; value: [number, string] };
type PromResponse = { status: string; data?: { resultType: string; result: PromResult[] }; error?: string };

=======
import { parseRequestedAt } from '@/features/metrics/model/snapshot';
import { fetchMetricsQueryResults } from '@/features/metrics/server/metrics-queries';
import { buildMetricsPayload } from '@/features/metrics/server/metrics-payload';
import { createPrometheusQueryRunner } from '@/features/metrics/server/prometheus';
>>>>>>> 51c4ec8 (refactor(metrics): modularize domain, slim API route, and add payload tests)

const PROMETHEUS_URL = (import.meta.env.PROMETHEUS_URL as string | undefined)?.trim();
const PANEL_BASE = (import.meta.env.PTERODACTYL_PANEL_URL as string | undefined)?.trim()?.replace(/\/$/, '');

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

    const runQuery = createPrometheusQueryRunner(PROMETHEUS_URL);
    const results = await fetchMetricsQueryResults(runQuery, atUnixSeconds);
    const payload = buildMetricsPayload({
      results,
      panelBase: PANEL_BASE,
      requestedAt,
      atUnixSeconds,
    });

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

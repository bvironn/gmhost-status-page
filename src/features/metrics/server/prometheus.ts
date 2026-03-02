export type PromMetric = Record<string, string>;
export type PromResult = { metric: PromMetric; value: [number, string] };
type PromResponse = { status: string; data?: { resultType: string; result: PromResult[] }; error?: string };

export const parseValue = (result?: PromResult): number => {
  if (!result) return 0;
  const raw = result.value?.[1];
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
};

export const toNumberMap = (results: PromResult[], keyOf: (r: PromResult) => string): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const item of results) {
    map[keyOf(item)] = parseValue(item);
  }
  return map;
};

export const createPrometheusQueryRunner = (baseUrl: string) => {
  return async (query: string, atUnixSeconds?: number): Promise<PromResult[]> => {
    const url = new URL('/api/v1/query', baseUrl);
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
};

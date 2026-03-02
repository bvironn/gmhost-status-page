import { ArrowPathIcon, ExclamationTriangleIcon, ServerIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';
import { CalendarIcon } from 'lucide-react';
import { useMemo } from 'react';
import { Button as UiButton } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { type ComponentEntry, type ComponentStatus, useMetricsDashboard } from './metrics-dashboard.logic';

const statusBadgeClass: Record<ComponentStatus, string> = {
  operational: 'border-emerald-300/70 bg-emerald-100 text-emerald-700 dark:border-emerald-300/25 dark:bg-emerald-400/10 dark:text-emerald-300',
  degraded: 'border-red-300/70 bg-red-100 text-red-700 dark:border-red-300/25 dark:bg-red-400/10 dark:text-red-300',
  maintenance: 'border-amber-300/70 bg-amber-100 text-amber-700 dark:border-amber-300/25 dark:bg-amber-400/10 dark:text-amber-300',
  unknown: 'border-slate-300/70 bg-slate-100 text-slate-700 dark:border-slate-300/25 dark:bg-slate-400/10 dark:text-slate-300',
};

const statusLabel: Record<ComponentStatus, string> = {
  operational: 'Operational',
  degraded: 'Degraded',
  maintenance: 'Maintenance',
  unknown: 'Unknown',
};

const StatusPill = ({ status }: { status: ComponentStatus }) => (
  <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${statusBadgeClass[status]}`}>
    {statusLabel[status]}
  </span>
);

const ComponentCard = ({ component }: { component: ComponentEntry }) => (
  <article className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm backdrop-blur-xl">
    <div className="mb-2 flex items-center justify-between gap-3">
      <h3 className="text-base font-semibold text-foreground">{component.name}</h3>
      <StatusPill status={component.status} />
    </div>
    <p className="text-sm text-muted-foreground">{component.detail}</p>
    <p className="mt-2 text-xs text-muted-foreground/80">
      Última señal: {component.lastSeenAt ? new Date(component.lastSeenAt).toLocaleString() : 'Sin datos'}
    </p>
  </article>
);

const SummaryCard = ({ label, value }: { label: string; value: number }) => (
  <article className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm backdrop-blur-xl">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
  </article>
);

export default function MetricsDashboard() {
  const {
    data,
    error,
    loading,
    refreshing,
    snapshotInput,
    setSnapshotInput,
    loadData,
    applySnapshot,
    clearSnapshot,
    hasSnapshot,
    componentsByGroup,
  } = useMetricsDashboard();

  const snapshotDate = useMemo(() => {
    const match = snapshotInput.trim().match(/^(\d{2})(\d{2})(\d{4})[\sT]?(\d{2})(\d{2})(\d{2})$/);
    if (!match) return undefined;
    const [, dd, mm, yyyy, HH, MM, SS] = match;
    const parsed = new Date(Number(yyyy), Number(mm) - 1, Number(dd), Number(HH), Number(MM), Number(SS));
    if (
      parsed.getFullYear() !== Number(yyyy) ||
      parsed.getMonth() !== Number(mm) - 1 ||
      parsed.getDate() !== Number(dd) ||
      parsed.getHours() !== Number(HH) ||
      parsed.getMinutes() !== Number(MM) ||
      parsed.getSeconds() !== Number(SS)
    ) {
      return undefined;
    }
    return parsed;
  }, [snapshotInput]);

  const formatSnapshot = (date: Date) => {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const HH = String(date.getHours()).padStart(2, '0');
    const MM = String(date.getMinutes()).padStart(2, '0');
    const SS = String(date.getSeconds()).padStart(2, '0');
    return `${dd}${mm}${yyyy} ${HH}${MM}${SS}`;
  };

  const setSnapshotDate = (date?: Date) => {
    if (!date) return;
    const base = snapshotDate ?? new Date();
    const merged = new Date(date);
    merged.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0);
    setSnapshotInput(formatSnapshot(merged));
  };

  const setSnapshotTimeField = (field: 'hours' | 'minutes' | 'seconds', value: string) => {
    const base = snapshotDate ?? new Date();
    const parsed = Number(value);
    const clamped = Math.min(Math.max(Number.isFinite(parsed) ? parsed : 0, 0), field === 'hours' ? 23 : 59);
    const next = new Date(base);
    if (field === 'hours') next.setHours(clamped);
    if (field === 'minutes') next.setMinutes(clamped);
    if (field === 'seconds') next.setSeconds(clamped);
    setSnapshotInput(formatSnapshot(next));
  };

  return (
    <main className="relative mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <i className="fa-solid fa-cloud text-[10px] text-muted-foreground/80" aria-hidden="true" />
            GeoMakes Hosting
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Cluster Status</h1>
          {data && (
            <p className="mt-1 text-sm text-muted-foreground">
              {data.requestedAt
                ? `Vista histórica (${data.requestedAt} UTC) - consultado: ${new Date(data.generatedAt).toLocaleString()}`
                : `Última actualización: ${new Date(data.generatedAt).toLocaleString()}`}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {hasSnapshot && (
            <button
              type="button"
              onClick={() => void clearSnapshot()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90"
            >
              Ahora
            </button>
          )}
          <button
            type="button"
            onClick={() => void loadData(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-background/50 px-4 py-2 text-sm text-foreground transition hover:bg-accent"
          >
            <ArrowPathIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudieron cargar las métricas: {error}
        </div>
      )}

      {!data && loading && (
        <div className="rounded-2xl border border-border/70 bg-background/50 p-6 text-muted-foreground">Cargando estado...</div>
      )}

      {data && (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <SummaryCard label="Operational" value={data.summary.operational} />
            <SummaryCard label="Degraded" value={data.summary.degraded} />
            <SummaryCard label="Maintenance" value={data.summary.maintenance} />
            <SummaryCard label="Unknown" value={data.summary.unknown} />
            <SummaryCard label="Total Components" value={data.summary.total} />
          </section>

          <section className="mb-8 grid gap-4 rounded-2xl border border-border/70 bg-background/40 p-4 backdrop-blur-xl md:grid-cols-[1fr_auto_auto]">
            <p className="text-sm text-muted-foreground">
              Snapshot histórico opcional en formato <span className="font-mono">DDMMYYYY HHMMSS</span>
            </p>

            <Popover>
              <PopoverTrigger asChild>
                <UiButton variant="outline" className="h-10 w-full justify-start border-border/70 bg-background/60 text-foreground hover:bg-accent md:w-[320px]">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="truncate">{snapshotDate ? snapshotDate.toLocaleString() : 'Elegir fecha y hora'}</span>
                </UiButton>
              </PopoverTrigger>
              <PopoverContent className="w-[360px] rounded-xl border border-border/70 bg-popover/95 p-4 backdrop-blur-xl" align="end">
                <div className="rounded-xl border border-border/70 bg-background/50 p-2">
                  <Calendar
                    className="rounded-lg bg-transparent text-foreground [--cell-size:2.2rem]"
                    mode="single"
                    defaultMonth={snapshotDate}
                    selected={snapshotDate}
                    onSelect={setSnapshotDate}
                    fixedWeeks
                    showOutsideDays
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <label className="text-xs text-muted-foreground">
                    HH
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={snapshotDate ? String(snapshotDate.getHours()).padStart(2, '0') : '00'}
                      onChange={(event) => setSnapshotTimeField('hours', event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-border/70 bg-background/60 px-2 text-center text-sm text-foreground tabular-nums outline-none focus:border-ring"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    MM
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={snapshotDate ? String(snapshotDate.getMinutes()).padStart(2, '0') : '00'}
                      onChange={(event) => setSnapshotTimeField('minutes', event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-border/70 bg-background/60 px-2 text-center text-sm text-foreground tabular-nums outline-none focus:border-ring"
                    />
                  </label>
                  <label className="text-xs text-muted-foreground">
                    SS
                    <input
                      type="number"
                      min={0}
                      max={59}
                      value={snapshotDate ? String(snapshotDate.getSeconds()).padStart(2, '0') : '00'}
                      onChange={(event) => setSnapshotTimeField('seconds', event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg border border-border/70 bg-background/60 px-2 text-center text-sm text-foreground tabular-nums outline-none focus:border-ring"
                    />
                  </label>
                </div>
              </PopoverContent>
            </Popover>

            <button
              type="button"
              onClick={() => void applySnapshot()}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-border/70 bg-background/60 px-4 text-sm text-foreground transition hover:bg-accent"
            >
              Aplicar snapshot
            </button>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-medium text-foreground">
              <ServerIcon className="h-5 w-5 text-muted-foreground" />
              Componentes
            </h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {componentsByGroup.node.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
              {componentsByGroup.raid.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
              {componentsByGroup.disks.map((component) => (
                <ComponentCard key={component.id} component={component} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-medium text-foreground">
              <WrenchScrewdriverIcon className="h-5 w-5 text-muted-foreground" />
              Incidentes automáticos
            </h2>
            {data.incidents.length === 0 ? (
              <div className="rounded-2xl border border-emerald-300/40 bg-emerald-100/40 p-4 text-sm text-emerald-700 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                No hay incidentes activos.
              </div>
            ) : (
              <div className="space-y-3">
                {data.incidents.map((incident) => (
                  <article key={incident.id} className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm backdrop-blur-xl">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-medium ${incident.severity === 'critical'
                            ? 'border-red-300/70 bg-red-100 text-red-700 dark:border-red-300/25 dark:bg-red-400/10 dark:text-red-300'
                            : 'border-amber-300/70 bg-amber-100 text-amber-700 dark:border-amber-300/25 dark:bg-amber-400/10 dark:text-amber-300'
                          }`}
                      >
                        {incident.severity.toUpperCase()}
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm text-foreground">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        {incident.title}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.detail}</p>
                    <p className="mt-2 text-xs text-muted-foreground/80">
                      Nodo: {incident.nodeName} · Estado: {incident.status} · Inicio: {new Date(incident.startedAt).toLocaleString()}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

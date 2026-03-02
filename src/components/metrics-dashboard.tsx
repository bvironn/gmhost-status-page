import { useMemo, type ReactNode } from 'react';
import {
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  CircleStackIcon,
  CpuChipIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ServerIcon,
  ServerStackIcon,
} from '@heroicons/react/24/outline';
import { CalendarIcon } from 'lucide-react';
import {
  type ContainerSort,
  formatBytes,
  formatNumber,
  formatPercent,
  formatRate,
  useMetricsDashboard,
} from './metrics-dashboard.logic';
import { Button as UiButton } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Progress = ({ value }: { value: number }) => {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-border/70">
      <div
        className="h-full rounded-full bg-gradient-to-r from-primary/70 to-primary transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
};

const StatCard = ({
  icon,
  label,
  main,
  detail,
}: {
  icon: ReactNode;
  label: string;
  main: string;
  detail: string;
}) => (
  <article className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm backdrop-blur-xl">
    <div className="mb-4 flex items-center justify-between text-muted-foreground">
      <span className="text-sm">{label}</span>
      <span>{icon}</span>
    </div>
    <p className="text-2xl font-semibold text-foreground">{main}</p>
    <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
  </article>
);

const raidStatusBadgeClass = (status: 'operational' | 'degraded' | 'maintenance' | 'unknown') => {
  if (status === 'operational') return 'border-emerald-300/70 bg-emerald-100 text-emerald-700 dark:border-emerald-300/25 dark:bg-emerald-400/10 dark:text-emerald-300';
  if (status === 'degraded') return 'border-red-300/70 bg-red-100 text-red-700 dark:border-red-300/25 dark:bg-red-400/10 dark:text-red-300';
  if (status === 'maintenance') return 'border-amber-300/70 bg-amber-100 text-amber-700 dark:border-amber-300/25 dark:bg-amber-400/10 dark:text-amber-300';
  return 'border-slate-300/70 bg-slate-100 text-slate-700 dark:border-slate-300/25 dark:bg-slate-400/10 dark:text-slate-300';
};

const raidStatusLabel = (status: 'operational' | 'degraded' | 'maintenance' | 'unknown') => {
  if (status === 'operational') return 'Operational';
  if (status === 'degraded') return 'Degraded';
  if (status === 'maintenance') return 'Maintenance';
  return 'Unknown';
};

export default function MetricsDashboard() {
  const {
    data,
    error,
    loading,
    refreshing,
    searchTerm,
    selectedNode,
    sortBy,
    snapshotInput,
    nodeOptions,
    filteredContainers,
    setSearchTerm,
    setSelectedNode,
    setSortBy,
    setSnapshotInput,
    loadData,
    resetFilters,
    applySnapshot,
    clearSnapshot,
    hasSnapshot,
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

  if (loading && !data) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-muted-foreground">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-64 rounded-xl bg-muted/80" />
          <div className="h-40 rounded-2xl bg-muted/60" />
          <div className="h-64 rounded-2xl bg-muted/60" />
        </div>
      </div>
    );
  }

  return (
    <main className="relative mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
            <i className="fa-solid fa-cloud text-[10px] text-muted-foreground/80" aria-hidden="true" />
            GeoMakes Hosting
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 self-stretch sm:items-end sm:self-auto">
          {data && (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <i className="fa-regular fa-clock text-xs text-muted-foreground/80" aria-hidden="true" />
              {data.requestedAt
                ? `Vista histórica (${data.requestedAt} UTC) - consultado: ${new Date(data.generatedAt).toLocaleString()}`
                : `Última actualización: ${new Date(data.generatedAt).toLocaleString()}`}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {hasSnapshot && (
                <button
                  type="button"
                  onClick={() => void clearSnapshot()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 bg-primary px-4 py-2 text-sm text-primary-foreground transition hover:opacity-90"
                >
                  <i className="fa-solid fa-bolt text-xs" aria-hidden="true" />
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
        </div>
      </header>

      {error && (
        <div className="mb-6 rounded-2xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          No se pudieron cargar las métricas: {error}
        </div>
      )}

      {data && (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<ServerStackIcon className="h-4 w-4" />}
              label="Servidores activos"
              main={`${data.summary.totalContainers} servidores`}
              detail={`${data.summary.totalNodes} nodos reportando métricas`}
            />
            <StatCard
              icon={<CpuChipIcon className="h-4 w-4" />}
              label="CPU disponible"
              main={`${formatNumber(data.summary.cpuFreeCores)} cores`}
              detail={`${formatPercent(data.summary.cpuUsagePercent)} de uso total`}
            />
            <StatCard
              icon={<CircleStackIcon className="h-4 w-4" />}
              label="Memoria libre"
              main={formatBytes(data.summary.memoryFreeBytes)}
              detail={`${formatPercent(data.summary.memoryUsagePercent)} de uso`}
            />
            <StatCard
              icon={<CircleStackIcon className="h-4 w-4" />}
              label="Disco libre"
              main={formatBytes(data.summary.diskFreeBytes)}
              detail={`${formatPercent(data.summary.diskUsagePercent)} de uso`}
            />
          </section>

          <section className="mb-8">
            <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-medium text-foreground">
              <i className="fa-solid fa-hard-drive text-base text-muted-foreground" aria-hidden="true" />
              Estado RAID
            </h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {data.raidStatus.components.filter((component) => component.kind === 'raid').map((component) => (
                <article
                  key={component.id}
                  className="rounded-2xl border border-border/70 bg-background/50 p-4 shadow-sm backdrop-blur-xl"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-foreground">{component.name}</h3>
                    <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs ${raidStatusBadgeClass(component.status)}`}>
                      {raidStatusLabel(component.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{component.detail}</p>
                  <p className="mt-2 text-xs text-muted-foreground/85">
                    Última señal: {component.lastSeenAt ? new Date(component.lastSeenAt).toLocaleString() : 'Sin datos'}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium text-foreground">Incidentes automáticos</h3>
              {data.raidStatus.incidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin incidentes activos.</p>
              ) : (
                <div className="space-y-2">
                  {data.raidStatus.incidents.map((incident) => (
                    <article
                      key={incident.id}
                      className="rounded-xl border border-border/70 bg-background/50 px-3 py-2 text-sm text-foreground"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] ${incident.severity === 'critical'
                          ? 'border-red-300/70 bg-red-100 text-red-700 dark:border-red-300/25 dark:bg-red-400/10 dark:text-red-300'
                          : 'border-amber-300/70 bg-amber-100 text-amber-700 dark:border-amber-300/25 dark:bg-amber-400/10 dark:text-amber-300'
                          }`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span>{incident.title}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {incident.detail} · {new Date(incident.startedAt).toLocaleString()}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 inline-flex items-center gap-2 text-lg font-medium text-foreground">
              <i className="fa-solid fa-diagram-project text-base text-muted-foreground" aria-hidden="true" />
              <ServerStackIcon className="h-5 w-5 text-muted-foreground" />
              Nodos
            </h2>
            <div className="grid gap-4 lg:grid-cols-3">
              {data.nodes.map((node) => (
                <article
                  key={node.nodeName}
                  className="rounded-2xl border border-border/70 bg-background/50 p-5 shadow-sm backdrop-blur-xl"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="inline-flex items-center gap-2 text-xl font-semibold text-foreground">
                        <i className="fa-solid fa-server text-sm text-muted-foreground" aria-hidden="true" />
                        {node.nodeName}
                      </h3>
                      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <i className="fa-solid fa-network-wired text-[10px] text-muted-foreground/80" aria-hidden="true" />
                        {node.ip}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/70 bg-emerald-100 px-2.5 py-1 text-xs text-emerald-700 dark:border-emerald-300/25 dark:bg-emerald-400/10 dark:text-emerald-300">
                      <i className="fa-solid fa-cubes-stacked text-[10px]" aria-hidden="true" />
                      {node.containerCount} servidores
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <ServerIcon className="h-4 w-4 text-muted-foreground" />
                        Nodo (host)
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>CPU</span>
                            <span>{formatPercent(node.hostCpuUsagePercent)}</span>
                          </div>
                          <Progress value={node.hostCpuUsagePercent} />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Memoria</span>
                            <span>{formatPercent(node.hostMemoryUsagePercent)}</span>
                          </div>
                          <Progress value={node.hostMemoryUsagePercent} />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Disco</span>
                            <span>
                              {formatBytes(node.diskUsedBytes)} / {formatBytes(node.diskTotalBytes)}
                            </span>
                          </div>
                          <Progress value={node.diskUsagePercent} />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <CircleStackIcon className="h-4 w-4 text-muted-foreground" />
                        Contenedores
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>CPU</span>
                            <span>
                              {formatNumber(node.cpuUsedCores)} / {formatNumber(node.cpuTotalCores)} cores
                            </span>
                          </div>
                          <Progress value={node.cpuUsagePercent} />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Memoria</span>
                            <span>
                              {formatBytes(node.memoryUsedBytes)} / {formatBytes(node.memoryTotalBytes)}
                            </span>
                          </div>
                          <Progress value={node.memoryUsagePercent} />
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                            <span>Volúmenes</span>
                            <span>
                              {node.volumesUsedBytes !== null && node.volumesTotalBytes !== null
                                ? `${formatBytes(node.volumesUsedBytes)} / ${formatBytes(node.volumesTotalBytes)}`
                                : 'Sin datos'}
                            </span>
                          </div>
                          <Progress value={node.volumesUsagePercent ?? 0} />
                          <p className="mt-1 text-[11px] text-muted-foreground/90">
                            {node.volumesUsagePercent !== null
                              ? '/var/lib/pterodactyl/volumes'
                              : 'Falta métrica custom pterodactyl_volumes_bytes en este nodo'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="inline-flex items-center gap-2 text-lg font-medium text-foreground">
                <i className="fa-solid fa-boxes-stacked text-base text-muted-foreground" aria-hidden="true" />
                <CircleStackIcon className="h-5 w-5 text-muted-foreground" />
                Contenedores
              </h2>
              <span className="text-xs text-muted-foreground">
                Mostrando {filteredContainers.length} de {data.containers.length}
              </span>
            </div>

            <div className="mb-4 grid gap-3 rounded-2xl border border-border/70 bg-background/40 p-4 backdrop-blur-xl md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MagnifyingGlassIcon className="h-3.5 w-3.5" />
                  Buscar
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="ID o nodo"
                  className="h-10 rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground outline-none ring-0 placeholder:text-muted-foreground focus:border-ring"
                />
              </label>

              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <ServerStackIcon className="h-3.5 w-3.5" />
                  Nodo
                </span>
                <select
                  value={selectedNode}
                  onChange={(event) => setSelectedNode(event.target.value)}
                  className="h-10 rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-ring"
                >
                  {nodeOptions.map((node) => (
                    <option key={node} value={node}>
                      {node === 'all' ? 'Todos los nodos' : node}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <FunnelIcon className="h-3.5 w-3.5" />
                  Ordenar por
                </span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value as ContainerSort)}
                  className="h-10 rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground outline-none focus:border-ring"
                >
                  <option value="memory_desc">RAM (mayor a menor)</option>
                  <option value="memory_asc">RAM (menor a mayor)</option>
                  <option value="cpu_desc">CPU (mayor a menor)</option>
                  <option value="cpu_asc">CPU (menor a mayor)</option>
                  <option value="rx_desc">RX (mayor a menor)</option>
                  <option value="tx_desc">TX (mayor a menor)</option>
                </select>
              </label>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => void resetFilters()}
                  className="h-10 w-full rounded-lg border border-border/70 bg-background/60 px-3 text-sm text-foreground transition hover:bg-accent"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <ArrowPathIcon className="h-4 w-4" />
                    Limpiar filtros
                  </span>
                </button>
              </div>

              <div className="flex items-end">
                <Popover>
                  <PopoverTrigger asChild>
                    <UiButton
                      variant="outline"
                      className="h-10 w-full justify-start border-border/70 bg-background/60 text-foreground hover:bg-accent"
                    >
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
                    <p className="mt-2 text-xs text-muted-foreground/90">Formato: DDMMYYYY HHMMSS</p>
                  </PopoverContent>
                </Popover>
              </div>

            </div>

            <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/50 shadow-sm backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-background/70 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-fingerprint text-[10px] text-muted-foreground/80" aria-hidden="true" />
                          ID
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-server text-[10px] text-muted-foreground/80" aria-hidden="true" />
                          Nodo
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-microchip text-[10px] text-muted-foreground/80" aria-hidden="true" />
                          CPU
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-memory text-[10px] text-muted-foreground/80" aria-hidden="true" />
                          RAM
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-download text-[10px] text-muted-foreground/80" aria-hidden="true" />
                          RX
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-upload text-[10px] text-muted-foreground/80" aria-hidden="true" />
                          TX
                        </span>
                      </th>
                      <th className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <i className="fa-solid fa-arrow-up-right-from-square text-[10px] text-muted-foreground/80" aria-hidden="true" />
                          Panel
                        </span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContainers.map((container) => (
                      <tr key={`${container.nodeName}-${container.id}`} className="border-t border-border/60 text-foreground">
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{container.id}</td>
                        <td className="px-4 py-3">{container.nodeName}</td>
                        <td className="px-4 py-3">{formatPercent(container.cpuPercent)}</td>
                        <td className="px-4 py-3">{formatBytes(container.memoryBytes)}</td>
                        <td className="px-4 py-3">{formatRate(container.rxBytesPerSecond)}</td>
                        <td className="px-4 py-3">{formatRate(container.txBytesPerSecond)}</td>
                        <td className="px-4 py-3">
                          <a
                            href={container.panelUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-border/70 bg-background/60 px-3 py-1 text-xs text-foreground transition hover:bg-accent"
                          >
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                            Abrir
                          </a>
                        </td>
                      </tr>
                    ))}
                    {filteredContainers.length === 0 && (
                      <tr className="border-t border-border/60">
                        <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                          <i className="fa-solid fa-magnifying-glass-minus mr-2 text-muted-foreground/80" aria-hidden="true" />
                          No hay contenedores que coincidan con los filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

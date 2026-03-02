# Cluster Monitor Status Page

Status page en Astro + TypeScript para monitorear nodos, contenedores y estado RAID consumiendo métricas de Prometheus server-side.

## Stack

- Astro 5 (`output: server`) + adapter Vercel
- React islands dentro de Astro
- Tailwind CSS
- API routes en `src/pages/api`

## Estructura del proyecto

Fuente de verdad única en `src/` (Astro-first):

```text
src/
  assets/
  components/
  layouts/
  lib/
    types/
    webhooks/
  pages/
    api/
      metrics.json.ts
      webhooks/
  styles/
```

Notas:
- `public/` se usa solo para estáticos servidos directamente.
- No se usan carpetas duplicadas en raíz como `assets/`, `components/` o `app/`.

## Variables de entorno

Definir en `.env`:

- `PROMETHEUS_URL` (obligatoria), ejemplo: `http://prometheus:9090`
- `PTERODACTYL_PANEL_URL` (obligatoria para links de panel)

Puedes copiar `.env.example` como base.

## Scripts

El `package.json` expone:

- `dev`: `astro dev --host`
- `build`: `astro build`
- `preview`: `astro preview --host`

Con Bun:

```bash
bun install
bun run dev
bun run build
```

## API

### `GET /api/metrics.json`

Devuelve snapshot agregado de:
- salud de nodos
- uso CPU/RAM/disco
- estado RAID y alertas derivadas

Parámetros:
- `at` (opcional): timestamp histórico UTC en formato `DDMMYYYY HHMMSS`

Ejemplo:

```text
/api/metrics.json?at=01032026%20153000
```

### `POST /api/webhooks`

Endpoint base de scaffolding para futuras integraciones de webhooks.
Actualmente responde `202` con payload JSON simple.

Tipos y utilidades base:
- `src/lib/types/webhooks.ts`
- `src/lib/webhooks/index.ts`

## Métricas esperadas (RAID/SMART)

Desde cada nodo (vía `node_exporter` textfile collector):

- `raid_degraded{node="GM-1"} 0|1`
- `raid_syncing{node="GM-1"} 0|1`
- `raid_arrays_ok{node="GM-1"} 0|1`
- `smart_failed{node="GM-1",disk="nvme0n1"} 0|1`
- `smart_failed{node="GM-1",disk="nvme1n1"} 0|1`

Opcional:

- `node_md_disks{md_device="md1"}`

Lógica de estado:

- `Operational`: `raid_degraded=0` y `smart_failed=0`
- `Degraded`: `raid_degraded=1` o `smart_failed=1`
- `Maintenance`: `raid_syncing=1`
- `Unknown`: sin métricas recientes o `up{job="node_exporter"} != 1`

Incidentes automáticos:

- `raid_degraded=1` -> `CRITICAL`
- `smart_failed=1` -> `CRITICAL`
- `raid_syncing=1` -> `WARNING`

## Deploy

Pensado para Vercel con adapter oficial de Astro (`@astrojs/vercel`).
El runtime de funciones serverless en Vercel es Node.js 22.

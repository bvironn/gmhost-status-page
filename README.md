# Cluster Monitor Status Page

Status page en Astro + TypeScript para monitorear nodos, contenedores y estado RAID consumiendo métricas de Prometheus server-side.

## Stack

- Astro 5 (`output: server`) + adapter Vercel
- React islands dentro de Astro
- Tailwind CSS
- API routes en `src/pages/api`

## Estructura del proyecto

Organización actual por capas y dominio:

```text
src/
  features/
    metrics/
      hooks/
      model/
      server/       # queries de Prometheus + armado del payload
      ui/
  components/      # wrappers y componentes compartidos de app
  layouts/
  lib/
    types/
    webhooks/
  pages/
    api/
  playground/
    shadcn-studio/ # ejemplos/sandbox, no código productivo
  styles/
```

Notas:
- `features/metrics/model` centraliza contratos y utilidades de orden/fechas para frontend y API.
- `features/metrics/server` contiene primitivas de Prometheus y helpers server-side:
`metrics-queries.ts` para batch de consultas y `metrics-payload.ts` como orquestador.
- `features/metrics/server/payload` separa reglas por responsabilidad:
`build-nodes.ts`, `build-raid-status.ts`, `build-containers-summary.ts`.
- `src/pages/api/metrics.json.ts` queda como controlador delgado (parse request + orquestación).
- `public/` se usa solo para estáticos servidos directamente.

## Variables de entorno

Definir en `.env`:

- `PROMETHEUS_URL` (obligatoria), ejemplo: `http://prometheus:9090`
- `PTERODACTYL_PANEL_URL` (obligatoria para links de panel)
- `AUTH_PASSWORD` (obligatoria para iniciar sesión)
- `AUTH_SECRET` (obligatoria para firmar la cookie de sesión; usar un valor largo y aleatorio)

Puedes copiar `.env.example` como base.

## Seguridad / Login

- La ruta `/` y el endpoint `GET /api/metrics.json` están protegidos por sesión.
- El login vive en `/login` y valida contra `AUTH_PASSWORD`.
- La sesión usa una cookie `HttpOnly` firmada con `AUTH_SECRET` y expira en 12 horas.

## Scripts

El `package.json` expone:

- `dev`: `astro dev --host`
- `build`: `astro build`
- `preview`: `astro preview --host`
- `test`: `bun test`

Con Bun:

```bash
bun install
bun run dev
bun run build
bun run test
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

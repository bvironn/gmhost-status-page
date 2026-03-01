# Cluster Monitor Status Page

Panel de estado para monitorear nodos y contenedores (Pterodactyl) usando métricas de Prometheus.

## Estado del proyecto

El proyecto está funcional para producción a nivel de aplicación:

- Build de Astro en modo `server` completado correctamente.
- Endpoint API de métricas implementado (`/api/metrics.json`).
- Dashboard con filtros, ordenamiento, refresco automático y consulta histórica.
- Tema claro/oscuro persistente.

## Stack

- Astro 5 (`output: "server"`) + `@astrojs/vercel`
- React 19 (islas para UI interactiva)
- Tailwind CSS 4 + componentes UI
- Prometheus como fuente de datos

## Funcionalidades

- Resumen global de CPU, RAM y disco.
- Vista por nodo con uso de host y contenedores.
- Tabla de contenedores con búsqueda, filtro por nodo y ordenamiento.
- Enlaces directos al panel Pterodactyl por contenedor.
- Consulta histórica vía parámetro `at` en formato `DDMMYYYY HHMMSS`.
- Actualización automática cada 15 segundos (cuando no hay snapshot histórico activo).

## Variables de entorno

Configura estas variables antes de ejecutar en producción:

- `PROMETHEUS_URL`:
  URL base de Prometheus.
  Ejemplo: `http://prometheus:9090`

- `PTERODACTYL_PANEL_URL`:
  URL base del panel (sin slash final).
  Ejemplo: `https://panel.tu-dominio.com/server`

Son obligatorias para que el endpoint `/api/metrics.json` funcione.

## Desarrollo local

Requisitos:

- Node.js 20+
- Bun

Instalación:

```bash
bun install
```

Ejecutar en desarrollo:

```bash
bun run dev
```

## Build y ejecución en producción

Compilar:

```bash
bun run build
```

Desplegar en Vercel (adapter `@astrojs/vercel`) con `bun run build`.

Opcional (preview local):

```bash
bun run preview
```

## API

### `GET /api/metrics.json`

Retorna métricas agregadas por nodo y contenedor.

Parámetros:

- `at` (opcional): timestamp histórico en UTC con formato `DDMMYYYY HHMMSS`.

Ejemplo:

```text
/api/metrics.json?at=01032026%20153000
```

## Checklist de despliegue

- Copiar `.env.example` a `.env` y ajustar valores reales.
- Definir `PROMETHEUS_URL` y `PTERODACTYL_PANEL_URL` en el entorno.
- Ejecutar build en CI (`bun run build`).
- Confirmar variables de entorno también en Vercel Project Settings.

## Estructura principal

- `src/pages/index.astro`: entrada principal.
- `src/pages/api/metrics.json.ts`: integración con Prometheus y armado del payload.
- `src/components/metrics-dashboard.tsx`: UI del dashboard.
- `src/components/metrics-dashboard.logic.tsx`: estado, fetch, filtros y ordenamiento.
- `astro.config.mjs`: salida server + adapter de Vercel.

## Ejemplo de variables

Crea un archivo `.env` en la raíz del proyecto usando este ejemplo:

```env
PROMETHEUS_URL=http://prometheus:9090
PTERODACTYL_PANEL_URL=https://panel.tu-dominio.com/server
```

También puedes partir copiando `.env.example`:

```bash
cp .env.example .env
```

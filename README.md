# Cluster Monitor Status Page

Status page que consume Prometheus server-side y muestra estado de nodos, RAID y discos.

## Métricas esperadas en Prometheus

Desde cada nodo (vía `node_exporter` textfile collector):

- `raid_degraded{node="GM-1"} 0|1`
- `raid_syncing{node="GM-1"} 0|1`
- `raid_arrays_ok{node="GM-1"} 0|1`
- `smart_failed{node="GM-1",disk="nvme0n1"} 0|1`
- `smart_failed{node="GM-1",disk="nvme1n1"} 0|1`

Opcional para warning fino de boot mirror:

- `node_md_disks{md_device="md1"}`

## Lógica de estado

- `Operational`: `raid_degraded=0` y `smart_failed=0`
- `Degraded`: `raid_degraded=1` o `smart_failed=1`
- `Maintenance`: `raid_syncing=1`
- `Unknown`: sin métricas recientes o `up{job="node_exporter"} != 1`

## Incidentes automáticos (derivados)

- `raid_degraded=1` -> `CRITICAL` (`Disk failure, array degraded (GM-X)`)
- `smart_failed=1` -> `CRITICAL`
- `raid_syncing=1` -> `WARNING`

## Variables de entorno

- `PROMETHEUS_URL` (obligatoria), ejemplo: `http://prometheus:9090`

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## API

### `GET /api/metrics.json`

Parámetros:

- `at` (opcional): timestamp histórico UTC en formato `DDMMYYYY HHMMSS`

Ejemplo:

```text
/api/metrics.json?at=01032026%20153000
```

# BACKEND_AGENT OUTPUT V8
**Task:** Maintenance 

## 1. Kubernetes HPA
- **Config:** `targetCPUUtilizationPercentage: 70`.
- **Scale:** Min 2 pods, Max 20 pods.

## 2. Database Maintenance
- **Backups:** Daily snapshots to S3 Glacier.
- **Migrations:** Run on container startup via `npm run migrate`.

## 3. Monitoring
- **Stack:** Prometheus + Grafana.
- **Metrics:** Request latency, Error rate, DB connection pool.

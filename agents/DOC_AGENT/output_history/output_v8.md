# DOC_AGENT OUTPUT V8
**Task:** Maintenance Documentation

## 1. Disaster Recovery
- **RPO/RTO:** 1 hour / 4 hours.
- **Procedure:** Restore DB from S3, redeploy stack to failover region.

## 2. Scaling Guide
- **Vertical:** Upgrade DB instance size.
- **Horizontal:** Add stateless app nodes.

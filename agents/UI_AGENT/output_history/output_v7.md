# UI_AGENT OUTPUT V7
**Task:** Cloud Infrastructure UI

## 1. Cloud Dashboard (`/cloud`)
- **Overview:** Real-time metrics (CPU, Memory, Requests) from AWS CloudWatch/GCP Monitoring.
- **Deployment Status:** List of active deployments with status indicators (Building, Deploying, Live, Failed).
- **Environment Variables:** UI to manage secrets and env vars for deployed apps.

## 2. Infrastructure Visualizer
- **Topology Map:** Interactive graph showing connected resources (Load Balancer -> EC2/Container -> RDS -> Redis).
- **Cost Estimator:** Real-time cost projection based on active resources.

## 3. Deployment Wizard
- **Step 1:** Select Provider (AWS, GCP, Azure).
- **Step 2:** Configure Region & Instance Type.
- **Step 3:** Review & Deploy (Triggers Terraform).

**Component Structure:**
```jsx
<CloudDashboard>
  <MetricsPanel source="cloudwatch" />
  <DeploymentList />
</CloudDashboard>

<InfraVisualizer data={terraformState} />
```

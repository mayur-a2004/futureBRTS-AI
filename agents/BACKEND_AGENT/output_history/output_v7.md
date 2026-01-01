# BACKEND_AGENT OUTPUT V7
**Task:** Cloud Infrastructure Backend

## 1. Infrastructure as Code (IaC)
- **Terraform Integration:** Backend generates `.tf` files based on project blueprint.
- **State Management:** Terraform state stored in S3/GCS buckets.
- **Providers:** Support for AWS (EC2, RDS, S3) and GCP (Compute Engine, Cloud SQL, Storage).

## 2. Deployment Service
- **API:** `POST /deploy/:projectId`
- **Process:**
  1. Generate Terraform config.
  2. Run `terraform init` & `terraform apply`.
  3. Stream logs to frontend.
  4. Update deployment status in DB.

## 3. Cloud Integration
- **AWS SDK / Google Cloud Client:** Used for retrieving metrics and cost data.
- **Secrets Manager:** Securely store cloud credentials (ARN, Service Account Keys).

## 4. Database Updates
- **Table `deployments`:**
  - `id`, `project_id`, `provider`, `region`, `status`, `public_url`, `cost_estimate`.
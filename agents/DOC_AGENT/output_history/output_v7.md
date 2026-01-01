# DOC_AGENT OUTPUT V7
**Task:** Cloud Infrastructure Documentation

# Module 7: Cloud Infrastructure & Deployment

## 1. Deployment Architecture
- **Containerization:** All generated apps are Dockerized.
- **Orchestration:** Deployments use ECS (AWS) or Cloud Run (GCP) for scalability.
- **Load Balancing:** ALB/Cloud Load Balancing handles traffic distribution.

## 2. Setup Guide
### AWS
1. Create IAM User with `AdministratorAccess`.
2. Add Access Key/Secret to FutureBuilder Settings.
3. Select "AWS" in Deployment Wizard.

### GCP
1. Create Service Account with `Editor` role.
2. Upload JSON Key to FutureBuilder.
3. Enable Compute Engine & Cloud SQL APIs.

## 3. Terraform Reference
- **Modules:** Reusable modules for VPC, SG, EC2, RDS.
- **State Locking:** DynamoDB used to prevent concurrent state modifications.

# system_control\install_seo_marketing.ps1
# Usage: pwsh -ExecutionPolicy Bypass -File .\system_control\install_seo_marketing.ps1

$ErrorActionPreference = "Stop"
Write-Host "SEO + Marketing Automation installer starting..." -ForegroundColor Cyan

$root = $PSScriptRoot
# if running from system_control folder, project root is parent
if ((Split-Path $root -Leaf) -ieq 'system_control') {
    $projectRoot = Split-Path $root -Parent
}
else {
    $projectRoot = $root
}

Write-Host "Project root: $projectRoot"

# folders to create
$folders = @(
    "automation_engines\seo_engine",
    "automation_engines\marketing_sync",
    "automation_engines\marketing_sync\social_connectors",
    "automation_engines\anti_plagiarism",
    "automation_engines\gamify",
    "automation_engines\pricing",
    "history_logs"
)

foreach ($f in $folders) {
    # Use Join-Path and explicit creation
    $p = Join-Path $projectRoot $f
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
        Write-Host "Created: $f"
    }
    else {
        Write-Host "Exists: $f"
    }
}

# helper to write files
function Write-PhaseFile($relPath, $content) {
    $full = Join-Path $projectRoot $relPath
    $dir = Split-Path $full -Parent
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
    $content | Out-File -FilePath $full -Encoding UTF8 -Force
    Write-Host "File written: $relPath"
}

# seo_engine.ps1 (skeleton)
$seoEngine = @'
# automation_engines/seo_engine/seo_engine.ps1
# SEO Engine Orchestration (skeleton)
param()
$ErrorActionPreference = "Stop"
Write-Host "SEO Engine started..."

# Load site map / content manifest (to be implemented)
# 1) Run meta-generator
# 2) Run sitemap builder
# 3) Run structured data validator
# 4) Run on-page checklist and save report to history_logs/seo_report_YYYYMMDD.json

Write-Host "This is a skeleton. Add project-specific content scanning logic or call predictive engine."
'@

Write-PhaseFile "automation_engines/seo_engine/seo_engine.ps1" $seoEngine

# meta_generator.ps1 (skeleton)
$metaGen = @'
# automation_engines/seo_engine/meta_generator.ps1
param([string]$sourceFolder = "project/frontend")
Write-Host "Meta generator running for: $sourceFolder"
# Example actions:
# - Parse pages
# - Suggest title (<=60 chars), meta description (<=155 chars)
# - Suggest canonical and OG tags
# - Output suggestions to history_logs/meta_suggestions_YYYYMMDD.json
'@

Write-PhaseFile "automation_engines/seo_engine/meta_generator.ps1" $metaGen

# sitemap_builder.ps1 (skeleton)
$sitemap = @'
# automation_engines/seo_engine/sitemap_builder.ps1
param([string]$outFile = ".\project\frontend\sitemap.xml")
Write-Host "Sitemap builder skeleton. Implement crawling of site pages and write XML sitemap."
'@

Write-PhaseFile "automation_engines/seo_engine/sitemap_builder.ps1" $sitemap

# structured_data template
$structTpl = @'
{
  "Article": {
    "headline": "<TITLE>",
    "author": "<AUTHOR>",
    "datePublished": "<YYYY-MM-DD>",
    "image": "<URL>"
  }
}
'@

Write-PhaseFile "automation_engines/seo_engine/structured_data.tpl.json" $structTpl

# marketing_sync main
$marketing = @'
# automation_engines/marketing_sync/marketing_sync.ps1
param()
Write-Host "Marketing Sync starting..."
# Responsibilities:
# - Pull campaign metrics from connectors (FB/G/IG) (requires keys)
# - Suggest new short-form content, hashtags
# - Schedule content drafts (permission guarded)
'@

Write-PhaseFile "automation_engines/marketing_sync/marketing_sync.ps1" $marketing

# connectors README placeholders
$fb = @'
# automation_engines/marketing_sync/social_connectors/facebook_connector.md
# Facebook Connector
# - Place your FB App ID/Secret in config file (not in repo)
# - Use Graph API long-lived tokens
# - Endpoints: post creation, insights, ads metrics
'@
Write-PhaseFile "automation_engines/marketing_sync/social_connectors/facebook_connector.md" $fb

$insta = @'
# instagram_connector.md
# Instagram Connector notes:
# - Use Facebook/Instagram Graph (Business) API
# - Requires business account and page connection
'@
Write-PhaseFile "automation_engines/marketing_sync/social_connectors/instagram_connector.md" $insta

$gconn = @'
# google_connector.md
# Google connectors:
# - Search Console API (indexing, impressions)
# - Google Ads API (requires whitelisting)
'@
Write-PhaseFile "automation_engines/marketing_sync/social_connectors/google_connector.md" $gconn

# anti_plagiarism
$anti = @'
# automation_engines/anti_plagiarism/anti_plagiarism.ps1
param([string]$filepath)
Write-Host "Anti-plagiarism skeleton. Steps to implement:"
Write-Host "1) Create fingerprint (e.g., SimHash) for content"
Write-Host "2) Check similarity against known sources (index or API)"
Write-Host "3) Output score and suggested rephrases"
'@
Write-PhaseFile "automation_engines/anti_plagiarism/anti_plagiarism.ps1" $anti

# gamify
$gam = @'
# automation_engines/gamify/gamify_engine.ps1
param()
Write-Host "Gamify engine skeleton:"
Write-Host "- Reward rules, points, badges"
Write-Host "- Hook events: publish_content, share, complete_task"
'@
Write-PhaseFile "automation_engines/gamify/gamify_engine.ps1" $gam

# pricing
$pricing = @'
{
  "tiers": {
    "free": { "features": ["basic_seo_scan"], "price": 0 },
    "pro": { "features": ["auto_meta","social_suggest"], "price": 499 },
    "premium": { "features": ["auto_post","priority_support","predictive_scores"], "price": 1499 }
  }
}
'@
Write-PhaseFile "automation_engines/pricing/pricing.json" $pricing

# README stubs
$readmeSeo = @'
# SEO Engine
This folder contains the SEO automation skeleton. Edit scripts to adapt to your frontend structure.
Add connectors and run seo_engine.ps1 for a scan.
'@
Write-PhaseFile "automation_engines/seo_engine/README.md" $readmeSeo

$readmeMarketing = @'
# Marketing Sync
Use this folder to integrate social connectors and schedule posts. Connectors require API keys stored in secure local config.
'@
Write-PhaseFile "automation_engines/marketing_sync/README.md" $readmeMarketing

$readmeAnti = @'
# Anti Plagiarism
This engine will detect high-similarity content and provide rephrase suggestions. Integrate with external index if needed.
'@
Write-PhaseFile "automation_engines/anti_plagiarism/README.md" $readmeAnti

# log entry
$logPath = Join-Path $projectRoot "history_logs\seo_marketing_install.log"
"Install run at $(Get-Date) - SEO/Marketing scaffold created." | Out-File -FilePath $logPath -Encoding UTF8 -Append

Write-Host "SEO + Marketing scaffold created successfully." -ForegroundColor Green
Write-Host "Next steps:"
Write-Host "1) Open automation_engines/seo_engine/README.md and adapt meta/sitemap scripts to your frontend."
Write-Host "2) Add API keys to secure config (not in repo) for social connectors."
Write-Host "3) Run .\automation_engines\seo_engine\seo_engine.ps1 (dry run) to test."

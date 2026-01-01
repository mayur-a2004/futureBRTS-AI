# XP / Rewards / Level Engine

param([string]$User)

"{Time:$(Get-Date): Gamify event triggered for $User}" |
  Out-File -Append "$PSScriptRoot/../../history_logs/phase9/gamify_engine.log"

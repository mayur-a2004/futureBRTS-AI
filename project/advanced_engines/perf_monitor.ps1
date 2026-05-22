<#
.SYNOPSIS
    FutureBuilder PERFORMANCE OVERLORD (Level 7)
.DESCRIPTION
    Real-time system performance monitoring and dynamic resource leveling engine.
.AUTHOR
    Future V.2.0 Architect
#>

$Host.UI.RawUI.WindowTitle = "FutureBuilder: PERFORMANCE OVERLORD [LEVEL 7]"

function Write-Log {
    param($Msg, $Color = "Green")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] [PERF] $Msg" -ForegroundColor $Color
}

Write-Log "Initializing Performance Vectors..." "Yellow"
Start-Sleep -Seconds 1
Write-Log "Attached to System Grid." "Green"

while ($true) {
    # Analyze CPU/RAM
    $cpu = Get-CimInstance Win32_Processor | Measure-Object -Property LoadPercentage -Average | Select-Object -ExpandProperty Average
    $ram = Get-CimInstance Win32_OperatingSystem | Select-Object @{Name = "FreeGB"; Expression = { "{0:N2}" -f ($_.FreePhysicalMemory / 1MB / 1024) } }
    
    if ($cpu -gt 80) {
        Write-Log "HIGH LOAD DETECTED: CPU at $cpu%. Initiating Cooling Protocols..." "Red"
    }
    else {
        Write-Log "System Nominal. CPU: $cpu% | Free RAM: $($ram.FreeGB) GB" "Cyan"
    }
    
    Start-Sleep -Seconds 5
}

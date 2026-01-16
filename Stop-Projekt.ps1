# Stop-Projekt.ps1 - Stoppt alle Projekt-Prozesse
param(
    [switch]$docker,
    [switch]$KeepDB
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Buchhandlung SPA - Stop Script     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stoppe Node.js Prozesse (Backend)
Write-Host "[1/4] Stoppe Backend (Node.js)..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "  $($nodeProcesses.Count) Node.js Prozess(e) gestoppt" -ForegroundColor Green
} else {
    Write-Host "  Keine Node.js Prozesse gefunden" -ForegroundColor Gray
}

# Stoppe Angular/ng Prozesse (Frontend)
Write-Host ""
Write-Host "[2/4] Stoppe Frontend..." -ForegroundColor Yellow
# Angular laeuft auch ueber Node, wurde bereits gestoppt
Write-Host "  Frontend gestoppt (ueber Node.js)" -ForegroundColor Green

# Stoppe Cloudflare Tunnel
Write-Host ""
Write-Host "[3/4] Stoppe Cloudflare Tunnel..." -ForegroundColor Yellow
$cloudflaredProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcesses) {
    $cloudflaredProcesses | Stop-Process -Force
    Write-Host "  Cloudflare Tunnel gestoppt" -ForegroundColor Green
} else {
    Write-Host "  Kein Tunnel aktiv" -ForegroundColor Gray
}

# Stoppe PowerShell Jobs
Write-Host ""
Write-Host "[4/4] Stoppe PowerShell Jobs..." -ForegroundColor Yellow
$jobs = Get-Job -State Running -ErrorAction SilentlyContinue
if ($jobs) {
    $jobs | Stop-Job
    $jobs | Remove-Job
    Write-Host "  $($jobs.Count) Job(s) gestoppt" -ForegroundColor Green
} else {
    Write-Host "  Keine laufenden Jobs" -ForegroundColor Gray
}

# Docker Container stoppen (optional)
if ($docker -and -not $KeepDB) {
    Write-Host ""
    Write-Host "[Extra] Stoppe Docker Container..." -ForegroundColor Yellow
    docker stop postgres keycloak 2>$null
    Write-Host "  Docker Container gestoppt" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[Info] Docker Container laufen weiter" -ForegroundColor Gray
    Write-Host "       Zum Stoppen: .\Stop-Projekt.ps1 -docker" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         Alles gestoppt!               " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

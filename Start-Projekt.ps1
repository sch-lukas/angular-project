# Start-Projekt.ps1 - Startet Backend, Frontend und optional Tunnel
param(
    [switch]$tunnel
)

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Buchhandlung SPA - Start Script    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Pruefe Docker Container
Write-Host "[1/4] Pruefe Docker Container..." -ForegroundColor Yellow
$postgres = docker ps --filter "name=postgres" --format "{{.Status}}" 2>$null
$keycloak = docker ps --filter "name=keycloak" --format "{{.Status}}" 2>$null

if (-not $postgres) {
    Write-Host "  PostgreSQL nicht gefunden - starte..." -ForegroundColor Gray
    docker compose -f "$ProjectRoot\.extras\compose\postgres\compose-simple.yml" up -d
}
else {
    Write-Host "  PostgreSQL laeuft" -ForegroundColor Green
}

if (-not $keycloak) {
    Write-Host "  Keycloak nicht gefunden - starte..." -ForegroundColor Gray
    docker compose -f "$ProjectRoot\.extras\compose\keycloak\compose-simple.yml" up -d
    Start-Sleep -Seconds 10
}
else {
    Write-Host "  Keycloak laeuft" -ForegroundColor Green
}

# Backend starten
Write-Host ""
Write-Host "[2/4] Starte Backend..." -ForegroundColor Yellow
$backendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location $root
    $env:NODE_ENV = "development"
    node dist/main.js 2>&1
} -ArgumentList $ProjectRoot

Start-Sleep -Seconds 3
Write-Host "  Backend gestartet (Job ID: $($backendJob.Id))" -ForegroundColor Green

# Frontend starten
Write-Host ""
Write-Host "[3/4] Starte Frontend..." -ForegroundColor Yellow
$frontendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location "$root\frontend"
    pnpm start 2>&1
} -ArgumentList $ProjectRoot

Start-Sleep -Seconds 5
Write-Host "  Frontend gestartet (Job ID: $($frontendJob.Id))" -ForegroundColor Green

# Tunnel starten (optional)
if ($tunnel) {
    Write-Host ""
    Write-Host "[4/4] Starte Cloudflare Tunnel..." -ForegroundColor Yellow

    $cloudflared = "$env:USERPROFILE\cloudflared.exe"
    if (-not (Test-Path $cloudflared)) {
        Write-Host "  cloudflared nicht gefunden! Bitte installieren:" -ForegroundColor Red
        Write-Host '  Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "$env:USERPROFILE\cloudflared.exe"' -ForegroundColor Gray
    }
    else {
        Start-Process -FilePath $cloudflared -ArgumentList "tunnel", "--url", "http://localhost:4200" -NoNewWindow
        Write-Host "  Tunnel gestartet - URL wird in separatem Fenster angezeigt" -ForegroundColor Green
    }
}

# Zusammenfassung
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "         Projekt gestartet!            " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend:  https://localhost:3000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor White
Write-Host "  Keycloak: http://localhost:8880 (admin/<aus_.env>)" -ForegroundColor White
Write-Host ""
Write-Host "  Login: admin / CHANGE_ME_DEV_PASSWORD" -ForegroundColor Cyan
Write-Host ""
Write-Host "Zum Stoppen: Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "Oder:        .\Stop-All.ps1" -ForegroundColor Gray
Write-Host ""

# Warte auf Benutzer-Eingabe
Write-Host "Druecke Enter zum Beenden der Jobs..." -ForegroundColor Yellow
Read-Host

# Jobs beenden
Stop-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob, $frontendJob -ErrorAction SilentlyContinue
Write-Host "Jobs beendet." -ForegroundColor Green

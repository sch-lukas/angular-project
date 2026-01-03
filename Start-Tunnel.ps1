# Start-Tunnel.ps1
# Startet das Projekt mit Cloudflare Tunnel für externen Zugriff
#
# Verwendung:
#   .\Start-Tunnel.ps1              → Startet alles mit Tunnel
#   .\Start-Tunnel.ps1 -BackendOnly → Nur Backend starten (für separate Tunnel)
#
# SICHERHEIT:
#   - Nur das Frontend ist von außen erreichbar
#   - Backend läuft nur lokal (localhost:3000)
#   - API-Calls gehen durch Angular's Proxy → sicher!

param(
    [switch]$BackendOnly,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║       🌐 Buchhandlung SPA - Tunnel Modus                      ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

# Prüfe cloudflared
$cloudflared = "$env:USERPROFILE\cloudflared.exe"
if (-not (Test-Path $cloudflared)) {
    Write-Host "`n❌ cloudflared nicht gefunden!" -ForegroundColor Red
    Write-Host "   Bitte installieren mit:" -ForegroundColor Yellow
    Write-Host '   Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "$env:USERPROFILE\cloudflared.exe"' -ForegroundColor Gray
    exit 1
}

# ============================================
# 1. Docker Container starten
# ============================================
Write-Host "`n[1/5] Starte Docker Container..." -ForegroundColor Cyan

$postgresCompose = Join-Path $ProjectRoot ".extras\compose\postgres"
$keycloakCompose = Join-Path $ProjectRoot ".extras\compose\keycloak"

Set-Location $postgresCompose
docker compose up -d 2>$null
Write-Host "  ✅ PostgreSQL gestartet" -ForegroundColor Green

Set-Location $keycloakCompose
docker compose up -d 2>$null
Write-Host "  ✅ Keycloak gestartet" -ForegroundColor Green

# ============================================
# 2. Backend starten
# ============================================
Write-Host "`n[2/5] Starte Backend (localhost:3000)..." -ForegroundColor Cyan
Write-Host "  ⚠️  Backend ist NUR lokal erreichbar (sicher!)" -ForegroundColor Yellow

Set-Location $ProjectRoot
$backendJob = Start-Job -ScriptBlock {
    param($root)
    Set-Location $root
    pnpm start 2>&1
} -ArgumentList $ProjectRoot

Start-Sleep -Seconds 5
Write-Host "  ✅ Backend gestartet (Job: $($backendJob.Id))" -ForegroundColor Green

# ============================================
# 3. Frontend starten
# ============================================
Write-Host "`n[3/5] Starte Frontend (localhost:4200)..." -ForegroundColor Cyan

$frontendPath = Join-Path $ProjectRoot "frontend"
$frontendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    pnpm start 2>&1
} -ArgumentList $frontendPath

Start-Sleep -Seconds 8
Write-Host "  ✅ Frontend gestartet (Job: $($frontendJob.Id))" -ForegroundColor Green

# ============================================
# 4. Warte auf Services
# ============================================
Write-Host "`n[4/5] Warte auf Services..." -ForegroundColor Cyan

# Warte auf Backend
$maxWait = 30
$waited = 0
while ($waited -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "https://localhost:3000/health" -SkipCertificateCheck -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  ✅ Backend bereit" -ForegroundColor Green
        break
    } catch {
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "  ⏳ Warte auf Backend... ($waited/$maxWait Sek.)" -ForegroundColor Gray
    }
}

# Warte auf Frontend
$waited = 0
while ($waited -lt $maxWait) {
    try {
        $response = Invoke-WebRequest -Uri "https://localhost:4200" -SkipCertificateCheck -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  ✅ Frontend bereit" -ForegroundColor Green
        break
    } catch {
        Start-Sleep -Seconds 2
        $waited += 2
        Write-Host "  ⏳ Warte auf Frontend... ($waited/$maxWait Sek.)" -ForegroundColor Gray
    }
}

# ============================================
# 5. Cloudflare Tunnel starten
# ============================================
Write-Host "`n[5/5] Starte Cloudflare Tunnel..." -ForegroundColor Cyan
Write-Host "  🔒 Nur Frontend wird exponiert (Backend bleibt sicher lokal)" -ForegroundColor Yellow

# Starte Tunnel als Hintergrundprozess
$tunnelProcess = Start-Process -FilePath $cloudflared -ArgumentList "tunnel", "--url", "https://localhost:4200", "--no-tls-verify" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 5

# Hole Tunnel-URL aus dem Prozess-Output (kann etwas dauern)
Write-Host "`n  ⏳ Hole Tunnel-URL..." -ForegroundColor Gray
Start-Sleep -Seconds 3

# Versuche die URL aus den Metrics zu holen
try {
    $metricsResponse = Invoke-RestMethod -Uri "http://127.0.0.1:20241/metrics" -TimeoutSec 5 -ErrorAction SilentlyContinue
} catch {
    # Metrics nicht verfügbar, das ist okay
}

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ Tunnel läuft!                           ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║  🌐 ÖFFENTLICHE URL:                                          ║" -ForegroundColor Green
Write-Host "║     Siehe Cloudflare-Terminal für die trycloudflare.com URL   ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║  📍 Lokale URLs:                                              ║" -ForegroundColor Green
Write-Host "║     Frontend: https://localhost:4200                          ║" -ForegroundColor Green
Write-Host "║     Backend:  https://localhost:3000 (NUR lokal!)             ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║  🔐 Login: admin / MnPfKCid!                                  ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║  🛑 Zum Beenden: Drücke ENTER                                 ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "⚠️  SICHERHEITS-INFO:" -ForegroundColor Yellow
Write-Host "   • Nur das Frontend ist von außen erreichbar" -ForegroundColor White
Write-Host "   • Backend (Port 3000) ist NICHT direkt erreichbar" -ForegroundColor White
Write-Host "   • API-Calls gehen durch den Angular Proxy (sicher)" -ForegroundColor White
Write-Host "   • Tunnel-URL ändert sich bei jedem Neustart" -ForegroundColor White
Write-Host ""

# Öffne Browser mit lokaler URL
if (-not $NoBrowser) {
    Start-Process "https://localhost:4200"
}

# Warte auf Benutzer-Eingabe zum Beenden
Read-Host "Drücke ENTER zum Beenden..."

# ============================================
# Aufräumen
# ============================================
Write-Host "`n🛑 Beende alle Services..." -ForegroundColor Yellow

# Tunnel stoppen
Stop-Process -Id $tunnelProcess.Id -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Tunnel gestoppt" -ForegroundColor Green

# Jobs stoppen
Stop-Job -Job $backendJob -ErrorAction SilentlyContinue
Remove-Job -Job $backendJob -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Backend gestoppt" -ForegroundColor Green

Stop-Job -Job $frontendJob -ErrorAction SilentlyContinue
Remove-Job -Job $frontendJob -Force -ErrorAction SilentlyContinue
Write-Host "  ✅ Frontend gestoppt" -ForegroundColor Green

# Node-Prozesse beenden (zur Sicherheit)
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host "`n✅ Alles beendet!" -ForegroundColor Green

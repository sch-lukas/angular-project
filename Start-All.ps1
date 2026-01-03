# Start-All.ps1 - Startet den kompletten Entwicklungsstack
#
# Verwendung:
#   .\Start-All.ps1              → Startet alles (DB, Keycloak, Backend, Frontend)
#   .\Start-All.ps1 -lan         → Startet alles + Frontend im LAN-Modus
#   .\Start-All.ps1 -tunnel      → Startet alles + Cloudflare Tunnel (Internet-Zugriff)
#   .\Start-All.ps1 -NoFrontend  → Nur Backend-Stack (DB, Keycloak, Backend)
#
# Von überall starten:
#   & "C:\software-engeneering\angular-project\Start-All.ps1"

param(
    [switch]$lan,
    [switch]$tunnel,
    [switch]$NoFrontend,
    [switch]$NoBrowser
)

$ProjectRoot = "C:\software-engeneering\angular-project"

# Farbige Ausgabe
function Write-Step($step, $description) {
    Write-Host "`n[$step] " -ForegroundColor Cyan -NoNewline
    Write-Host $description -ForegroundColor White
}

function Write-Success($message) {
    Write-Host "  ✓ $message" -ForegroundColor Green
}

function Write-Info($message) {
    Write-Host "  ℹ $message" -ForegroundColor Yellow
}

# Banner
Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
if ($tunnel) {
    Write-Host "║       🌐 Buchhandlung SPA - TUNNEL Modus                  ║" -ForegroundColor Magenta
} elseif ($lan) {
    Write-Host "║       📱 Buchhandlung SPA - LAN Modus                     ║" -ForegroundColor Magenta
} else {
    Write-Host "║       🚀 Buchhandlung SPA - Dev Stack                     ║" -ForegroundColor Magenta
}
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

# Tunnel-Modus: Prüfe cloudflared
if ($tunnel) {
    $cloudflared = "$env:USERPROFILE\cloudflared.exe"
    if (-not (Test-Path $cloudflared)) {
        Write-Host "`n❌ cloudflared nicht gefunden!" -ForegroundColor Red
        Write-Host "   Bitte installieren mit:" -ForegroundColor Yellow
        Write-Host '   Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "$env:USERPROFILE\cloudflared.exe"' -ForegroundColor Gray
        exit 1
    }
    Write-Host "`n🔒 SICHERHEIT: Nur Frontend wird exponiert, Backend bleibt lokal!" -ForegroundColor Yellow
}

# Schritt 1: PostgreSQL
Write-Step "1/4" "PostgreSQL Datenbank starten..."
$postgresCompose = Join-Path $ProjectRoot ".extras\compose\postgres"
Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "$postgresCompose\compose.yml", "up", "-d" -NoNewWindow -Wait
Write-Success "PostgreSQL gestartet (Port 5432)"

# Schritt 2: Keycloak
Write-Step "2/4" "Keycloak Auth-Server starten..."
$keycloakCompose = Join-Path $ProjectRoot ".extras\compose\keycloak"
Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "$keycloakCompose\compose.yml", "up", "-d" -NoNewWindow -Wait
Write-Success "Keycloak gestartet (Port 8843)"

# Warte kurz bis Container laufen
Start-Sleep -Seconds 2

# Schritt 3: Backend in neuem Fenster
Write-Step "3/4" "NestJS Backend starten..."
$backendCmd = @"
Set-Location '$ProjectRoot'
Write-Host '🔧 Backend Server startet...' -ForegroundColor Cyan
node --env-file=.env dist/main.js
"@
Start-Process pwsh -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Success "Backend Fenster geöffnet (Port 3000)"

# Schritt 4: Frontend in neuem Fenster (wenn nicht deaktiviert)
if (-not $NoFrontend) {
    Write-Step "4/4" "Angular Frontend starten..."
    $frontendPath = Join-Path $ProjectRoot "frontend"

    if ($tunnel) {
        $frontendCmd = "Set-Location '$frontendPath'; Write-Host '🌐 Frontend Server (TUNNEL-Modus) startet...' -ForegroundColor Cyan; pnpm start:tunnel"
        Write-Info "Tunnel-Modus aktiviert - Host-Check deaktiviert"
    } elseif ($lan) {
        $frontendCmd = "Set-Location '$frontendPath'; Write-Host '🌐 Frontend Server (LAN-Modus) startet...' -ForegroundColor Cyan; pnpm start:lan"
        Write-Info "LAN-Modus aktiviert - von anderen Geräten erreichbar"
    } else {
        $frontendCmd = "Set-Location '$frontendPath'; Write-Host '🏠 Frontend Server startet...' -ForegroundColor Cyan; pnpm start"
    }

    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd
    Write-Success "Frontend Fenster geöffnet (Port 4200)"
} else {
    Write-Step "4/4" "Frontend übersprungen (--NoFrontend)"
}

# Zusammenfassung
Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ Stack gestartet!                    ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║  PostgreSQL:  localhost:5432                              ║" -ForegroundColor Green
Write-Host "║  Keycloak:    https://localhost:8843                      ║" -ForegroundColor Green
Write-Host "║  Backend:     https://localhost:3000                      ║" -ForegroundColor Green
Write-Host "║  Swagger:     https://localhost:3000/swagger              ║" -ForegroundColor Green
if (-not $NoFrontend) {
Write-Host "║  Frontend:    https://localhost:4200                      ║" -ForegroundColor Green
}
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green

# LAN-Adressen anzeigen wenn im LAN-Modus
if ($lan -and -not $NoFrontend) {
    Write-Host "`n"
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              📱 LAN-Zugriff (andere Geräte)               ║" -ForegroundColor Cyan
    Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Cyan

    # Alle IPv4-Adressen sammeln
    $networkAdapters = Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.IPAddress -ne "127.0.0.1" -and
        $_.PrefixOrigin -ne "WellKnown"
    }

    foreach ($adapter in $networkAdapters) {
        $adapterName = (Get-NetAdapter -InterfaceIndex $adapter.InterfaceIndex -ErrorAction SilentlyContinue).Name
        if ($adapterName) {
            $url = "https://$($adapter.IPAddress):4200"
            $displayName = $adapterName.PadRight(20).Substring(0, 20)
            Write-Host "║  $displayName  $url" -ForegroundColor Cyan -NoNewline
            # Padding bis zum Ende der Box
            $padding = 59 - 4 - 20 - 2 - $url.Length
            if ($padding -gt 0) {
                Write-Host (" " * $padding) -NoNewline
            }
            Write-Host "║" -ForegroundColor Cyan
        }
    }

    Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║  💡 Tipp: WLAN-Adresse für Handy im gleichen Netzwerk     ║" -ForegroundColor Cyan
    Write-Host "║  ⚠️  SSL-Warnung im Browser akzeptieren!                  ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

# Tunnel starten wenn aktiviert
if ($tunnel -and -not $NoFrontend) {
    Write-Host "`n"
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║              🌐 Cloudflare Tunnel starten...              ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

    Write-Host "`n⏳ Warte auf Frontend (15 Sek.)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15

    # Starte Tunnel als Hintergrund-Job und fange die URL ab
    $cloudflared = "$env:USERPROFILE\cloudflared.exe"
    $tunnelJob = Start-Job -ScriptBlock {
        param($exe)
        & $exe tunnel --url https://localhost:4200 --no-tls-verify 2>&1
    } -ArgumentList $cloudflared

    Write-Host "⏳ Warte auf Tunnel-URL..." -ForegroundColor Yellow

    $tunnelUrl = $null
    $timeout = 30
    $elapsed = 0

    while ($elapsed -lt $timeout -and -not $tunnelUrl) {
        Start-Sleep -Seconds 1
        $elapsed++

        # Hole aktuelle Ausgabe vom Job
        $output = Receive-Job -Job $tunnelJob -Keep 2>$null
        if ($output) {
            foreach ($line in $output) {
                if ($line -match "https://[a-z0-9-]+\.trycloudflare\.com") {
                    $tunnelUrl = $matches[0]
                    break
                }
            }
        }

        # Fortschrittsanzeige
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
    Write-Host ""

    if ($tunnelUrl) {
        Write-Host "`n"
        Write-Host "╔═══════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
        Write-Host "║                        🌐 TUNNEL AKTIV!                                   ║" -ForegroundColor Green
        Write-Host "╠═══════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
        Write-Host "║                                                                           ║" -ForegroundColor Green
        $urlLine = "║  🔗 URL: $tunnelUrl"
        $urlPadding = 75 - $urlLine.Length
        Write-Host "$urlLine$(' ' * $urlPadding)║" -ForegroundColor Green
        Write-Host "║                                                                           ║" -ForegroundColor Green
        Write-Host "║  🔐 Login: admin / MnPfKCid!                                              ║" -ForegroundColor Green
        Write-Host "║                                                                           ║" -ForegroundColor Green
        Write-Host "║  🔒 Sicherheit:                                                           ║" -ForegroundColor Green
        Write-Host "║     • Nur Frontend ist von außen erreichbar                               ║" -ForegroundColor Green
        Write-Host "║     • Backend bleibt lokal geschützt                                      ║" -ForegroundColor Green
        Write-Host "║     • URL ändert sich bei jedem Neustart                                  ║" -ForegroundColor Green
        Write-Host "║                                                                           ║" -ForegroundColor Green
        Write-Host "║  📋 Diese URL kannst du teilen! (Gültig bis Script-Stopp)                 ║" -ForegroundColor Green
        Write-Host "║                                                                           ║" -ForegroundColor Green
        Write-Host "╚═══════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green

        # URL in Zwischenablage kopieren
        $tunnelUrl | Set-Clipboard
        Write-Host "`n📋 URL wurde in die Zwischenablage kopiert!" -ForegroundColor Cyan

        # Speichere Job-ID für Stop-All.ps1
        $tunnelJob.Id | Out-File -FilePath "$ProjectRoot\.tunnel-job-id" -Force
    } else {
        Write-Host "`n⚠️  Tunnel gestartet, aber URL konnte nicht automatisch erkannt werden." -ForegroundColor Yellow
        Write-Host "   Prüfe das Tunnel-Fenster für die URL." -ForegroundColor Yellow
    }

    Write-Host "`n💡 Tunnel läuft im Hintergrund. Beenden mit: " -NoNewline -ForegroundColor Yellow
    Write-Host ".\Stop-All.ps1" -ForegroundColor Cyan
}

# Browser öffnen (optional)
if (-not $NoBrowser -and -not $NoFrontend) {
    Write-Host "`n⏳ Warte 8 Sekunden, dann öffne Browser..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    Start-Process "https://localhost:4200"
}

Write-Host "`n💡 Zum Stoppen: " -NoNewline -ForegroundColor Yellow
Write-Host ".\Stop-All.ps1" -ForegroundColor Cyan
Write-Host ""

# Start-All.ps1 - Startet den kompletten Entwicklungsstack
#
# Verwendung:
#   .\Start-All.ps1              → Startet alles (DB, Keycloak, Backend, Frontend)
#   .\Start-All.ps1 -lan         → Startet alles + Frontend im LAN-Modus
#   .\Start-All.ps1 -tunnel      → Startet alles + Cloudflare Tunnel (Internet-Zugriff)
#   .\Start-All.ps1 -docker      → Startet alles als Docker-Container
#   .\Start-All.ps1 -docker -tunnel → Docker-Container + Cloudflare Tunnel
#   .\Start-All.ps1 -NoFrontend  → Nur Backend-Stack (DB, Keycloak, Backend)
#
# Von überall starten:
#   & "C:\software-engeneering\angular-project\Start-All.ps1"

param(
    [switch]$lan,
    [switch]$tunnel,
    [switch]$docker,
    [switch]$NoFrontend,
    [switch]$NoBrowser
)

# ═══════════════════════════════════════════════════════════════════════════════
# KONSOLEN-ENCODING FÜR EMOJI-SUPPORT
# ═══════════════════════════════════════════════════════════════════════════════
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$ProjectRoot = $PSScriptRoot

# Farbige Ausgabe mit Emojis
function Write-Step($step, $description) {
    Write-Host "`n⏳ [$step] " -ForegroundColor Cyan -NoNewline
    Write-Host $description -ForegroundColor White
}

function Write-Success($message) {
    Write-Host "  ✅ $message" -ForegroundColor Green
}

function Write-Info($message) {
    Write-Host "  ℹ️  $message" -ForegroundColor Yellow
}

# Banner
Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
if ($docker -and $tunnel) {
    Write-Host "║     🐳🌐 Buchhandlung SPA - Docker+Tunnel                 ║" -ForegroundColor Magenta
} elseif ($docker) {
    Write-Host "║       🐳 Buchhandlung SPA - Docker-Modus                  ║" -ForegroundColor Magenta
} elseif ($tunnel) {
    Write-Host "║       🌐 Buchhandlung SPA - TUNNEL Modus                  ║" -ForegroundColor Magenta
} elseif ($lan) {
    Write-Host "║       📱 Buchhandlung SPA - LAN Modus                     ║" -ForegroundColor Magenta
} else {
    Write-Host "║       🚀 Buchhandlung SPA - Dev Stack                     ║" -ForegroundColor Magenta
}
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

# Tunnel-Modus: Prüfe cloudflared
if ($tunnel) {
    # Suche cloudflared an verschiedenen Stellen
    $cloudflared = $null
    $possiblePaths = @(
        "$env:USERPROFILE\cloudflared.exe",
        "C:\Program Files\Cloudflare\Cloudflared\cloudflared.exe",
        "C:\Program Files (x86)\Cloudflare\Cloudflared\cloudflared.exe"
    )

    # Erst im PATH suchen (mit aktualisiertem PATH)
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
    $cloudflaredInPath = Get-Command cloudflared -ErrorAction SilentlyContinue
    if ($cloudflaredInPath) {
        $cloudflared = $cloudflaredInPath.Source
    } else {
        # Im WinGet-Paket-Ordner suchen
        $wingetPath = Get-ChildItem "$env:LOCALAPPDATA\Microsoft\WinGet\Packages" -Recurse -Filter "cloudflared.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($wingetPath) {
            $cloudflared = $wingetPath.FullName
        } else {
            # Dann in bekannten Pfaden suchen
            foreach ($path in $possiblePaths) {
                if (Test-Path $path) {
                    $cloudflared = $path
                    break
                }
            }
        }
    }

    if (-not $cloudflared) {
        Write-Host "`ncloudflared nicht gefunden!" -ForegroundColor Red
        Write-Host "   Installieren mit: winget install Cloudflare.cloudflared" -ForegroundColor Yellow
        Write-Host "   Danach Terminal NEU STARTEN!" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "`nSICHERHEIT: Nur Frontend wird exponiert, Backend bleibt lokal!" -ForegroundColor Yellow
}

# =============================================================================
# DOCKER-MODUS: Kompletter Stack als Container
# =============================================================================
if ($docker) {
    Write-Step "1/2" "Docker-Stack starten..."
    $dockerStackCompose = Join-Path $ProjectRoot ".extras\compose\docker-stack"

    # Netzwerk erstellen falls nicht vorhanden
    docker network create acme-network 2>$null

    # Container starten (baut automatisch nur wenn Images fehlen oder sich geändert haben)
    Write-Info "Starte Docker-Container..."
    Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "$dockerStackCompose\compose.yml", "up", "-d" -NoNewWindow -Wait
    Write-Success "Docker-Stack gestartet"

    # Warte auf Container
    Write-Step "2/2" "Warte auf Container-Gesundheitschecks..."
    Start-Sleep -Seconds 10

    # Status prüfen
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" --filter "name=buchhandlung"
    Write-Host "`n$containers" -ForegroundColor Gray

    Write-Success "Alle Container gestartet"

    # Zusammenfassung für Docker-Modus
    Write-Host "`n"
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              🐳 DOCKER Stack gestartet!                    ║" -ForegroundColor Green
    Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║  PostgreSQL:  localhost:5432                              ║" -ForegroundColor Green
    Write-Host "║  Keycloak:    https://localhost:8843                      ║" -ForegroundColor Green
    Write-Host "║  Backend:     https://localhost:3000 (Container)          ║" -ForegroundColor Green
    Write-Host "║  Frontend:    http://localhost:80 (Container)             ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green

    # Tunnel starten wenn aktiviert (Docker-Modus)
    if ($tunnel) {
        Write-Host "`n"
        Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
        Write-Host "║              🌐 Cloudflare Tunnel starten...               ║" -ForegroundColor Cyan
        Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

        Write-Host "`n⏳ Warte auf Frontend-Container (10 Sek.)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10

        # Tunnel auf Port 80 (Frontend-Container)
        # $cloudflared wurde bereits oben beim Tunnel-Check gesetzt
        $tunnelJob = Start-Job -ScriptBlock {
            param($exe)
            & $exe tunnel --url http://localhost:80 2>&1
        } -ArgumentList $cloudflared

        Write-Host "⏳ Warte auf Tunnel-URL..." -ForegroundColor Yellow

        $tunnelUrl = $null
        $timeout = 30
        $elapsed = 0

        while ($elapsed -lt $timeout -and -not $tunnelUrl) {
            Start-Sleep -Seconds 1
            $elapsed++
            $output = Receive-Job -Job $tunnelJob -Keep 2>$null
            if ($output) {
                foreach ($line in $output) {
                    if ($line -match "https://[a-z0-9-]+\.trycloudflare\.com") {
                        $tunnelUrl = $matches[0]
                        break
                    }
                }
            }
            Write-Host "." -NoNewline -ForegroundColor Yellow
        }
        Write-Host ""

        if ($tunnelUrl) {
            Write-Host "`n"
            $urlDisplay = "  🔗 URL: $tunnelUrl"
            $boxWidth = [Math]::Max(75, $urlDisplay.Length + 4)
            $horizontalLine = "═" * ($boxWidth - 2)
            $emptyLine = " " * ($boxWidth - 2)

            Write-Host "╔$horizontalLine╗" -ForegroundColor Green
            Write-Host "║$(' ' * [Math]::Floor(($boxWidth - 26) / 2))🌐 DOCKER TUNNEL AKTIV!$(' ' * [Math]::Ceiling(($boxWidth - 26) / 2))║" -ForegroundColor Green
            Write-Host "╠$horizontalLine╣" -ForegroundColor Green
            Write-Host "║$emptyLine║" -ForegroundColor Green

            $urlPadding = [Math]::Max(0, $boxWidth - 2 - $urlDisplay.Length)
            Write-Host "║$urlDisplay$(' ' * $urlPadding)║" -ForegroundColor Green
            Write-Host "║$emptyLine║" -ForegroundColor Green

            $loginLine = "  🔐 Login: admin / CHANGE_ME_DEV_PASSWORD"
            $loginPadding = $boxWidth - 2 - $loginLine.Length
            Write-Host "║$loginLine$(' ' * $loginPadding)║" -ForegroundColor Green
            Write-Host "╚$horizontalLine╝" -ForegroundColor Green

            $tunnelUrl | Set-Clipboard
            Write-Host "`n📋 URL wurde in die Zwischenablage kopiert!" -ForegroundColor Cyan
            $tunnelJob.Id | Out-File -FilePath "$ProjectRoot\.tunnel-job-id" -Force
        }
    }

    # Browser öffnen
    if (-not $NoBrowser) {
        Write-Host "`n>> Öffne Browser..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        Start-Process "http://localhost:80"
    }

    Write-Host "`nℹ️  Zum Stoppen: " -NoNewline -ForegroundColor Yellow
    Write-Host ".\Stop-All.ps1 -docker" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# =============================================================================
# STANDARD-MODUS: Lokale Entwicklung
# =============================================================================

# Schritt 1: PostgreSQL
Write-Step "1/4" "PostgreSQL Datenbank starten..."
$postgresCompose = Join-Path $ProjectRoot ".extras\compose\postgres\compose-simple.yml"
& docker compose -f "$postgresCompose" up -d 2>$null
Write-Success "PostgreSQL gestartet (Port 5432)"

# Schritt 2: Keycloak
Write-Step "2/4" "Keycloak Auth-Server starten..."
$keycloakCompose = Join-Path $ProjectRoot ".extras\compose\keycloak\compose-simple.yml"
& docker compose -f "$keycloakCompose" up -d 2>$null
Write-Success "Keycloak gestartet (Port 8843)"

# Warte kurz bis Container laufen
Start-Sleep -Seconds 2

# Schritt 3: Backend in neuem Fenster
Write-Step "3/4" "NestJS Backend starten..."
$backendCmd = @"
`$host.UI.RawUI.WindowTitle = 'Buchhandlung - Backend (NestJS)'
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
        $frontendCmd = "`$host.UI.RawUI.WindowTitle = 'Buchhandlung - Frontend (Angular)'; Set-Location '$frontendPath'; Write-Host '🌐 Frontend Server (TUNNEL-Modus) startet...' -ForegroundColor Cyan; pnpm start:tunnel"
        Write-Info "Tunnel-Modus aktiviert - Host-Check deaktiviert"
    } elseif ($lan) {
        $frontendCmd = "`$host.UI.RawUI.WindowTitle = 'Buchhandlung - Frontend (Angular)'; Set-Location '$frontendPath'; Write-Host '📱 Frontend Server (LAN-Modus) startet...' -ForegroundColor Cyan; pnpm start:lan"
        Write-Info "LAN-Modus aktiviert - von anderen Geräten erreichbar"
    } else {
        $frontendCmd = "`$host.UI.RawUI.WindowTitle = 'Buchhandlung - Frontend (Angular)'; Set-Location '$frontendPath'; Write-Host '🏠 Frontend Server startet...' -ForegroundColor Cyan; pnpm start"
    }

    Start-Process pwsh -ArgumentList "-NoExit", "-Command", $frontendCmd
    Write-Success "Frontend Fenster geöffnet (Port 4200)"
} else {
    Write-Step "4/4" "Frontend übersprungen (--NoFrontend)"
}

# Zusammenfassung
Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ Stack gestartet!                     ║" -ForegroundColor Green
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
    Write-Host "║             📱 LAN Zugriff (andere Geräte)                ║" -ForegroundColor Cyan
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
    Write-Host "║  ⚠️  SSL-Warnung im Browser akzeptieren!                   ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
}

# Tunnel starten wenn aktiviert
if ($tunnel -and -not $NoFrontend) {
    Write-Host "`n"
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║             🌐 Cloudflare Tunnel starten...                ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

    Write-Host "`n>> Warte auf Frontend (15 Sek.)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15

    # Starte Tunnel als Hintergrund-Job und fange die URL ab
    # $cloudflared wurde bereits oben beim Tunnel-Check gesetzt
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
        # Dynamische Box-Breite basierend auf URL-Länge
        $urlDisplay = "  🔗 URL: $tunnelUrl"
        $boxWidth = [Math]::Max(75, $urlDisplay.Length + 4)
        $horizontalLine = "═" * ($boxWidth - 2)
        $emptyLine = " " * ($boxWidth - 2)

        Write-Host "╔$horizontalLine╗" -ForegroundColor Green
        Write-Host "║$(' ' * [Math]::Floor(($boxWidth - 22) / 2))✅ TUNNEL AKTIV!$(' ' * [Math]::Ceiling(($boxWidth - 22) / 2))║" -ForegroundColor Green
        Write-Host "╠$horizontalLine╣" -ForegroundColor Green
        Write-Host "║$emptyLine║" -ForegroundColor Green

        $urlPadding = [Math]::Max(0, $boxWidth - 2 - $urlDisplay.Length)
        Write-Host "║$urlDisplay$(' ' * $urlPadding)║" -ForegroundColor Green
        Write-Host "║$emptyLine║" -ForegroundColor Green

        $loginLine = "  🔐 Login: admin / CHANGE_ME_DEV_PASSWORD"
        $loginPadding = $boxWidth - 2 - $loginLine.Length
        Write-Host "║$loginLine$(' ' * $loginPadding)║" -ForegroundColor Green
        Write-Host "║$emptyLine║" -ForegroundColor Green

        $secLine1 = "  🛡️  Sicherheitshinweise:"
        Write-Host "║$secLine1$(' ' * ($boxWidth - 2 - $secLine1.Length))║" -ForegroundColor Green
        $secLine2 = "     • Nur Frontend ist von außen erreichbar"
        Write-Host "║$secLine2$(' ' * ($boxWidth - 2 - $secLine2.Length))║" -ForegroundColor Green
        $secLine3 = "     • Backend bleibt lokal geschützt"
        Write-Host "║$secLine3$(' ' * ($boxWidth - 2 - $secLine3.Length))║" -ForegroundColor Green
        $secLine4 = "     • URL ändert sich bei jedem Neustart"
        Write-Host "║$secLine4$(' ' * ($boxWidth - 2 - $secLine4.Length))║" -ForegroundColor Green
        Write-Host "║$emptyLine║" -ForegroundColor Green

        $shareLine = "  📤 Diese URL kannst du teilen! (Gültig bis Script-Stopp)"
        Write-Host "║$shareLine$(' ' * ($boxWidth - 2 - $shareLine.Length))║" -ForegroundColor Green
        Write-Host "║$emptyLine║" -ForegroundColor Green
        Write-Host "╚$horizontalLine╝" -ForegroundColor Green

        # URL in Zwischenablage kopieren
        $tunnelUrl | Set-Clipboard
        Write-Host "`n📋 URL wurde in die Zwischenablage kopiert!" -ForegroundColor Cyan

        # Speichere Job-ID für Stop-All.ps1
        $tunnelJob.Id | Out-File -FilePath "$ProjectRoot\.tunnel-job-id" -Force
    } else {
        Write-Host "`n⚠️  Tunnel gestartet, aber URL konnte nicht automatisch erkannt werden." -ForegroundColor Yellow
        Write-Host "   Prüfe das Tunnel-Fenster für die URL." -ForegroundColor Yellow
    }

    Write-Host "`nℹ️  Tunnel läuft im Hintergrund. Beenden mit: " -NoNewline -ForegroundColor Yellow
    Write-Host ".\Stop-All.ps1" -ForegroundColor Cyan
}

# Browser öffnen (optional)
if (-not $NoBrowser -and -not $NoFrontend) {
    Write-Host "`n⏳ Warte 8 Sekunden, dann öffne Browser..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    Start-Process "https://localhost:4200"
}

Write-Host "`nℹ️  Zum Stoppen: " -NoNewline -ForegroundColor Yellow
Write-Host ".\Stop-All.ps1" -ForegroundColor Cyan
Write-Host ""


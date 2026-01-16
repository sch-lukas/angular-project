# Stop-All.ps1 - Stoppt den kompletten Entwicklungsstack
#
# Verwendung:
#   .\Stop-All.ps1         → Stoppt alles (Docker Container + Node Prozesse)
#   .\Stop-All.ps1 -KeepDB → Stoppt nur Node, Docker Container weiterlaufen lassen
#   .\Stop-All.ps1 -docker → Stoppt den Docker-Stack (Container + Images)

param(
    [switch]$KeepDB,
    [switch]$docker
)

$ProjectRoot = $PSScriptRoot

function Write-Step($step, $description) {
    Write-Host "`n[$step] " -ForegroundColor Cyan -NoNewline
    Write-Host $description -ForegroundColor White
}

function Write-Success($message) {
    Write-Host "  ✓ $message" -ForegroundColor Green
}

# Banner
Write-Host "`n" -NoNewline
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Red
if ($docker) {
    Write-Host "║         🐳 Buchhandlung SPA - Docker Stack stoppen        ║" -ForegroundColor Red
} else {
    Write-Host "║           🛑 Buchhandlung SPA - Stack stoppen             ║" -ForegroundColor Red
}
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Red

# =============================================================================
# DOCKER-MODUS: Docker-Stack stoppen
# =============================================================================
if ($docker) {
    # Tunnel beenden
    $tunnelJobFile = Join-Path $ProjectRoot ".tunnel-job-id"
    if (Test-Path $tunnelJobFile) {
        Write-Step "1/2" "Cloudflare Tunnel beenden..."
        $tunnelJobId = Get-Content $tunnelJobFile
        $job = Get-Job -Id $tunnelJobId -ErrorAction SilentlyContinue
        if ($job) {
            Stop-Job -Job $job -ErrorAction SilentlyContinue
            Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
        }
        Remove-Item $tunnelJobFile -Force

        $cloudflaredProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($cloudflaredProcesses) {
            $cloudflaredProcesses | Stop-Process -Force
        }
        Write-Success "Tunnel beendet"
    }

    Write-Step "2/2" "Docker-Stack stoppen..."
    $dockerStackCompose = Join-Path $ProjectRoot ".extras\compose\docker-stack"

    Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "$dockerStackCompose\compose.yml", "down" -NoNewWindow -Wait
    Write-Success "Docker-Stack gestoppt"

    Write-Host "`n"
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║              🐳 Docker Stack gestoppt!                    ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# =============================================================================
# STANDARD-MODUS
# =============================================================================

# Schritt 0: Tunnel-Job beenden (falls vorhanden)
$tunnelJobFile = Join-Path $ProjectRoot ".tunnel-job-id"
if (Test-Path $tunnelJobFile) {
    Write-Step "0/4" "Cloudflare Tunnel beenden..."
    $tunnelJobId = Get-Content $tunnelJobFile
    $job = Get-Job -Id $tunnelJobId -ErrorAction SilentlyContinue
    if ($job) {
        Stop-Job -Job $job -ErrorAction SilentlyContinue
        Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
        Write-Success "Tunnel-Job beendet"
    }
    Remove-Item $tunnelJobFile -Force

    # Beende auch cloudflared Prozesse
    $cloudflaredProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($cloudflaredProcesses) {
        $cloudflaredProcesses | Stop-Process -Force
        Write-Success "cloudflared Prozesse beendet"
    }
} else {
    # Prüfe trotzdem auf laufende cloudflared Prozesse
    $cloudflaredProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($cloudflaredProcesses) {
        Write-Step "0/4" "Cloudflare Tunnel beenden..."
        $cloudflaredProcesses | Stop-Process -Force
        Write-Success "cloudflared Prozesse beendet"
    }
}

# Schritt 1: Konsolenfenster schließen (Backend + Frontend)
Write-Step "1/4" "Konsolenfenster schließen..."

# Finde PowerShell-Fenster mit unseren Titeln
$pwshProcesses = Get-Process -Name "pwsh", "powershell" -ErrorAction SilentlyContinue
$closedWindows = 0

foreach ($proc in $pwshProcesses) {
    try {
        $title = $proc.MainWindowTitle
        if ($title -like "*Buchhandlung - Backend*" -or $title -like "*Buchhandlung - Frontend*") {
            $proc | Stop-Process -Force
            $closedWindows++
        }
    } catch {
        # Ignoriere Fehler bei Prozessen ohne Fenster
    }
}

if ($closedWindows -gt 0) {
    Write-Success "$closedWindows Konsolenfenster geschlossen"
} else {
    Write-Success "Keine Buchhandlung-Fenster gefunden"
}

# Node Prozesse beenden (Backend + Frontend)
Write-Step "2/4" "Node.js Prozesse beenden..."
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Success "$($nodeProcesses.Count) Node Prozesse beendet"
} else {
    Write-Success "Keine Node Prozesse gefunden"
}

# Schritt 3: Angular CLI Prozesse
Write-Step "3/4" "Angular CLI Prozesse beenden..."
$ngProcesses = Get-Process -Name "ng" -ErrorAction SilentlyContinue
if ($ngProcesses) {
    $ngProcesses | Stop-Process -Force
    Write-Success "$($ngProcesses.Count) Angular Prozesse beendet"
} else {
    Write-Success "Keine Angular Prozesse gefunden"
}

# Schritt 4: Docker Container stoppen (wenn nicht KeepDB)
if (-not $KeepDB) {
    Write-Step "4/4" "Docker Container stoppen..."

    $postgresCompose = Join-Path $ProjectRoot ".extras\compose\postgres\compose-simple.yml"
    $keycloakCompose = Join-Path $ProjectRoot ".extras\compose\keycloak\compose-simple.yml"

    # Verwende & für korrekte Pfad-Behandlung mit Leerzeichen
    & docker compose -f "$postgresCompose" stop 2>$null
    & docker compose -f "$keycloakCompose" stop 2>$null

    Write-Success "Docker Container gestoppt"
} else {
    Write-Step "4/4" "Docker Container bleiben aktiv (--KeepDB)"
}

# Zusammenfassung
Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ Stack gestoppt!                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

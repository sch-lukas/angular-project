# Stop-All.ps1 - Stoppt den kompletten Entwicklungsstack
#
# Verwendung:
#   .\Stop-All.ps1        → Stoppt alles (Docker Container + Node Prozesse)
#   .\Stop-All.ps1 -KeepDB → Stoppt nur Node, Docker Container weiterlaufen lassen

param(
    [switch]$KeepDB
)

$ProjectRoot = "C:\software-engeneering\angular-project"

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
Write-Host "║           🛑 Buchhandlung SPA - Stack stoppen             ║" -ForegroundColor Red
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Red

# Schritt 1: Node Prozesse beenden (Backend + Frontend)
Write-Step "1/3" "Node.js Prozesse beenden..."
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Success "$($nodeProcesses.Count) Node Prozesse beendet"
} else {
    Write-Success "Keine Node Prozesse gefunden"
}

# Schritt 2: Angular CLI Prozesse
Write-Step "2/3" "Angular CLI Prozesse beenden..."
$ngProcesses = Get-Process -Name "ng" -ErrorAction SilentlyContinue
if ($ngProcesses) {
    $ngProcesses | Stop-Process -Force
    Write-Success "$($ngProcesses.Count) Angular Prozesse beendet"
} else {
    Write-Success "Keine Angular Prozesse gefunden"
}

# Schritt 3: Docker Container stoppen (wenn nicht KeepDB)
if (-not $KeepDB) {
    Write-Step "3/3" "Docker Container stoppen..."

    $postgresCompose = Join-Path $ProjectRoot ".extras\compose\postgres"
    $keycloakCompose = Join-Path $ProjectRoot ".extras\compose\keycloak"

    Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "$postgresCompose\compose.yml", "stop" -NoNewWindow -Wait
    Start-Process -FilePath "docker" -ArgumentList "compose", "-f", "$keycloakCompose\compose.yml", "stop" -NoNewWindow -Wait

    Write-Success "Docker Container gestoppt"
} else {
    Write-Step "3/3" "Docker Container bleiben aktiv (--KeepDB)"
}

# Zusammenfassung
Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ Stack gestoppt!                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

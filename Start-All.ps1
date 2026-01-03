# Start-All.ps1 - Startet den kompletten Entwicklungsstack
#
# Verwendung:
#   .\Start-All.ps1           → Startet alles (DB, Keycloak, Backend, Frontend)
#   .\Start-All.ps1 -lan      → Startet alles + Frontend im LAN-Modus
#   .\Start-All.ps1 -NoFrontend → Nur Backend-Stack (DB, Keycloak, Backend)
#
# Von überall starten:
#   & "C:\software-engeneering\angular-project\Start-All.ps1"

param(
    [switch]$lan,
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
Write-Host "║           🚀 Buchhandlung SPA - Dev Stack                 ║" -ForegroundColor Magenta
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

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

    if ($lan) {
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

# Browser öffnen (optional)
if (-not $NoBrowser -and -not $NoFrontend) {
    Write-Host "`n⏳ Warte 8 Sekunden, dann öffne Browser..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    Start-Process "https://localhost:4200"
}

Write-Host "`n💡 Zum Stoppen: " -NoNewline -ForegroundColor Yellow
Write-Host ".\Stop-All.ps1" -ForegroundColor Cyan
Write-Host ""

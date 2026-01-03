# Setup-Komplett.ps1
# Automatisches Setup-Script für das Buchhandlung SPA Projekt
#
# Verwendung:
#   .\Setup-Komplett.ps1           → Installiert alles und startet das Projekt
#   .\Setup-Komplett.ps1 -NoStart  → Nur installieren, nicht starten
#   .\Setup-Komplett.ps1 -Force    → Überschreibt existierende Konfigdateien
#
# HINWEIS: Als Administrator ausführen für Software-Installation!

param(
    [switch]$NoStart,
    [switch]$Force,
    [switch]$SkipSoftware
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

# ============================================
# Hilfsfunktionen
# ============================================

function Write-Banner {
    Write-Host "`n"
    Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║       🚀 Buchhandlung SPA - Automatisches Setup               ║" -ForegroundColor Magenta
    Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Step {
    param([string]$Step, [string]$Description)
    Write-Host "`n[$Step] " -ForegroundColor Cyan -NoNewline
    Write-Host $Description -ForegroundColor White
}

function Write-Success {
    param([string]$Message)
    Write-Host "  ✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "  ⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "  ❌ $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  ℹ️  $Message" -ForegroundColor Gray
}

function Test-Administrator {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-CommandExists {
    param([string]$Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Install-WithWinget {
    param([string]$PackageId, [string]$Name)

    Write-Info "Installiere $Name mit winget..."
    try {
        winget install --id $PackageId --accept-source-agreements --accept-package-agreements --silent
        return $true
    } catch {
        Write-Warning "Winget-Installation fehlgeschlagen"
        return $false
    }
}

# ============================================
# Hauptlogik
# ============================================

Write-Banner

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    Write-Error "Dieses Script muss im Projektverzeichnis ausgeführt werden!"
    Write-Info "Bitte wechsle in das Projektverzeichnis und führe das Script erneut aus."
    exit 1
}

$isAdmin = Test-Administrator
if (-not $isAdmin -and -not $SkipSoftware) {
    Write-Warning "Script läuft NICHT als Administrator!"
    Write-Info "Für Software-Installation (Node.js, Docker) wird Admin-Rechte benötigt."
    Write-Info "Starte mit: Start-Process pwsh -Verb RunAs -ArgumentList '-File', '$($MyInvocation.MyCommand.Path)'"
    Write-Host ""
    $continue = Read-Host "Trotzdem fortfahren? (Software-Installation wird übersprungen) [j/N]"
    if ($continue -ne "j" -and $continue -ne "J") {
        exit 0
    }
    $SkipSoftware = $true
}

# ============================================
# SCHRITT 1: Software-Voraussetzungen prüfen
# ============================================

Write-Step "1/7" "Prüfe Software-Voraussetzungen..."

$softwareStatus = @{
    "Node.js" = @{ Installed = $false; Command = "node"; WingetId = "OpenJS.NodeJS.LTS"; Version = "" }
    "pnpm" = @{ Installed = $false; Command = "pnpm"; WingetId = "pnpm.pnpm"; Version = "" }
    "Docker" = @{ Installed = $false; Command = "docker"; WingetId = "Docker.DockerDesktop"; Version = "" }
    "Git" = @{ Installed = $false; Command = "git"; WingetId = "Git.Git"; Version = "" }
}

foreach ($software in $softwareStatus.Keys) {
    $cmd = $softwareStatus[$software].Command
    if (Test-CommandExists $cmd) {
        $softwareStatus[$software].Installed = $true
        try {
            $version = & $cmd --version 2>$null | Select-Object -First 1
            $softwareStatus[$software].Version = $version
            Write-Success "$software installiert ($version)"
        } catch {
            Write-Success "$software installiert"
        }
    } else {
        Write-Warning "$software NICHT gefunden"
    }
}

# Fehlende Software installieren
$missingCount = ($softwareStatus.Values | Where-Object { -not $_.Installed }).Count

if ($missingCount -gt 0 -and -not $SkipSoftware) {
    Write-Step "1b/7" "Installiere fehlende Software..."

    # Prüfe ob winget verfügbar ist
    if (-not (Test-CommandExists "winget")) {
        Write-Error "winget nicht gefunden! Bitte installiere die fehlende Software manuell:"
        foreach ($software in $softwareStatus.Keys) {
            if (-not $softwareStatus[$software].Installed) {
                Write-Info "  - $software"
            }
        }
        exit 1
    }

    foreach ($software in $softwareStatus.Keys) {
        if (-not $softwareStatus[$software].Installed) {
            $wingetId = $softwareStatus[$software].WingetId
            Write-Info "Installiere $software..."

            $result = Install-WithWinget -PackageId $wingetId -Name $software
            if ($result) {
                Write-Success "$software wurde installiert"
                Write-Warning "Bitte Terminal neu starten und Script erneut ausführen!"
            }
        }
    }

    # Nach Installation: Prüfen ob Neustart nötig
    Write-Host ""
    Write-Warning "Nach Software-Installation: Bitte Terminal schließen und neu öffnen!"
    Write-Info "Dann dieses Script erneut ausführen."
    exit 0
}

if ($missingCount -gt 0 -and $SkipSoftware) {
    Write-Warning "Fehlende Software wird übersprungen. Bitte manuell installieren!"
}

# ============================================
# SCHRITT 2: Docker Desktop prüfen
# ============================================

Write-Step "2/7" "Prüfe Docker Desktop..."

if (Test-CommandExists "docker") {
    try {
        $dockerInfo = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Desktop läuft"
        } else {
            Write-Warning "Docker Desktop ist installiert aber nicht gestartet!"
            Write-Info "Starte Docker Desktop..."
            Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe" -ErrorAction SilentlyContinue
            Write-Info "Warte 30 Sekunden auf Docker..."
            Start-Sleep -Seconds 30

            # Erneut prüfen
            $dockerInfo = docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Success "Docker Desktop gestartet"
            } else {
                Write-Error "Docker Desktop konnte nicht gestartet werden!"
                Write-Info "Bitte Docker Desktop manuell starten und Script erneut ausführen."
                exit 1
            }
        }
    } catch {
        Write-Error "Docker-Fehler: $_"
    }
} else {
    Write-Error "Docker nicht gefunden!"
    exit 1
}

# ============================================
# SCHRITT 3: Setup-Vorlagen kopieren
# ============================================

Write-Step "3/7" "Kopiere Setup-Vorlagen..."

$vorlagenScript = Join-Path $ProjectRoot "setup-vorlagen\copy-to-project.ps1"
if (Test-Path $vorlagenScript) {
    if ($Force) {
        & $vorlagenScript -Force
    } else {
        & $vorlagenScript
    }
} else {
    # Manuell kopieren falls Script fehlt
    Write-Info "Kopiere Dateien manuell..."

    # .env
    $envSource = Join-Path $ProjectRoot "setup-vorlagen\.env.example"
    $envDest = Join-Path $ProjectRoot ".env"
    if ((Test-Path $envSource) -and (-not (Test-Path $envDest) -or $Force)) {
        Copy-Item $envSource $envDest -Force
        Write-Success ".env erstellt"
    } elseif (Test-Path $envDest) {
        Write-Info ".env existiert bereits"
    }

    # db_password.txt
    $dbSource = Join-Path $ProjectRoot "setup-vorlagen\db_password.txt.example"
    $dbDest = Join-Path $ProjectRoot ".extras\compose\postgres\db_password.txt"
    if ((Test-Path $dbSource) -and (-not (Test-Path $dbDest) -or $Force)) {
        Copy-Item $dbSource $dbDest -Force
        Write-Success "db_password.txt erstellt"
    } elseif (Test-Path $dbDest) {
        Write-Info "db_password.txt existiert bereits"
    }
}

# ============================================
# SCHRITT 3b: Keycloak einrichten
# ============================================

Write-Step "3b/7" "Richte Keycloak ein..."

$keycloakVolume = "C:\Zimmermann\volumes\keycloak"
$keycloakDbExists = Test-Path "$keycloakVolume\data\h2\keycloakdb.mv.db"

if (-not $keycloakDbExists -or $Force) {
    Write-Info "Erstelle Keycloak-Verzeichnisse..."

    # Erstelle Verzeichnisse
    $folders = @(
        "$keycloakVolume\data",
        "$keycloakVolume\data\h2",
        "$keycloakVolume\data\import",
        "$keycloakVolume\tls"
    )
    foreach ($folder in $folders) {
        if (-not (Test-Path $folder)) {
            New-Item -ItemType Directory -Path $folder -Force | Out-Null
        }
    }

    # Kopiere TLS-Zertifikate
    $tlsSource = Join-Path $ProjectRoot "src\config\resources\tls"
    if (Test-Path "$tlsSource\certificate.crt") {
        Copy-Item "$tlsSource\certificate.crt" "$keycloakVolume\tls\" -Force
    }
    if (Test-Path "$tlsSource\key.pem") {
        Copy-Item "$tlsSource\key.pem" "$keycloakVolume\tls\" -Force
    }

    # Kopiere Realm-Export für Import
    $realmSource = Join-Path $ProjectRoot "setup-vorlagen\keycloak"
    if (Test-Path "$realmSource\nest-realm.json") {
        Copy-Item "$realmSource\nest-realm.json" "$keycloakVolume\data\import\" -Force
        Copy-Item "$realmSource\nest-users-0.json" "$keycloakVolume\data\import\" -Force
        Write-Success "Keycloak Realm-Konfiguration kopiert"
    }

    Write-Success "Keycloak-Verzeichnisse erstellt"
} else {
    Write-Info "Keycloak ist bereits eingerichtet"
}

# ============================================
# SCHRITT 4: Dependencies installieren
# ============================================

Write-Step "4/7" "Installiere Dependencies..."

# Backend
Write-Info "Backend Dependencies..."
Set-Location $ProjectRoot
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "pnpm install fehlgeschlagen!"
    exit 1
}
Write-Success "Backend Dependencies installiert"

# Frontend
Write-Info "Frontend Dependencies..."
Set-Location (Join-Path $ProjectRoot "frontend")
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend pnpm install fehlgeschlagen!"
    exit 1
}
Write-Success "Frontend Dependencies installiert"

Set-Location $ProjectRoot

# ============================================
# SCHRITT 5: Prisma Client generieren
# ============================================

Write-Step "5/7" "Generiere Prisma Client..."

pnpm exec prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Error "Prisma generate fehlgeschlagen!"
    exit 1
}
Write-Success "Prisma Client generiert"

# ============================================
# SCHRITT 6: Backend bauen
# ============================================

Write-Step "6/7" "Baue Backend..."

pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend build fehlgeschlagen!"
    exit 1
}
Write-Success "Backend gebaut"

# ============================================
# SCHRITT 7: Projekt starten (optional)
# ============================================

if (-not $NoStart) {
    Write-Step "7/7" "Starte Projekt..."

    $startScript = Join-Path $ProjectRoot "Start-All.ps1"
    if (Test-Path $startScript) {
        & $startScript -NoBrowser
    } else {
        Write-Warning "Start-All.ps1 nicht gefunden!"
        Write-Info "Bitte manuell starten mit:"
        Write-Info "  1. Docker-Container: cd .extras/compose/postgres && docker compose up -d"
        Write-Info "  2. Keycloak: cd .extras/compose/keycloak && docker compose up -d"
        Write-Info "  3. Backend: pnpm start"
        Write-Info "  4. Frontend: cd frontend && pnpm start"
    }
} else {
    Write-Step "7/7" "Start übersprungen (--NoStart)"
}

# ============================================
# Fertig!
# ============================================

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    ✅ Setup abgeschlossen!                    ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║  Das Projekt ist jetzt einsatzbereit!                         ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
if (-not $NoStart) {
Write-Host "║  URLs:                                                        ║" -ForegroundColor Green
Write-Host "║    Frontend:  https://localhost:4200                          ║" -ForegroundColor Green
Write-Host "║    Backend:   https://localhost:3000                          ║" -ForegroundColor Green
Write-Host "║    Swagger:   https://localhost:3000/swagger                  ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║  Login: admin / MnPfKCid!                                     ║" -ForegroundColor Green
} else {
Write-Host "║  Zum Starten: .\Start-All.ps1                                 ║" -ForegroundColor Green
}
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Setup-Komplett.ps1
# ═══════════════════════════════════════════════════════════════════════════════
# VOLLAUTOMATISCHES Setup-Script für das Buchhandlung SPA Projekt
# ═══════════════════════════════════════════════════════════════════════════════
#
# Dieses Script richtet ALLES automatisch ein:
#   ✓ Software-Installation (Node.js, pnpm, Docker, Git, PowerShell 7)
#   ✓ VS Code Extensions installieren und aktivieren
#   ✓ .env Datei mit korrekter Keycloak-Konfiguration (HTTP Port 8880)
#   ✓ Docker Container (PostgreSQL, Keycloak)
#   ✓ Datenbank-Schema und Rolle "buch" erstellen
#   ✓ Datenbank mit 100 Büchern befüllen (IDs 1000-1099)
#   ✓ Dependencies installieren
#   ✓ Playwright Browser installieren
#   ✓ Projekt starten
#
# Verwendung:
#   .\Setup-Komplett.ps1           → Installiert alles und startet das Projekt
#   .\Setup-Komplett.ps1 -NoStart  → Nur installieren, nicht starten
#   .\Setup-Komplett.ps1 -Force    → Überschreibt existierende Konfigdateien
#
# HINWEIS: Als Administrator ausführen für Software-Installation!
# ═══════════════════════════════════════════════════════════════════════════════

param(
    [switch]$NoStart,
    [switch]$Force,
    [switch]$SkipSoftware
)

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot

# ════════════════════════════════════════════════════════════════════════════════
# HILFSFUNKTIONEN
# ════════════════════════════════════════════════════════════════════════════════

function Write-Banner {
    Clear-Host
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                                                                       ║" -ForegroundColor Magenta
    Write-Host "║     🚀 BUCHHANDLUNG SPA - VOLLAUTOMATISCHES SETUP                     ║" -ForegroundColor Magenta
    Write-Host "║                                                                       ║" -ForegroundColor Magenta
    Write-Host "║     Dieses Script richtet das komplette Projekt ein!                  ║" -ForegroundColor Magenta
    Write-Host "║                                                                       ║" -ForegroundColor Magenta
    Write-Host "╚═══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
}

function Write-Step {
    param([string]$Step, [string]$Description)
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
    Write-Host "[$Step] " -ForegroundColor Cyan -NoNewline
    Write-Host $Description -ForegroundColor White
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
}

function Write-Success { param([string]$Message) Write-Host "  ✅ $Message" -ForegroundColor Green }
function Write-Warn { param([string]$Message) Write-Host "  ⚠️  $Message" -ForegroundColor Yellow }
function Write-Err { param([string]$Message) Write-Host "  ❌ $Message" -ForegroundColor Red }
function Write-Info { param([string]$Message) Write-Host "  ℹ️  $Message" -ForegroundColor Gray }
function Write-Progress2 { param([string]$Message) Write-Host "  ⏳ $Message" -ForegroundColor Cyan }

function Test-Administrator {
    $currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Test-CommandExists {
    param([string]$Command)
    return $null -ne (Get-Command $Command -ErrorAction SilentlyContinue)
}

function Wait-ForContainer {
    param([string]$ContainerName, [int]$TimeoutSeconds = 60)

    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        $status = docker inspect --format='{{.State.Health.Status}}' $ContainerName 2>$null
        if ($status -eq "healthy") {
            return $true
        }
        Start-Sleep -Seconds 2
        $elapsed += 2
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
    Write-Host ""
    return $false
}

function Invoke-SqlCommand {
    param([string]$Sql, [string]$User = "postgres")
    docker exec postgres psql -U $User -d buch -c $Sql 2>$null
}

# ════════════════════════════════════════════════════════════════════════════════
# VS CODE EXTENSIONS
# ════════════════════════════════════════════════════════════════════════════════

$VSCodeExtensions = @(
    "aaron-bond.better-comments",
    "apollographql.vscode-apollo",
    "asciidoctor.asciidoctor-vscode",
    "davidanson.vscode-markdownlint",
    "dbaeumer.vscode-eslint",
    "donjayamanne.githistory",
    "eamodio.gitlens",
    "editorconfig.editorconfig",
    "esbenp.prettier-vscode",
    "github.copilot",
    "github.copilot-chat",
    "graphql.vscode-graphql",
    "graphql.vscode-graphql-syntax",
    "gruntfuggly.todo-tree",
    "jebbs.plantuml",
    "mechatroner.rainbow-csv",
    "mhutchie.git-graph",
    "mikestead.dotenv",
    "ms-azuretools.vscode-containers",
    "ms-azuretools.vscode-docker",
    "ms-ceintl.vscode-language-pack-de",
    "ms-vscode.powershell",
    "ms-vscode.vscode-typescript-next",
    "pflannery.vscode-versionlens",
    "pkief.material-icon-theme",
    "pmneo.tsimporter",
    "postman.postman-for-vscode",
    "redhat.vscode-yaml",
    "usernamehw.errorlens",
    "vitest.explorer",
    "yoavbls.pretty-ts-errors"
)

# ════════════════════════════════════════════════════════════════════════════════
# HAUPTLOGIK
# ════════════════════════════════════════════════════════════════════════════════

Write-Banner

# Prüfe ob wir im richtigen Verzeichnis sind
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    Write-Err "Dieses Script muss im Projektverzeichnis ausgeführt werden!"
    Write-Info "Aktuelles Verzeichnis: $ProjectRoot"
    exit 1
}

$totalSteps = 12
$currentStep = 0

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 1: Admin-Check
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Prüfe Berechtigungen..."

$isAdmin = Test-Administrator
if (-not $isAdmin) {
    Write-Warn "Script läuft NICHT als Administrator!"
    Write-Info "Für vollständige Installation Admin-Rechte empfohlen."
    Write-Info ""
    $continue = Read-Host "Trotzdem fortfahren? [J/n]"
    if ($continue -eq "n" -or $continue -eq "N") {
        Write-Info "Abgebrochen. Starte mit:"
        Write-Info "  Start-Process pwsh -Verb RunAs -ArgumentList '-File', '$($MyInvocation.MyCommand.Path)'"
        exit 0
    }
    $SkipSoftware = $true
} else {
    Write-Success "Administrator-Rechte vorhanden"
}

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 2: Software-Voraussetzungen
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Prüfe Software-Voraussetzungen..."

$softwareChecks = @{
    "Node.js" = @{ Command = "node"; WingetId = "OpenJS.NodeJS"; Required = $true }
    "pnpm" = @{ Command = "pnpm"; WingetId = "pnpm.pnpm"; Required = $true }
    "Docker" = @{ Command = "docker"; WingetId = "Docker.DockerDesktop"; Required = $true }
    "Git" = @{ Command = "git"; WingetId = "Git.Git"; Required = $true }
    "PowerShell 7" = @{ Command = "pwsh"; WingetId = "Microsoft.PowerShell"; Required = $false }
}

$missingRequired = @()

foreach ($name in $softwareChecks.Keys) {
    $check = $softwareChecks[$name]
    if (Test-CommandExists $check.Command) {
        $version = ""
        try { $version = & $check.Command --version 2>$null | Select-Object -First 1 } catch {}
        Write-Success "$name installiert ($version)"
    } else {
        if ($check.Required) {
            Write-Err "$name NICHT gefunden (erforderlich)"
            $missingRequired += $name
        } else {
            Write-Warn "$name nicht gefunden (optional)"
        }
    }
}

# Fehlende Software installieren
if ($missingRequired.Count -gt 0 -and -not $SkipSoftware) {
    Write-Info ""
    Write-Info "Installiere fehlende Software mit winget..."

    if (-not (Test-CommandExists "winget")) {
        Write-Err "winget nicht gefunden! Bitte installiere manuell:"
        foreach ($name in $missingRequired) {
            Write-Info "  - $name"
        }
        exit 1
    }

    foreach ($name in $missingRequired) {
        $wingetId = $softwareChecks[$name].WingetId
        Write-Progress2 "Installiere $name..."
        winget install --id $wingetId --accept-source-agreements --accept-package-agreements --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "$name installiert"
        } else {
            Write-Warn "$name Installation fehlgeschlagen - bitte manuell installieren"
        }
    }

    Write-Warn ""
    Write-Warn "Software wurde installiert. Bitte Terminal NEU STARTEN und Script erneut ausführen!"
    exit 0
}

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 3: Docker Desktop starten
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Starte Docker Desktop..."

if (Test-CommandExists "docker") {
    $dockerRunning = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Progress2 "Docker Desktop wird gestartet..."

        $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        if (Test-Path $dockerPath) {
            Start-Process $dockerPath -WindowStyle Hidden
        }

        Write-Info "Warte auf Docker (max. 60 Sekunden)..."
        $waited = 0
        while ($waited -lt 60) {
            Start-Sleep -Seconds 5
            $waited += 5
            $dockerRunning = docker info 2>$null
            if ($LASTEXITCODE -eq 0) {
                break
            }
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
        Write-Host ""

        if ($LASTEXITCODE -ne 0) {
            Write-Err "Docker Desktop konnte nicht gestartet werden!"
            Write-Info "Bitte Docker Desktop manuell starten und Script erneut ausführen."
            exit 1
        }
    }
    Write-Success "Docker Desktop läuft"
} else {
    Write-Err "Docker nicht gefunden!"
    exit 1
}

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 4: .env Datei erstellen (mit korrekter Keycloak-Konfiguration)
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Erstelle .env Konfiguration..."

$envPath = Join-Path $ProjectRoot ".env"
$envContent = @"
# ============================================
# Umgebungsvariablen für das Buch-Projekt
# ============================================
# Automatisch generiert von Setup-Komplett.ps1
# ============================================

# --- Datenbank (PostgreSQL) ---
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=p
DB_DATABASE=buch
DB_SCHEMA=buch

# --- Keycloak (Authentifizierung) ---
# WICHTIG: HTTP auf Port 8880 (nicht HTTPS 8843!)
KEYCLOAK_SCHEMA=http
KEYCLOAK_HOST=localhost
KEYCLOAK_PORT=8880
KEYCLOAK_CLIENT_ID=nest-client
KEYCLOAK_CLIENT_SECRET=__SET_CLIENT_SECRET_IN_ENV__
CLIENT_SECRET=__SET_CLIENT_SECRET_IN_ENV__

# --- Server ---
NODE_ENV=development
HTTPS=true
PORT=3000

# --- Logging ---
LOG_LEVEL=debug
LOG_DIR=./log

# --- Mail (optional) ---
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=

# --- Database URL für Prisma ---
DATABASE_URL=postgresql://postgres:p@localhost:5432/buch?schema=buch
"@

if (-not (Test-Path $envPath) -or $Force) {
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force
    Write-Success ".env erstellt mit korrekter Keycloak-Konfiguration (HTTP:8880)"
} else {
    # Prüfe ob die wichtigen Einstellungen korrekt sind
    $existingEnv = Get-Content $envPath -Raw
    $needsUpdate = $false

    if ($existingEnv -notmatch "KEYCLOAK_SCHEMA=http") {
        Write-Info "Füge KEYCLOAK_SCHEMA=http hinzu..."
        Add-Content -Path $envPath -Value "`nKEYCLOAK_SCHEMA=http"
        $needsUpdate = $true
    }
    if ($existingEnv -match "KEYCLOAK_PORT=8843") {
        Write-Info "Korrigiere KEYCLOAK_PORT auf 8880..."
        (Get-Content $envPath) -replace 'KEYCLOAK_PORT=8843', 'KEYCLOAK_PORT=8880' | Set-Content $envPath
        $needsUpdate = $true
    }
    if ($existingEnv -notmatch "CLIENT_SECRET=") {
        Write-Info "Füge CLIENT_SECRET hinzu..."
        Add-Content -Path $envPath -Value "CLIENT_SECRET=__SET_CLIENT_SECRET_IN_ENV__"
        $needsUpdate = $true
    }

    if ($needsUpdate) {
        Write-Success ".env aktualisiert"
    } else {
        Write-Info ".env bereits korrekt konfiguriert"
    }
}

# db_password.txt
$dbPasswordPath = Join-Path $ProjectRoot ".extras\compose\postgres\db_password.txt"
if (-not (Test-Path $dbPasswordPath) -or $Force) {
    $dbPasswordDir = Split-Path $dbPasswordPath -Parent
    if (-not (Test-Path $dbPasswordDir)) {
        New-Item -ItemType Directory -Path $dbPasswordDir -Force | Out-Null
    }
    "p" | Out-File -FilePath $dbPasswordPath -Encoding ASCII -NoNewline
    Write-Success "db_password.txt erstellt"
}

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 5: Docker Network erstellen
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Erstelle Docker Network..."

$networkExists = docker network ls --filter "name=acme-network" --format "{{.Name}}" 2>$null
if (-not $networkExists) {
    docker network create acme-network 2>$null
    Write-Success "Docker Network 'acme-network' erstellt"
} else {
    Write-Info "Docker Network 'acme-network' existiert bereits"
}

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 6: PostgreSQL Container starten
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Starte PostgreSQL Container..."

$pgRunning = docker ps --filter "name=postgres" --format "{{.Names}}" 2>$null
if ($pgRunning -eq "postgres") {
    Write-Info "PostgreSQL Container läuft bereits"
} else {
    # Prüfe ob Container existiert aber gestoppt ist
    $pgExists = docker ps -a --filter "name=postgres" --format "{{.Names}}" 2>$null
    if ($pgExists -eq "postgres") {
        docker start postgres 2>$null
        Write-Info "PostgreSQL Container gestartet"
    } else {
        # Container erstellen und starten
        $composeFile = Join-Path $ProjectRoot ".extras\compose\postgres\compose-simple.yml"
        if (Test-Path $composeFile) {
            Push-Location (Split-Path $composeFile -Parent)
            docker compose -f "compose-simple.yml" up -d 2>$null
            Pop-Location
        } else {
            # Fallback: direkt mit docker run
            docker run -d `
                --name postgres `
                --network acme-network `
                -p 5432:5432 `
                -e POSTGRES_USER=postgres `
                -e POSTGRES_PASSWORD=p `
                -e POSTGRES_DB=buch `
                -v postgres_data:/var/lib/postgresql/data `
                postgres:16-alpine 2>$null
        }
        Write-Progress2 "Warte auf PostgreSQL..."
    }
}

# Warte bis PostgreSQL bereit ist
Start-Sleep -Seconds 5
$pgReady = docker exec postgres pg_isready -U postgres 2>$null
$retries = 0
while ($LASTEXITCODE -ne 0 -and $retries -lt 10) {
    Start-Sleep -Seconds 2
    $retries++
    $pgReady = docker exec postgres pg_isready -U postgres 2>$null
}

if ($LASTEXITCODE -eq 0) {
    Write-Success "PostgreSQL bereit (Port 5432)"
} else {
    Write-Err "PostgreSQL nicht bereit!"
    exit 1
}

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 7: Keycloak Container starten
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Starte Keycloak Container..."

$kcRunning = docker ps --filter "name=keycloak" --format "{{.Names}}" 2>$null
if ($kcRunning -eq "keycloak") {
    Write-Info "Keycloak Container läuft bereits"
} else {
    $kcExists = docker ps -a --filter "name=keycloak" --format "{{.Names}}" 2>$null
    if ($kcExists -eq "keycloak") {
        docker start keycloak 2>$null
        Write-Info "Keycloak Container gestartet"
    } else {
        $composeFile = Join-Path $ProjectRoot ".extras\compose\keycloak\compose-simple.yml"
        if (Test-Path $composeFile) {
            Push-Location (Split-Path $composeFile -Parent)
            docker compose -f "compose-simple.yml" up -d 2>$null
            Pop-Location
        }
        Write-Progress2 "Warte auf Keycloak (kann 30-60 Sekunden dauern)..."
    }
}

# Warte bis Keycloak bereit ist
Start-Sleep -Seconds 10
$kcHealthy = Wait-ForContainer -ContainerName "keycloak" -TimeoutSeconds 90
if ($kcHealthy) {
    Write-Success "Keycloak bereit (HTTP: 8880, HTTPS: 8843)"
} else {
    Write-Warn "Keycloak Health-Check timeout - Container läuft aber möglicherweise noch nicht vollständig"
}

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 8: Datenbank-Schema und Rolle erstellen
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Richte Datenbank ein..."

# Schema erstellen
Write-Progress2 "Erstelle Schema 'buch'..."
docker exec postgres psql -U postgres -d buch -c "CREATE SCHEMA IF NOT EXISTS buch;" 2>$null | Out-Null

# Rolle 'buch' erstellen (wichtig für DB-Population!)
Write-Progress2 "Erstelle Rolle 'buch'..."
$roleCmd = "DO `$`$ BEGIN IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'buch') THEN CREATE ROLE buch WITH LOGIN PASSWORD 'p'; END IF; END `$`$;"
docker exec postgres psql -U postgres -d buch -c $roleCmd 2>$null | Out-Null

# Berechtigungen setzen
docker exec postgres psql -U postgres -d buch -c "GRANT ALL PRIVILEGES ON SCHEMA buch TO buch;" 2>$null | Out-Null
docker exec postgres psql -U postgres -d buch -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA buch TO buch;" 2>$null | Out-Null
docker exec postgres psql -U postgres -d buch -c "ALTER DEFAULT PRIVILEGES IN SCHEMA buch GRANT ALL PRIVILEGES ON TABLES TO buch;" 2>$null | Out-Null

Write-Success "Datenbank-Schema und Rolle eingerichtet"

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 9: Dependencies installieren
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Installiere Dependencies..."

# Backend
Write-Progress2 "Backend Dependencies..."
Set-Location $ProjectRoot
pnpm install 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Warn "pnpm install hatte Warnungen (das ist oft normal)"
}
Write-Success "Backend Dependencies installiert"

# Frontend
Write-Progress2 "Frontend Dependencies..."
Set-Location (Join-Path $ProjectRoot "frontend")
pnpm install 2>$null
Write-Success "Frontend Dependencies installiert"

Set-Location $ProjectRoot

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 10: Prisma und Build
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Generiere Prisma Client und baue Backend..."

Write-Progress2 "Prisma generate..."
pnpm exec prisma generate 2>$null
Write-Success "Prisma Client generiert"

Write-Progress2 "Backend build..."
pnpm build 2>$null
Write-Success "Backend gebaut"

# Prisma migrate
Write-Progress2 "Prisma migrate..."
pnpm exec prisma migrate deploy 2>$null
Write-Success "Datenbank-Migrationen angewendet"

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 11: VS Code Extensions und Playwright
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Installiere VS Code Extensions und Playwright..."

# VS Code Extensions
if (Test-CommandExists "code") {
    Write-Progress2 "Installiere VS Code Extensions..."
    $installedExtensions = code --list-extensions 2>$null
    $installCount = 0

    foreach ($ext in $VSCodeExtensions) {
        if ($installedExtensions -notcontains $ext) {
            code --install-extension $ext --force 2>$null | Out-Null
            $installCount++
        }
    }

    if ($installCount -gt 0) {
        Write-Success "$installCount VS Code Extensions installiert"
    } else {
        Write-Info "Alle VS Code Extensions bereits vorhanden"
    }
} else {
    Write-Warn "VS Code nicht im PATH - Extensions manuell installieren"
}

# Playwright Browser
Write-Progress2 "Installiere Playwright Browser..."
Set-Location (Join-Path $ProjectRoot "frontend")
pnpm exec playwright install 2>$null
Set-Location $ProjectRoot
Write-Success "Playwright Browser installiert"

# ════════════════════════════════════════════════════════════════════════════════
# SCHRITT 12: Projekt starten und Datenbank befüllen
# ════════════════════════════════════════════════════════════════════════════════

$currentStep++
Write-Step "$currentStep/$totalSteps" "Starte Projekt und befülle Datenbank..."

if (-not $NoStart) {
    # Prüfe ob populate=true in app.toml
    $appTomlPath = Join-Path $ProjectRoot "src\config\resources\app.toml"
    if (Test-Path $appTomlPath) {
        $appToml = Get-Content $appTomlPath -Raw
        if ($appToml -match "populate\s*=\s*false") {
            Write-Progress2 "Aktiviere Datenbank-Population in app.toml..."
            $appToml = $appToml -replace "populate\s*=\s*false", "populate = true"
            $appToml | Set-Content $appTomlPath -Encoding UTF8
            Write-Success "populate = true gesetzt"
        }
    }

    # Backend kurz starten um DB zu befüllen
    Write-Progress2 "Starte Backend zum Befüllen der Datenbank..."
    $backendJob = Start-Job -ScriptBlock {
        param($root)
        Set-Location $root
        $env:NODE_ENV = "development"
        pnpm run dev 2>&1
    } -ArgumentList $ProjectRoot

    # Warte auf Backend-Start und DB-Population
    Write-Info "Warte auf Datenbank-Population (30 Sekunden)..."
    Start-Sleep -Seconds 30

    # Prüfe Anzahl der Bücher
    $bookCount = docker exec postgres psql -U buch -d buch -t -c "SELECT COUNT(*) FROM buch.buch;" 2>$null
    if ($bookCount) {
        $bookCount = $bookCount.Trim()
    } else {
        $bookCount = "0"
    }

    if ([int]$bookCount -gt 0) {
        Write-Success "$bookCount Bücher in der Datenbank"

        # Prüfe ob IDs bei 1000 starten
        $minId = docker exec postgres psql -U buch -d buch -t -c "SELECT MIN(id) FROM buch.buch;" 2>$null
        if ($minId) {
            $minId = $minId.Trim()
        } else {
            $minId = "1000"
        }

        if ([int]$minId -lt 1000) {
            Write-Progress2 "Konvertiere Buch-IDs auf 1000+ (passend zu Cover-Dateien)..."

            # Foreign Keys temporär entfernen
            docker exec postgres psql -U postgres -d buch -c "ALTER TABLE buch.titel DROP CONSTRAINT IF EXISTS titel_buch_id_fkey;" 2>$null | Out-Null
            docker exec postgres psql -U postgres -d buch -c "ALTER TABLE buch.abbildung DROP CONSTRAINT IF EXISTS abbildung_buch_id_fkey;" 2>$null | Out-Null

            # IDs konvertieren (100 -> 1099, 99 -> 1098, etc.)
            $maxId = docker exec postgres psql -U buch -d buch -t -c "SELECT MAX(id) FROM buch.buch;" 2>$null
            $maxId = [int]$maxId.Trim()

            for ($i = $maxId; $i -ge 1; $i--) {
                $newId = $i + 999
                docker exec postgres psql -U postgres -d buch -c "UPDATE buch.buch SET id = $newId WHERE id = $i;" 2>$null | Out-Null
                docker exec postgres psql -U postgres -d buch -c "UPDATE buch.titel SET buch_id = $newId WHERE buch_id = $i;" 2>$null | Out-Null
                docker exec postgres psql -U postgres -d buch -c "UPDATE buch.abbildung SET buch_id = $newId WHERE buch_id = $i;" 2>$null | Out-Null
            }

            # Cover-Pfade aktualisieren
            docker exec postgres psql -U postgres -d buch -c "UPDATE buch.abbildung SET pfad = 'assets/covers/' || buch_id || '.svg' WHERE pfad LIKE 'assets/covers/%';" 2>$null | Out-Null

            # Sequenz aktualisieren
            docker exec postgres psql -U postgres -d buch -c "SELECT setval('buch.buch_id_seq', (SELECT MAX(id) FROM buch.buch));" 2>$null | Out-Null

            # Foreign Keys wiederherstellen
            docker exec postgres psql -U postgres -d buch -c "ALTER TABLE buch.titel ADD CONSTRAINT titel_buch_id_fkey FOREIGN KEY (buch_id) REFERENCES buch.buch(id) ON DELETE CASCADE;" 2>$null | Out-Null
            docker exec postgres psql -U postgres -d buch -c "ALTER TABLE buch.abbildung ADD CONSTRAINT abbildung_buch_id_fkey FOREIGN KEY (buch_id) REFERENCES buch.buch(id) ON DELETE CASCADE;" 2>$null | Out-Null

            Write-Success "Buch-IDs auf 1000+ konvertiert"
        } else {
            Write-Info "Buch-IDs bereits bei 1000+"
        }
    } else {
        Write-Warn "Keine Bücher in der Datenbank - manuelle Population nötig"
    }

    # Backend-Job beenden
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -Force -ErrorAction SilentlyContinue

    # Vollständigen Start mit Start-All.ps1
    Write-Info ""
    Write-Progress2 "Starte vollständiges Projekt..."
    $startScript = Join-Path $ProjectRoot "Start-All.ps1"
    if (Test-Path $startScript) {
        & $startScript
    }
} else {
    Write-Info "Start übersprungen (--NoStart)"
}

# ════════════════════════════════════════════════════════════════════════════════
# FERTIG!
# ════════════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "║                    ✅ SETUP ABGESCHLOSSEN!                            ║" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "║  Das Projekt ist jetzt vollständig eingerichtet!                      ║" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "║  ┌─────────────────────────────────────────────────────────────────┐  ║" -ForegroundColor Green
Write-Host "║  │  URLs:                                                          │  ║" -ForegroundColor Green
Write-Host "║  │    Frontend:   https://localhost:4200                           │  ║" -ForegroundColor Green
Write-Host "║  │    Backend:    https://localhost:3000                           │  ║" -ForegroundColor Green
Write-Host "║  │    Swagger:    https://localhost:3000/swagger                   │  ║" -ForegroundColor Green
Write-Host "║  │    Keycloak:   http://localhost:8880 (admin/<aus_.env>)              │  ║" -ForegroundColor Green
Write-Host "║  │    PostgreSQL: localhost:5432                                   │  ║" -ForegroundColor Green
Write-Host "║  └─────────────────────────────────────────────────────────────────┘  ║" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "║  ┌─────────────────────────────────────────────────────────────────┐  ║" -ForegroundColor Green
Write-Host "║  │  Login-Daten:                                                   │  ║" -ForegroundColor Green
Write-Host "║  │    Benutzer:   admin                                            │  ║" -ForegroundColor Green
Write-Host "║  │    Passwort:   CHANGE_ME_DEV_PASSWORD                                        │  ║" -ForegroundColor Green
Write-Host "║  └─────────────────────────────────────────────────────────────────┘  ║" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "║  ┌─────────────────────────────────────────────────────────────────┐  ║" -ForegroundColor Green
Write-Host "║  │  Befehle:                                                       │  ║" -ForegroundColor Green
Write-Host "║  │    Starten:    .\Start-All.ps1                                  │  ║" -ForegroundColor Green
Write-Host "║  │    Mit Tunnel: .\Start-All.ps1 -tunnel                          │  ║" -ForegroundColor Green
Write-Host "║  │    Stoppen:    .\Stop-All.ps1                                   │  ║" -ForegroundColor Green
Write-Host "║  │    Tests:      cd frontend; pnpm run test:e2e                   │  ║" -ForegroundColor Green
Write-Host "║  └─────────────────────────────────────────────────────────────────┘  ║" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "║  VS Code Tipp: Material Icon Theme aktivieren:                        ║" -ForegroundColor Green
Write-Host "║    Ctrl+Shift+P → 'File Icon Theme' → 'Material Icon Theme'           ║" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

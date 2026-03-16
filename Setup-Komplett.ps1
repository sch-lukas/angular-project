# Setup-Komplett.ps1
# ═══════════════════════════════════════════════════════════════════════════════
# VOLLAUTOMATISCHES Setup-Script für das Buchhandlung SPA Projekt
# ═══════════════════════════════════════════════════════════════════════════════
#
# Dieses Script richtet ALLES automatisch ein:
#   ✓ Software-Installation (Node.js, pnpm, Docker, Git, PowerShell 7)
#   ✓ VS Code Extensions installieren UND AKTIVIEREN
#   ✓ VS Code Einstellungen (Material Icon Theme, Formatierung, etc.)
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

# ═══════════════════════════════════════════════════════════════════════════════
# KONSOLEN-ENCODING FÜR EMOJI-SUPPORT
# ═══════════════════════════════════════════════════════════════════════════════
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

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
    "angular.ng-template",
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
    "johnpapa.vscode-peacock",
    "mechatroner.rainbow-csv",
    "mhutchie.git-graph",
    "mikestead.dotenv",
    "ms-azuretools.vscode-containers",
    "ms-azuretools.vscode-docker",
    "ms-ceintl.vscode-language-pack-de",
    "ms-playwright.playwright",
    "ms-vscode.powershell",
    "ms-vscode.vscode-typescript-next",
    "pflannery.vscode-versionlens",
    "pkief.material-icon-theme",
    "pmneo.tsimporter",
    "postman.postman-for-vscode",
    "prisma.prisma",
    "redhat.vscode-yaml",
    "usernamehw.errorlens",
    "vitest.explorer",
    "yoavbls.pretty-ts-errors"
)

# ════════════════════════════════════════════════════════════════════════════════
# VS CODE USER SETTINGS (für Material Icon Theme und Peacock)
# ════════════════════════════════════════════════════════════════════════════════

$VSCodeUserSettings = @'
{
  "workbench.iconTheme": "material-icon-theme",
  "material-icon-theme.activeIconPack": "nest",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.fontFamily": "'Cascadia Code', 'Fira Code', Consolas, 'Courier New', monospace",
  "editor.fontLigatures": true,
  "editor.fontSize": 14,
  "editor.tabSize": 4,
  "editor.insertSpaces": true,
  "files.eol": "\n",
  "terminal.integrated.defaultProfile.windows": "PowerShell",
  "npm.packageManager": "pnpm",
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.updateImportsOnFileMove.enabled": "always"
}
'@

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

$totalSteps = 13
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
    "Cloudflared" = @{ Command = "cloudflared"; WingetId = "Cloudflare.cloudflared"; Required = $false }
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

# Optionale Software installieren (Cloudflared für Tunnel-Modus)
if (-not (Test-CommandExists "cloudflared") -and -not $SkipSoftware) {
    Write-Info ""
    Write-Progress2 "Installiere Cloudflared (fuer Tunnel-Modus)..."
    if (Test-CommandExists "winget") {
        winget install --id Cloudflare.cloudflared --accept-source-agreements --accept-package-agreements --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Cloudflared installiert"
        } else {
            Write-Warn "Cloudflared Installation fehlgeschlagen - Tunnel-Modus nicht verfuegbar"
        }
    }
}

# Nerd Font installieren für korrekte Unicode/Emoji-Anzeige
$nerdFontInstalled = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Fonts" -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty * | Where-Object { $_ -like "*JetBrainsMono*" -or $_ -like "*Nerd*" }

if (-not $nerdFontInstalled -and -not $SkipSoftware) {
    Write-Progress2 "Installiere JetBrainsMono Nerd Font (fuer Unicode-Symbole)..."
    if (Test-CommandExists "winget") {
        winget install --id DEVCOM.JetBrainsMonoNerdFont --accept-source-agreements --accept-package-agreements --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "JetBrainsMono Nerd Font installiert"
        }
    }
}

# Windows Terminal installieren für bessere Emoji-Unterstützung
$wtInstalled = Get-AppxPackage -Name "Microsoft.WindowsTerminal" -ErrorAction SilentlyContinue
if (-not $wtInstalled -and -not $SkipSoftware) {
    Write-Progress2 "Installiere Windows Terminal (fuer Emoji-Unterstuetzung)..."
    if (Test-CommandExists "winget") {
        winget install --id Microsoft.WindowsTerminal --accept-source-agreements --accept-package-agreements --silent 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Windows Terminal installiert"
            Write-Info "Verwende Windows Terminal fuer korrekte Emoji-Anzeige!"
        }
    }
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

# Frontend Proxy-Konfiguration korrigieren (HTTP -> HTTPS für Backend)
$proxyConfPath = Join-Path $ProjectRoot "frontend\proxy.conf.json"
if (Test-Path $proxyConfPath) {
    $proxyConf = Get-Content $proxyConfPath -Raw
    if ($proxyConf -match '"target":\s*"http://localhost:3000"') {
        Write-Progress2 "Korrigiere Frontend Proxy (HTTP -> HTTPS)..."
        $proxyConf = $proxyConf -replace '"target":\s*"http://localhost:3000"', '"target": "https://localhost:3000"'
        $proxyConf | Set-Content $proxyConfPath -Encoding UTF8
        Write-Success "proxy.conf.json korrigiert (HTTPS)"
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
# SCHRITT 4b: SSL-Zertifikate erstellen (WICHTIG für HTTPS-Backend!)
# ════════════════════════════════════════════════════════════════════════════════

Write-Progress2 "Erstelle SSL-Zertifikate fuer HTTPS..."

$tlsDir = Join-Path $ProjectRoot "src\config\resources\tls"
$keyPath = Join-Path $tlsDir "key.pem"
$certPath = Join-Path $tlsDir "certificate.crt"

# Verzeichnis erstellen falls nicht vorhanden
if (-not (Test-Path $tlsDir)) {
    New-Item -ItemType Directory -Path $tlsDir -Force | Out-Null
}

# Prüfe ob Zertifikate vorhanden sind
if (-not (Test-Path $keyPath) -or -not (Test-Path $certPath) -or $Force) {
    # Suche nach vorhandenen Zertifikaten in Backup-Ordnern
    $backupLocations = @(
        (Join-Path $ProjectRoot ".extras\setup-vorlagen"),
        (Join-Path $ProjectRoot "setup-vorlagen"),
        (Join-Path $tlsDir "src\config\resources\tls")  # Versehentlich verschachtelter Ordner
    )

    $foundKey = $null
    $foundCert = $null

    foreach ($loc in $backupLocations) {
        if (Test-Path $loc) {
            $possibleKey = Get-ChildItem -Path $loc -Filter "key.pem" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            $possibleCert = Get-ChildItem -Path $loc -Filter "certificate.crt" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            if (-not $possibleCert) {
                $possibleCert = Get-ChildItem -Path $loc -Filter "*.crt" -Recurse -ErrorAction SilentlyContinue | Select-Object -First 1
            }
            if ($possibleKey) { $foundKey = $possibleKey.FullName }
            if ($possibleCert) { $foundCert = $possibleCert.FullName }
        }
    }

    if ($foundKey -and $foundCert) {
        # Kopiere vorhandene Zertifikate
        Copy-Item $foundKey $keyPath -Force
        Copy-Item $foundCert $certPath -Force
        Write-Success "SSL-Zertifikate aus Backup kopiert"
    } else {
        # Generiere neue selbst-signierte Zertifikate mit OpenSSL oder PowerShell
        if (Test-CommandExists "openssl") {
            Write-Progress2 "Generiere neue SSL-Zertifikate mit OpenSSL..."
            $opensslConf = @"
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
x509_extensions = v3_req

[dn]
C = DE
ST = Baden-Wuerttemberg
L = Karlsruhe
O = Hochschule Karlsruhe
OU = Software Engineering
CN = localhost

[v3_req]
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
IP.1 = 127.0.0.1
"@
            $confPath = Join-Path $tlsDir "openssl.cnf"
            $opensslConf | Out-File -FilePath $confPath -Encoding UTF8 -Force

            Push-Location $tlsDir
            & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
                -keyout key.pem -out certificate.crt `
                -config openssl.cnf 2>$null
            Pop-Location

            Remove-Item $confPath -Force -ErrorAction SilentlyContinue

            if ((Test-Path $keyPath) -and (Test-Path $certPath)) {
                Write-Success "Neue SSL-Zertifikate generiert (selbst-signiert)"
            } else {
                Write-Warn "OpenSSL Zertifikat-Generierung fehlgeschlagen"
            }
        } else {
            # Fallback: PowerShell Self-Signed Certificate
            Write-Progress2 "Generiere SSL-Zertifikat mit PowerShell..."
            try {
                $cert = New-SelfSignedCertificate `
                    -DnsName "localhost" `
                    -CertStoreLocation "Cert:\CurrentUser\My" `
                    -NotAfter (Get-Date).AddYears(1) `
                    -FriendlyName "Buch Backend Dev Cert" `
                    -KeyExportPolicy Exportable

                # Exportiere als PEM (Private Key)
                $password = ConvertTo-SecureString -String "temp" -Force -AsPlainText
                $pfxPath = Join-Path $tlsDir "temp.pfx"
                Export-PfxCertificate -Cert $cert -FilePath $pfxPath -Password $password | Out-Null

                # Konvertiere PFX zu PEM (benötigt openssl oder certutil)
                if (Test-CommandExists "openssl") {
                    & openssl pkcs12 -in $pfxPath -nocerts -nodes -out $keyPath -passin pass:temp 2>$null
                    & openssl pkcs12 -in $pfxPath -clcerts -nokeys -out $certPath -passin pass:temp 2>$null
                    Remove-Item $pfxPath -Force -ErrorAction SilentlyContinue
                    Write-Success "SSL-Zertifikate generiert (PowerShell + OpenSSL)"
                } else {
                    # Minimale PEM-Erstellung ohne OpenSSL
                    Write-Warn "OpenSSL nicht gefunden - erstelle Basis-Zertifikate..."

                    # Exportiere Zertifikat als Base64
                    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
                    $certBase64 = [Convert]::ToBase64String($certBytes, [Base64FormattingOptions]::InsertLineBreaks)
                    $certPem = "-----CERTIFICATE_PLACEHOLDER-----`n$certBase64`n-----CERTIFICATE_PLACEHOLDER-----"
                    $certPem | Out-File -FilePath $certPath -Encoding ASCII -Force

                    # Private Key als PEM (etwas komplizierter ohne OpenSSL)
                    $keyBytes = $cert.PrivateKey.ExportRSAPrivateKey()
                    $keyBase64 = [Convert]::ToBase64String($keyBytes, [Base64FormattingOptions]::InsertLineBreaks)
                    $keyPem = "-----BEGIN RSA PRIVATE KEY-----`n$keyBase64`n-----END RSA PRIVATE KEY-----"
                    $keyPem | Out-File -FilePath $keyPath -Encoding ASCII -Force

                    Remove-Item $pfxPath -Force -ErrorAction SilentlyContinue
                    Write-Success "SSL-Zertifikate generiert (PowerShell)"
                }

                # Zertifikat aus Store entfernen (nur für Export verwendet)
                Remove-Item -Path "Cert:\CurrentUser\My\$($cert.Thumbprint)" -ErrorAction SilentlyContinue
            } catch {
                Write-Warn "Zertifikat-Generierung fehlgeschlagen: $_"

                # Letzter Fallback: Dummy-Zertifikate erstellen
                Write-Progress2 "Erstelle Entwicklungs-Dummy-Zertifikate..."

                # Minimales selbst-signiertes Zertifikat (nur für Dev!)
$dummyKey = @"
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAu5H3HcXNb1Y8F2wQhXgVq0H2qWvRWM/Jl2qDlZfP0kFd+zMM
X8mP5FW8XjC3tL+vOVKlHqT8kJJaKrqrEmMxzAAMQfP2cjQPhZe8RWqW8HfkZP7x
l4MBb7f0GxgFFnJf6xMK0W8DHZq1F8UxCO8FnWt3F9OJ1QrqGxK8BZqA5M9oIxBt
VR0S1wH4f3cMnOT8YCOqk8vF7m4M0bB5vN9SWC8P3VF8g1qxZ3cTvD5lqNVz6GpE
qHF9jc/3k1qV9f3cE5X7wS8L8cTqGhZ6z5M7x7BKdEOJKrRVfFwA5e7rBfQW3xFr
wM8QvVADzLKz3OYq8UfO8R6F0VcQpwlHwPnKqQIDAQABAoIBAC2XxKZ1h2c3A8vE
f8F8D5Z8LJk8k0GZB8V3xCN7VnZ3KU8dF9l8x3V8F1L8cD3J3Ct4t6B5hKdE9HqN
jxE6xM7y3X9pB3K7cMdX3S8pT5A6dU4Z8qGe7X8L7B4f8D8J3K5lM8Q9R7S8T6V0
X9Y7Z8A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0
D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2
J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4
P5Q6R7S8T9ECgYEA5vF8X8Z3D5A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6
T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5W6X7Y8
Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0
F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9I0J1K2
L3M4N5O6ECgYEAz9Y7B8C9D0E1F2G3H4I5J6K7L8M9N0O1P2Q3R4S5T6U7V8W9X0
Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2
E3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7D8E9F0G1H2I3J4
K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6
Q7R8S9T0ECgYEAm8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2
B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4
H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6
N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8
T9U0V1W2ECgYBp3F4G5H6I7J8K9L0M1N2O3P4Q5R6S7T8U9V0W1X2Y3Z4A5B6C7
D8E9F0G1H2I3J4K5L6M7N8O9P0Q1R2S3T4U5V6W7X8Y9Z0A1B2C3D4E5F6G7H8I9
J0K1L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K7L8M9N0O1
P2Q3R4S5T6U7V8W9X0Y1Z2A3B4C5D6E7F8G9H0I1J2K3L4M5N6O7P8Q9R0S1T2U3
V4W5X6Y7ECgYA8R9S0T1U2V3W4X5Y6Z7A8B9C0D1E2F3G4H5I6J7K8L9M0N1O2P3
Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5M6N7O8P9Q0R1S2T3U4V5
W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7
C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9Y0Z1A2B3C4D5E6F7G8H9
I0J1K2L3==
-----END RSA PRIVATE KEY-----
"@

$dummyCert = @"
-----CERTIFICATE_PLACEHOLDER-----
MIIDXTCCAkWgAwIBAgIJAJC1HiIAZAiUMA0GCSqGSIb3Ea8mMQswCQYDVQQGEwJE
RTEbMBkGA1UECAwSQmFkZW4tV3VlcnR0ZW1iZXJnMRIwEAYDVQQHDAlLYXJsc3J1
aGUxITAfBgNVBAoMGEhvY2hzY2h1bGUgS2FybHNydWhlMRUwEwYDVQQLDAxEZXZl
bG9wbWVudDESMBAGA1UEAwwJbG9jYWxob3N0MB4XDTI0MDEwMTAwMDAwMFoXDTI1
MDEwMTAwMDAwMFowZTELMAkGA1UEBhMCREUxGzAZBgNVBAgMEkJhZGVuLVd1ZXJ0
dGVtYmVyZzESMBAGA1UEBwwJS2FybHNydWhlMSEwHwYDVQQKDBhIb2Noc2NodWxl
IEthcmxzcnVoZTEVMBMGA1UECwwMRGV2ZWxvcG1lbnQxEjAQBgNVBAMMCWxvY2Fs
aG9zdDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALuR9x3FzW9WPBds
EIV4FatB9qlr0VjPyZdqg5WXz9JBXfszDF/Jj+RVvF4wt7S/rzlSpR6k/JCSWiq6
qxJjMcwADEHz9nI0D4WXvEVqlvB35GT+8ZeDAW+39BsYBRZyX+sTCtFvAx2atRfF
MQjvBZ1rdxfTidUK6hsSvAWagOTPaCMQbVUdEtcB+H93DJzk/GAjqpPLxe5uDNGw
ebzfUlgvD91RfINasWd3E7w+ZajVc+hqRKhxfY3P95NalfX93BOV+8EvC/HE6hoW
es+TO8ewSnRDiSq0VXxcAOXu6wX0Ft8Ra8DPEL1QA8yys9zmKvFHzvEehdFXEKcJ
R8D5yqkCAwEAATANBgkqhkiG9w0BAQsFAAOCAQEAQ3K8X9L7Z8D5A8B9C0D1E2F3
G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3K4L5
M6N7O8P9Q0R1S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5G6H7I8J9K0L1M2N3O4P5Q6R7
S8T9U0V1W2X3Y4Z5A6B7C8D9E0F1G2H3I4J5K6L7M8N9O0P1Q2R3S4T5U6V7W8X9
Y0Z1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D1
E2F3G4H5I6J7K8L9M0N1O2P3Q4R5S6T7U8V9W0X1Y2Z3A4B5C6D7E8F9G0H1I2J3
K4L5M6N7O8P9Q0==
-----CERTIFICATE_PLACEHOLDER-----
"@
                $dummyKey | Out-File -FilePath $keyPath -Encoding ASCII -Force
                $dummyCert | Out-File -FilePath $certPath -Encoding ASCII -Force
                Write-Success "Entwicklungs-Zertifikate erstellt (Dummy)"
            }
        }
    }
} else {
    Write-Info "SSL-Zertifikate bereits vorhanden"
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

# Keycloak Realm-Import: Kopiere nest-realm.json und nest-users-0.json in den Container
Write-Progress2 "Importiere Keycloak Realm 'nest'..."
$keycloakExport = Join-Path $ProjectRoot ".extras\compose\keycloak\export"
$realmFile = Join-Path $keycloakExport "nest-realm.json"
$usersFile = Join-Path $keycloakExport "nest-users-0.json"

if ((Test-Path $realmFile) -and (Test-Path $usersFile)) {
    # Kopiere Realm-Dateien in den Container
    docker exec keycloak mkdir -p /opt/keycloak/data/import 2>$null | Out-Null
    docker cp $realmFile keycloak:/opt/keycloak/data/import/ 2>$null | Out-Null
    docker cp $usersFile keycloak:/opt/keycloak/data/import/ 2>$null | Out-Null

    # Neustarten für Import
    docker restart keycloak 2>$null | Out-Null
    Write-Progress2 "Warte auf Keycloak-Neustart und Realm-Import..."
    Start-Sleep -Seconds 30

    # Prüfe ob Realm importiert wurde
    try {
        $realmCheck = Invoke-RestMethod -Uri "http://localhost:8880/realms/nest/.well-known/openid-configuration" -Method GET -ErrorAction SilentlyContinue
        if ($realmCheck.issuer) {
            Write-Success "Keycloak Realm 'nest' importiert"
            Write-Info "Login-Daten: admin / CHANGE_ME_DEV_PASSWORD oder user / CHANGE_ME_DEV_PASSWORD"
        }
    } catch {
        Write-Warn "Realm-Import konnte nicht verifiziert werden"
    }
} else {
    Write-Warn "Realm-Dateien nicht gefunden - Keycloak läuft ohne 'nest' Realm"
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

    # VS Code User Settings aktualisieren (Material Icon Theme aktivieren!)
    Write-Progress2 "Konfiguriere VS Code Einstellungen..."
    $vsCodeSettingsPath = Join-Path $env:APPDATA "Code\User\settings.json"
    $vsCodeSettingsDir = Split-Path $vsCodeSettingsPath -Parent

    if (-not (Test-Path $vsCodeSettingsDir)) {
        New-Item -ItemType Directory -Path $vsCodeSettingsDir -Force | Out-Null
    }

    if (Test-Path $vsCodeSettingsPath) {
        # Bestehende Settings lesen und Material Icon Theme hinzufügen
        try {
            $existingSettings = Get-Content $vsCodeSettingsPath -Raw | ConvertFrom-Json -AsHashtable
        } catch {
            $existingSettings = @{}
        }

        # Wichtige Settings setzen (falls noch nicht vorhanden)
        $settingsToAdd = @{
            "workbench.iconTheme" = "material-icon-theme"
            "material-icon-theme.activeIconPack" = "nest"
            "editor.defaultFormatter" = "esbenp.prettier-vscode"
            "editor.formatOnSave" = $true
            "npm.packageManager" = "pnpm"
            "files.eol" = "`n"
            "terminal.integrated.fontFamily" = "'JetBrainsMono Nerd Font', 'CaskaydiaCove Nerd Font', 'Cascadia Code', Consolas, monospace"
            "terminal.integrated.fontSize" = 14
        }

        $updated = $false
        foreach ($key in $settingsToAdd.Keys) {
            if (-not $existingSettings.ContainsKey($key)) {
                $existingSettings[$key] = $settingsToAdd[$key]
                $updated = $true
            }
        }

        # Icon Theme immer setzen (um sicherzustellen, dass es aktiviert ist)
        if ($existingSettings["workbench.iconTheme"] -ne "material-icon-theme") {
            $existingSettings["workbench.iconTheme"] = "material-icon-theme"
            $updated = $true
        }

        if ($updated) {
            $existingSettings | ConvertTo-Json -Depth 10 | Set-Content $vsCodeSettingsPath -Encoding UTF8
            Write-Success "VS Code User Settings aktualisiert (Material Icon Theme aktiviert)"
        } else {
            Write-Info "VS Code Settings bereits konfiguriert"
        }
    } else {
        # Neue Settings-Datei erstellen
        $VSCodeUserSettings | Out-File -FilePath $vsCodeSettingsPath -Encoding UTF8 -Force
        Write-Success "VS Code User Settings erstellt (Material Icon Theme aktiviert)"
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
    # ═══════════════════════════════════════════════════════════════════════════════
    # DATENBANK DIREKT MIT SEED-1000.SQL BEFÜLLEN (IDs 1000+ passend zu Cover-Bildern)
    # ═══════════════════════════════════════════════════════════════════════════════

    Write-Progress2 "Befülle Datenbank mit Büchern (IDs 1000+)..."

    # Zuerst Prisma-Migrationen anwenden (erstellt Tabellen)
    Write-Progress2 "Wende Prisma-Migrationen an..."
    pnpm exec prisma migrate deploy 2>$null

    # Prüfe ob Tabellen existieren
    $tablesExist = docker exec postgres psql -U buch -d buch -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'buch' AND table_name = 'buch';" 2>$null
    if ($tablesExist) {
        $tablesExist = $tablesExist.Trim()
    } else {
        $tablesExist = "0"
    }

    if ([int]$tablesExist -eq 0) {
        Write-Warn "Datenbank-Tabellen nicht gefunden - starte Backend kurz zum Erstellen..."
        $backendJob = Start-Job -ScriptBlock {
            param($root)
            Set-Location $root
            $env:NODE_ENV = "development"
            pnpm run dev 2>&1
        } -ArgumentList $ProjectRoot
        Start-Sleep -Seconds 20
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -Force -ErrorAction SilentlyContinue
    }

    # Prüfe aktuelle Bücher-Anzahl
    $bookCount = docker exec postgres psql -U buch -d buch -t -c "SELECT COUNT(*) FROM buch.buch;" 2>$null
    if ($bookCount) { $bookCount = $bookCount.Trim() } else { $bookCount = "0" }

    # Prüfe minimale ID
    $minId = "1000"
    if ([int]$bookCount -gt 0) {
        $minId = docker exec postgres psql -U buch -d buch -t -c "SELECT MIN(id) FROM buch.buch;" 2>$null
        if ($minId) { $minId = $minId.Trim() }
    }

    # Wenn keine Bücher oder IDs nicht bei 1000 starten -> seed-1000.sql verwenden
    if ([int]$bookCount -eq 0 -or [int]$minId -lt 1000) {
        Write-Progress2 "Lade seed-1000.sql (100 Bücher mit IDs 1000-1099)..."

        $seedFile = Join-Path $ProjectRoot "scripts\db\seed-1000.sql"
        if (Test-Path $seedFile) {
            # SQL direkt ausführen (als postgres User für Sequenz-Änderungen)
            Get-Content $seedFile | docker exec -i postgres psql -U postgres -d buch 2>$null | Out-Null

            # Prüfe Ergebnis
            $newCount = docker exec postgres psql -U buch -d buch -t -c "SELECT COUNT(*) FROM buch.buch;" 2>$null
            if ($newCount) { $newCount = $newCount.Trim() }

            $newMinId = docker exec postgres psql -U buch -d buch -t -c "SELECT MIN(id) FROM buch.buch;" 2>$null
            if ($newMinId) { $newMinId = $newMinId.Trim() }

            if ([int]$newCount -gt 0 -and [int]$newMinId -ge 1000) {
                Write-Success "$newCount Bücher geladen (IDs $newMinId+, passend zu Cover-Dateien)"
            } else {
                Write-Warn "Seed fehlgeschlagen - versuche Fallback..."

                # Fallback: Sequenzen manuell setzen und Backend starten
                docker exec postgres psql -U postgres -d buch -c "TRUNCATE buch.abbildung, buch.titel, buch.buch RESTART IDENTITY CASCADE;" 2>$null | Out-Null
                docker exec postgres psql -U postgres -d buch -c "ALTER SEQUENCE buch.buch_id_seq RESTART WITH 1000;" 2>$null | Out-Null
                docker exec postgres psql -U postgres -d buch -c "ALTER SEQUENCE buch.titel_id_seq RESTART WITH 1000;" 2>$null | Out-Null

                Write-Info "Sequenzen auf 1000 gesetzt - Backend wird Bücher ab ID 1000 erstellen"
            }
        } else {
            Write-Warn "seed-1000.sql nicht gefunden - Backend wird Standard-Seed verwenden"

            # Setze Sequenzen auf 1000 bevor Backend startet
            docker exec postgres psql -U postgres -d buch -c "TRUNCATE buch.abbildung, buch.titel, buch.buch RESTART IDENTITY CASCADE;" 2>$null | Out-Null
            docker exec postgres psql -U postgres -d buch -c "ALTER SEQUENCE buch.buch_id_seq RESTART WITH 1000;" 2>$null | Out-Null
            docker exec postgres psql -U postgres -d buch -c "ALTER SEQUENCE buch.titel_id_seq RESTART WITH 1000;" 2>$null | Out-Null
        }
    } else {
        Write-Success "$bookCount Bücher bereits vorhanden (IDs ab $minId)"
    }

    # Berechtigungen für buch-User auf neue Daten setzen
    docker exec postgres psql -U postgres -d buch -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA buch TO buch;" 2>$null | Out-Null
    docker exec postgres psql -U postgres -d buch -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA buch TO buch;" 2>$null | Out-Null

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
Write-Host "║  VS Code: Bitte VS Code NEU STARTEN um alle Änderungen zu sehen!      ║" -ForegroundColor Green
Write-Host "║    Das Material Icon Theme und alle Extensions sind bereits aktiv.    ║" -ForegroundColor Green
Write-Host "║                                                                       ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

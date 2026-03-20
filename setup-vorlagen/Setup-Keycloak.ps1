# Setup-Keycloak.ps1
# Richtet Keycloak beim ersten Start automatisch ein
#
# Verwendung: .\setup-vorlagen\Setup-Keycloak.ps1

param(
    [switch]$Force  # Überschreibt auch wenn bereits eingerichtet
)

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$KeycloakVolume = "C:\Zimmermann\volumes\keycloak"
$SetupVorlagen = Join-Path $ProjectRoot "setup-vorlagen\keycloak"

function Get-EnvValue {
    param([string]$Name, [string]$EnvPath)
    if (-not (Test-Path $EnvPath)) {
        return $null
    }
    $line = Get-Content $EnvPath | Where-Object { $_ -match "^$Name=" } | Select-Object -First 1
    if (-not $line) {
        return $null
    }
    return ($line -split '=', 2)[1]
}

function Set-EnvValue {
    param([string]$Name, [string]$Value, [string]$EnvPath)
    if (-not (Test-Path $EnvPath)) {
        return
    }
    $content = Get-Content $EnvPath -Raw
    if ($content -match "(?m)^$Name=") {
        $updated = [regex]::Replace($content, "(?m)^$Name=.*$", "$Name=$Value")
    } else {
        $updated = "$content`r`n$Name=$Value`r`n"
    }
    Set-Content -Path $EnvPath -Value $updated -Encoding UTF8
}

function Ensure-TlsCertificates {
    param([string]$Root)
    $tlsDir = Join-Path $Root "src\config\resources\tls"
    $keyFile = Join-Path $tlsDir "key.pem"
    $certFile = Join-Path $tlsDir "certificate.crt"

    if ((Test-Path $keyFile) -and (Test-Path $certFile)) {
        return
    }

    if (-not (Test-Path $tlsDir)) {
        New-Item -ItemType Directory -Path $tlsDir -Force | Out-Null
    }

    if (Get-Command openssl -ErrorAction SilentlyContinue) {
        & openssl req -x509 -newkey rsa:4096 -keyout $keyFile -out $certFile -days 365 -nodes -subj "/CN=localhost" | Out-Null
        return
    }

    $tlsDirForDocker = (Resolve-Path $tlsDir).Path -replace '\\', '/'
    docker run --rm -v "${tlsDirForDocker}:/tls" alpine/openssl req -x509 -newkey rsa:4096 -keyout /tls/key.pem -out /tls/certificate.crt -days 365 -nodes -subj "/CN=localhost" | Out-Null
}

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🔐 Keycloak Ersteinrichtung                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$envPath = Join-Path $ProjectRoot ".env"
$adminPassword = Get-EnvValue -Name "KEYCLOAK_ADMIN_PASSWORD" -EnvPath $envPath
if ([string]::IsNullOrWhiteSpace($adminPassword) -or $adminPassword -like "CHANGE_ME*") {
    $adminPassword = Read-Host "Keycloak Admin Passwort eingeben"
    if (-not [string]::IsNullOrWhiteSpace($adminPassword)) {
        Set-EnvValue -Name "KEYCLOAK_ADMIN_PASSWORD" -Value $adminPassword -EnvPath $envPath
    }
}

Ensure-TlsCertificates -Root $ProjectRoot

# Prüfe ob Keycloak-Volume existiert
$dataFolder = Join-Path $KeycloakVolume "data\h2"
$alreadySetup = Test-Path (Join-Path $dataFolder "keycloakdb.mv.db")

if ($alreadySetup -and -not $Force) {
    Write-Host "`n  ✅ Keycloak ist bereits eingerichtet!" -ForegroundColor Green
    Write-Host "     (Verwende -Force zum Zurücksetzen)" -ForegroundColor Gray
    exit 0
}

Write-Host "`n[1/4] Erstelle Keycloak-Verzeichnisse..." -ForegroundColor White

# Erstelle Verzeichnisstruktur
$folders = @(
    "$KeycloakVolume\data",
    "$KeycloakVolume\data\h2",
    "$KeycloakVolume\data\import",
    "$KeycloakVolume\tls"
)

foreach ($folder in $folders) {
    if (-not (Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  ✅ Erstellt: $folder" -ForegroundColor Green
    } else {
        Write-Host "  ⏭️  Existiert: $folder" -ForegroundColor Gray
    }
}

Write-Host "`n[2/4] Kopiere TLS-Zertifikate..." -ForegroundColor White

# Kopiere TLS-Zertifikate
$tlsSource = Join-Path $ProjectRoot "src\config\resources\tls"
$tlsDest = "$KeycloakVolume\tls"

if (Test-Path "$tlsSource\certificate.crt") {
    Copy-Item "$tlsSource\certificate.crt" "$tlsDest\certificate.crt" -Force
    Write-Host "  ✅ certificate.crt kopiert" -ForegroundColor Green
} else {
    Write-Host "  ❌ certificate.crt nicht gefunden!" -ForegroundColor Red
}

if (Test-Path "$tlsSource\key.pem") {
    Copy-Item "$tlsSource\key.pem" "$tlsDest\key.pem" -Force
    Write-Host "  ✅ key.pem kopiert" -ForegroundColor Green
} else {
    Write-Host "  ❌ key.pem nicht gefunden!" -ForegroundColor Red
}

Write-Host "`n[3/4] Kopiere Realm-Konfiguration für Import..." -ForegroundColor White

# Kopiere Realm-Export für Import
$importDest = "$KeycloakVolume\data\import"

if (Test-Path "$SetupVorlagen\nest-realm.json") {
    Copy-Item "$SetupVorlagen\nest-realm.json" "$importDest\" -Force
    Write-Host "  ✅ nest-realm.json kopiert" -ForegroundColor Green
} else {
    Write-Host "  ❌ nest-realm.json nicht gefunden!" -ForegroundColor Red
}

if (Test-Path "$SetupVorlagen\nest-users-0.json") {
    Copy-Item "$SetupVorlagen\nest-users-0.json" "$importDest\" -Force
    Write-Host "  ✅ nest-users-0.json kopiert" -ForegroundColor Green
} else {
    Write-Host "  ❌ nest-users-0.json nicht gefunden!" -ForegroundColor Red
}

Write-Host "`n[4/4] Starte Keycloak mit Import..." -ForegroundColor White

# Starte Keycloak einmalig mit Import
$keycloakCompose = Join-Path $ProjectRoot ".extras\compose\keycloak"

Write-Host "  ℹ️  Starte Keycloak (Import kann 30-60 Sekunden dauern)..." -ForegroundColor Yellow

# Starte mit Import-Flag
docker run --rm `
    -v "${KeycloakVolume}/data:/opt/keycloak/data" `
    -v "${KeycloakVolume}/tls/key.pem:/opt/keycloak/conf/key.pem:ro" `
    -v "${KeycloakVolume}/tls/certificate.crt:/opt/keycloak/conf/certificate.crt:ro" `
    -e KC_BOOTSTRAP_ADMIN_USERNAME=admin `
    -e KC_BOOTSTRAP_ADMIN_PASSWORD=$adminPassword `
    quay.io/keycloak/keycloak:26.4.5-0 `
    import --dir /opt/keycloak/data/import 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Realm importiert!" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Import möglicherweise fehlgeschlagen (kann ignoriert werden wenn Realm bereits existiert)" -ForegroundColor Yellow
}

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║               ✅ Keycloak eingerichtet!                   ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║  Admin-Konsole: https://localhost:8843/admin              ║" -ForegroundColor Green
Write-Host "║  Realm:         nest                                      ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "║  Admin-Passwort: siehe KEYCLOAK_ADMIN_PASSWORD in .env   ║" -ForegroundColor Green
Write-Host "║  App-Passwort:   siehe KEYCLOAK_APP_PASSWORD in .env     ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

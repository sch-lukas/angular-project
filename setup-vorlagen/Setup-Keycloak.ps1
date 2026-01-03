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

Write-Host "`n"
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           🔐 Keycloak Ersteinrichtung                     ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

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
    Write-Host "  ⚠️  key.pem nicht gefunden - muss manuell erstellt werden!" -ForegroundColor Yellow
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
    -e KC_BOOTSTRAP_ADMIN_PASSWORD=p `
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
Write-Host "║  App-Benutzer:                                            ║" -ForegroundColor Green
Write-Host "║    admin / CHANGE_ME_DEV_PASSWORD   (Administrator-Rolle)              ║" -ForegroundColor Green
Write-Host "║    user  / CHANGE_ME_DEV_PASSWORD   (Benutzer-Rolle)                   ║" -ForegroundColor Green
Write-Host "║                                                           ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

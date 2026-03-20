# populate-db.ps1 - Befuellt die Datenbank mit Testdaten
# Ausfuehrung: .\scripts\db\populate-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "Hole OAuth Token von Keycloak..." -ForegroundColor Cyan

$clientSecret = if ($env:CLIENT_SECRET) {
    $env:CLIENT_SECRET
} else {
    Read-Host "CLIENT_SECRET eingeben"
}

$appPassword = if ($env:KEYCLOAK_APP_PASSWORD) {
    $env:KEYCLOAK_APP_PASSWORD
} else {
    Read-Host "Keycloak App-Passwort fuer admin eingeben"
}

$body = @{
    grant_type = "password"
    client_id = "nest-client"
    client_secret = $clientSecret
    username = "admin"
    password = $appPassword
}

try {
    # Verwende HTTP Port 8880 statt HTTPS 8843
    $tokenResponse = Invoke-RestMethod -Uri "http://localhost:8880/realms/nest/protocol/openid-connect/token" -Method POST -Body $body
    $token = $tokenResponse.access_token
    Write-Host "Token erhalten!" -ForegroundColor Green
} catch {
    Write-Host "Fehler beim Token-Abruf: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Fuehre DB Populate aus..." -ForegroundColor Cyan

try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "https://localhost:3000/dev/db_populate" -Method POST -Headers $headers -SkipCertificateCheck -TimeoutSec 300
    Write-Host "DB Populate erfolgreich: $($response | ConvertTo-Json)" -ForegroundColor Green
} catch {
    Write-Host "Fehler beim DB Populate: $_" -ForegroundColor Red
    exit 1
}

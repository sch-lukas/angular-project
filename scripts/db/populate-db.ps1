# populate-db.ps1 - Befuellt die Datenbank mit Testdaten
# Ausfuehrung: .\scripts\db\populate-db.ps1

$ErrorActionPreference = "Stop"

Write-Host "Hole OAuth Token von Keycloak..." -ForegroundColor Cyan

$body = @{
    grant_type = "password"
    client_id = "nest-client"
    client_secret = "__SET_CLIENT_SECRET_IN_ENV__"
    username = "admin"
    password = "CHANGE_ME_DEV_PASSWORD"
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

# Test-Script für POST /rest Endpoint
# Dieses Script testet das Anlegen eines Buches

Write-Host "=== Backend POST Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Backend-Status prüfen
Write-Host "1. Prüfe Backend-Status..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $backend) {
    Write-Host "   ✗ Backend läuft NICHT! Bitte starten Sie: pnpm start" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Backend läuft (PID: $($backend.OwningProcess))" -ForegroundColor Green

# 2. Health Check
Write-Host "2. Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "http://localhost:3000/health/liveness" -TimeoutSec 5
    Write-Host "   ✓ Backend antwortet: $($health.status)" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Backend antwortet nicht!" -ForegroundColor Red
    exit 1
}

# 3. POST Request
Write-Host "3. Sende POST Request..." -ForegroundColor Yellow
$body = @{
    isbn = "978-3-16-148410-7"
    rating = 5
    art = "DRUCKAUSGABE"
    preis = "29.99"
    lieferbar = $true
    datum = "2024-01-15"
    homepage = "https://example.com/test-buch"
    schlagwoerter = @("test", "debugging")
    beschreibung = "Dies ist ein Test-Buch zum Debuggen der POST-Funktionalität."
    autor = "Test Autor"
    autorBiographie = "Ein Test-Autor für Debugging-Zwecke."
    titel = @{
        titel = "Test Buch Debugging"
        untertitel = "POST Request Test"
    }
} | ConvertTo-Json -Depth 10

Write-Host "   Payload:" -ForegroundColor Gray
Write-Host $body -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/rest" -Method POST -ContentType "application/json" -Body $body -ErrorAction Stop
    Write-Host "   ✓ ERFOLG! Buch erstellt mit ID: $response" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "   ✗ FEHLER beim Erstellen!" -ForegroundColor Red
    Write-Host ""

    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   HTTP Status: $statusCode" -ForegroundColor Red

        try {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Response Body:" -ForegroundColor Red
            Write-Host $errorBody -ForegroundColor DarkRed
        } catch {
            Write-Host "   (Konnte Response Body nicht lesen)" -ForegroundColor DarkRed
        }
    } else {
        Write-Host "   Exception: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "4. Backend-Log prüfen..." -ForegroundColor Yellow
    if (Test-Path "log\server.log") {
        Write-Host "   Letzte Zeilen aus server.log:" -ForegroundColor Gray
        Get-Content "log\server.log" | Select-Object -Last 15
    } else {
        Write-Host "   Log-Datei nicht gefunden!" -ForegroundColor Red
    }

    exit 1
}

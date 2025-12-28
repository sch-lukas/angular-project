# Test-Script für DELETE /rest/{id} Endpoint
# Testet das Löschen eines Buches (nur für Admins)

Write-Host "=== Backend DELETE Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Backend-Status prüfen
Write-Host "1. Prüfe Backend-Status..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if (-not $backend) {
    Write-Host "   ✗ Backend läuft NICHT! Bitte starten Sie: pnpm start" -ForegroundColor Red
    exit 1
}
Write-Host "   ✓ Backend läuft (PID: $($backend.OwningProcess))" -ForegroundColor Green

# 2. Erstelle zuerst ein Test-Buch zum Löschen
Write-Host "2. Erstelle Test-Buch..." -ForegroundColor Yellow
$createBody = @{
    isbn = "978-9-99-999999-9"
    rating = 3
    art = "PAPERBACK"
    preis = "19.99"
    lieferbar = $true
    datum = "2024-12-01"
    homepage = "https://example.com/test-delete"
    schlagwoerter = @("test", "delete")
    beschreibung = "Test-Buch zum Löschen"
    autor = "Test Autor"
    autorBiographie = "Test Bio"
    titel = @{
        titel = "DELETE Test Buch"
        untertitel = "Wird gelöscht"
    }
} | ConvertTo-Json -Depth 10

try {
    $buchId = Invoke-RestMethod -Uri "http://localhost:3000/rest" -Method POST -ContentType "application/json" -Body $createBody -ErrorAction Stop
    Write-Host "   ✓ Test-Buch erstellt mit ID: $buchId" -ForegroundColor Green
} catch {
    Write-Host "   ✗ Fehler beim Erstellen des Test-Buchs" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    exit 1
}

# 3. Warte kurz
Start-Sleep -Seconds 2

# 4. Lösche das Test-Buch
Write-Host "3. Lösche Test-Buch (ID: $buchId)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/rest/$buchId" -Method DELETE -ErrorAction Stop
    Write-Host "   ✓ ERFOLG! Buch wurde gelöscht" -ForegroundColor Green

    # 5. Verifiziere dass Buch gelöscht wurde
    Write-Host "4. Verifiziere Löschung..." -ForegroundColor Yellow
    Start-Sleep -Seconds 1

    try {
        $check = Invoke-RestMethod -Uri "http://localhost:3000/rest/$buchId" -Method GET -ErrorAction Stop
        Write-Host "   ✗ Fehler: Buch existiert noch!" -ForegroundColor Red
        exit 1
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "   ✓ Bestätigt: Buch wurde erfolgreich gelöscht (404)" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "   ⚠ Unerwarteter Fehler beim Verifizieren" -ForegroundColor Yellow
            Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Yellow
            exit 0
        }
    }
} catch {
    Write-Host "   ✗ FEHLER beim Löschen!" -ForegroundColor Red
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

    exit 1
}

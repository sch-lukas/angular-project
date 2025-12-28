#!/usr/bin/env pwsh
# Test-Skript für Frontend DELETE-Funktionalität
# Simuliert Browser-Verhalten mit Token-Handling

Write-Host "`n=== Frontend DELETE Test ===" -ForegroundColor Cyan
Write-Host "Testet die komplette Delete-Kette wie im Browser`n" -ForegroundColor White

$baseUrl = "http://localhost:3000"

try {
    # 1. Login und Token holen (wie AuthService)
    Write-Host "1️⃣  Login mit admin/p..." -ForegroundColor Yellow
    $loginBody = @{
        username = "admin"
        password = "p"
    } | ConvertTo-Json

    $tokenResponse = Invoke-RestMethod `
        -Uri "$baseUrl/auth/token" `
        -Method Post `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $tokenResponse.access_token
    Write-Host "   ✅ Token erhalten (Länge: $($token.Length) Zeichen)" -ForegroundColor Green

    # 2. Test-Buch erstellen (wie im Backend)
    Write-Host "`n2️⃣  Test-Buch erstellen..." -ForegroundColor Yellow
    $testBuch = @{
        isbn = "978-9-12-345678-9"
        titel = @{
            titel = "Frontend DELETE Test"
            untertitel = "Automatischer Test"
        }
        rating = 5
        preis = 29.99
        lieferbar = $true
    } | ConvertTo-Json

    $createHeaders = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $createResponse = Invoke-RestMethod `
        -Uri "$baseUrl/rest" `
        -Method Post `
        -Body $testBuch `
        -Headers $createHeaders `
        -ErrorAction Stop

    $buchId = $createResponse.id
    Write-Host "   ✅ Test-Buch erstellt mit ID: $buchId" -ForegroundColor Green

    # 3. DELETE ausführen (wie BuchApiService)
    Write-Host "`n3️⃣  DELETE Request senden (wie Frontend)..." -ForegroundColor Yellow
    $deleteHeaders = @{
        "Authorization" = "Bearer $token"
    }

    try {
        $deleteResponse = Invoke-WebRequest `
            -Uri "$baseUrl/rest/$buchId" `
            -Method Delete `
            -Headers $deleteHeaders `
            -ErrorAction Stop

        if ($deleteResponse.StatusCode -eq 204) {
            Write-Host "   ✅ DELETE erfolgreich (Status: 204 No Content)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Status: $($deleteResponse.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 204) {
            Write-Host "   ✅ DELETE erfolgreich (Status: 204 No Content)" -ForegroundColor Green
        } else {
            throw $_
        }
    }

    # 4. Verifizieren dass Buch gelöscht wurde
    Write-Host "`n4️⃣  Verifiziere Löschung..." -ForegroundColor Yellow
    Start-Sleep -Milliseconds 500

    try {
        Invoke-RestMethod `
            -Uri "$baseUrl/rest/$buchId" `
            -Method Get `
            -ErrorAction Stop | Out-Null

        Write-Host "   ❌ FEHLER: Buch existiert noch!" -ForegroundColor Red
        Write-Host "`nTest FEHLGESCHLAGEN ❌" -ForegroundColor Red
        exit 1
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 404) {
            Write-Host "   ✅ Buch wurde gelöscht (404 Not Found)" -ForegroundColor Green
            Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
            Write-Host "║  🎉 Test ERFOLGREICH!                 ║" -ForegroundColor Green
            Write-Host "║  Backend DELETE funktioniert korrekt  ║" -ForegroundColor Green
            Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green
            Write-Host "`n💡 Das bedeutet: Backend ist OK, Problem liegt im Frontend!" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ Unerwarteter Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
            exit 1
        }
    }

} catch {
    Write-Host "`n❌ Test fehlgeschlagen!" -ForegroundColor Red
    Write-Host "Fehler: $($_.Exception.Message)" -ForegroundColor Red

    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Red

        if ($statusCode -eq 401) {
            Write-Host "`n⚠️  401 Unauthorized - Token ungültig oder fehlend" -ForegroundColor Yellow
        } elseif ($statusCode -eq 403) {
            Write-Host "`n⚠️  403 Forbidden - Keine Admin-Rechte" -ForegroundColor Yellow
        }
    }

    exit 1
}

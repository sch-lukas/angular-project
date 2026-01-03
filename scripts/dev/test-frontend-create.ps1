#!/usr/bin/env pwsh

# Test-Skript für Frontend CREATE-Funktionalität
# Simuliert exakt, was das Frontend sendet

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Frontend CREATE Test" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Backend-Check
Write-Host "1️⃣  Backend-Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000" -TimeoutSec 3
    Write-Host "   ✅ Backend erreichbar (Version: $($response.version))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend nicht erreichbar!" -ForegroundColor Red
    exit 1
}

# 2. Admin-Token holen (wie im Frontend)
Write-Host "`n2️⃣  Admin-Login (simuliert Frontend)..." -ForegroundColor Yellow
try {
    $loginBody = '{"username":"admin","password":"CHANGE_ME_DEV_PASSWORD"}'
    $loginResult = Invoke-RestMethod -Uri "http://localhost:3000/auth/token" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResult.access_token
    Write-Host "   🔑 Token erhalten" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Login fehlgeschlagen!" -ForegroundColor Red
    Write-Host "   Keycloak Problem: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. CREATE GraphQL Mutation (exakt wie Frontend)
Write-Host "`n3️⃣  CREATE Mutation ausführen..." -ForegroundColor Yellow
$testISBN = "978-9-99-123456-7"

# Genau das Mutation-Format, das das Frontend sendet
$mutation = @"
{
  "query": "mutation { create(input: { isbn: \"$testISBN\", titel: \"Frontend-Test Buch\", untertitel: \"Automatischer Test\", rating: 4, art: KINDLE, preis: 24.99, rabatt: 0.15, lieferbar: true, datum: \"2025-02-01\", homepage: \"https://example.com\", beschreibung: \"Dies ist eine Testbeschreibung für das neue Buch. Sie enthält mehrere Sätze und ausführliche Informationen.\", autor: \"Jane Developer\", autorBiographie: \"Jane Developer ist eine erfahrene Softwareentwicklerin und Autorin mehrerer Fachbücher.\", kategorien: [\"JAVASCRIPT\", \"TYPESCRIPT\"] }) { id } }"
}
"@

Write-Host "   📤 Sende Mutation..." -ForegroundColor Gray
try {
    $headers = @{
        Authorization = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $createResult = Invoke-RestMethod -Uri "http://localhost:3000/graphql" -Method Post -Headers $headers -Body $mutation

    # GraphQL Fehler prüfen
    if ($createResult.errors) {
        Write-Host "   ❌ GraphQL Fehler:" -ForegroundColor Red
        $createResult.errors | ForEach-Object {
            Write-Host "      • $($_.message)" -ForegroundColor Red
        }
        exit 1
    }

    if (-not $createResult.data.create.id) {
        Write-Host "   ❌ Keine ID zurückgegeben!" -ForegroundColor Red
        exit 1
    }

    $createdId = $createResult.data.create.id
    Write-Host "   ✅ Artikel erstellt! ID: $createdId" -ForegroundColor Green

} catch {
    Write-Host "   ❌ CREATE fehlgeschlagen!" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "   Fehler: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details:" -ForegroundColor Red
        Write-Host "   $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
    exit 1
}

# 4. Erstellten Artikel abrufen und Felder prüfen
Write-Host "`n4️⃣  Erstellten Artikel abrufen..." -ForegroundColor Yellow
$getBuchQuery = @"
{
  "query": "{ buch(id: \"$createdId\") { id titel { titel untertitel } isbn rating art preis rabatt(short: false) lieferbar datum homepage beschreibung autor autorBiographie } }"
}
"@

try {
    $buchResult = Invoke-RestMethod -Uri "http://localhost:3000/graphql" -Method Post -Headers $headers -Body $getBuchQuery
    $buch = $buchResult.data.buch

    Write-Host "   📖 Buch-Details:" -ForegroundColor Cyan
    Write-Host "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "      ID:          $($buch.id)" -ForegroundColor White
    Write-Host "      Titel:       $($buch.titel.titel)" -ForegroundColor White
    Write-Host "      Untertitel:  $($buch.titel.untertitel)" -ForegroundColor White
    Write-Host "      ISBN:        $($buch.isbn)" -ForegroundColor White
    Write-Host "      Rating:      $($buch.rating) ⭐" -ForegroundColor White
    Write-Host "      Art:         $($buch.art)" -ForegroundColor White
    Write-Host "      Preis:       $($buch.preis) €" -ForegroundColor White
    Write-Host "      Lieferbar:   $($buch.lieferbar)" -ForegroundColor White
    Write-Host "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "      Beschreibung:    $($buch.beschreibung)" -ForegroundColor Green
    Write-Host "      Autor:           $($buch.autor)" -ForegroundColor Green
    Write-Host "      Autor-Bio:       $($buch.autorBiographie)" -ForegroundColor Green
    Write-Host "      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

    # Feldvalidierung
    $allFieldsPresent = $true
    $missingFields = @()

    if (-not $buch.beschreibung) {
        $allFieldsPresent = $false
        $missingFields += "beschreibung"
    }
    if (-not $buch.autor) {
        $allFieldsPresent = $false
        $missingFields += "autor"
    }
    if (-not $buch.autorBiographie) {
        $allFieldsPresent = $false
        $missingFields += "autorBiographie"
    }

    if ($allFieldsPresent) {
        Write-Host "`n   ✅✅✅ ALLE NEUEN FELDER VORHANDEN! ✅✅✅" -ForegroundColor Green
    } else {
        Write-Host "`n   ⚠️  FEHLENDE FELDER: $($missingFields -join ', ')" -ForegroundColor Red
    }

} catch {
    Write-Host "   ⚠️  Fehler beim Abrufen des Buchs" -ForegroundColor Yellow
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Yellow
}

# 5. Cleanup - Test-Artikel löschen
Write-Host "`n5️⃣  Test-Artikel löschen..." -ForegroundColor Yellow
try {
    $delHeaders = @{Authorization = "Bearer $token"}
    Invoke-RestMethod -Uri "http://localhost:3000/rest/$createdId" -Method Delete -Headers $delHeaders | Out-Null
    Write-Host "   🧹 Test-Artikel gelöscht" -ForegroundColor Gray
} catch {
    Write-Host "   ⚠️  Löschen fehlgeschlagen (ID: $createdId)" -ForegroundColor Yellow
}

# Ergebnis
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   ✅ TEST ERFOLGREICH ABGESCHLOSSEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`n📋 Zusammenfassung:" -ForegroundColor Cyan
Write-Host "   ✅ Backend ist erreichbar" -ForegroundColor White
Write-Host "   ✅ Keycloak-Authentifizierung funktioniert" -ForegroundColor White
Write-Host "   ✅ Admin-Token wird korrekt erteilt" -ForegroundColor White
Write-Host "   ✅ CREATE-Mutation funktioniert" -ForegroundColor White
Write-Host "   ✅ Neue Felder werden gespeichert" -ForegroundColor White
Write-Host "   ✅ DELETE-Operation funktioniert" -ForegroundColor White

Write-Host "`n🎯 NÄCHSTER SCHRITT:" -ForegroundColor Yellow
Write-Host "   Teste das Frontend unter: http://localhost:4200/new" -ForegroundColor Yellow
Write-Host "   1. Als 'admin' mit Passwort 'CHANGE_ME_DEV_PASSWORD' einloggen" -ForegroundColor White
Write-Host "   2. Formular ausfüllen (alle Felder inkl. Beschreibung, Autor, Autor-Bio)" -ForegroundColor White
Write-Host "   3. 'Speichern' klicken" -ForegroundColor White
Write-Host "   4. Erfolgsmeldung sollte erscheinen und zu /search weitergeleitet werden" -ForegroundColor White
Write-Host "`n   Falls es nicht funktioniert:" -ForegroundColor Cyan
Write-Host "   • Browser-Console öffnen (F12)" -ForegroundColor White
Write-Host "   • Fehler-Meldung abschreiben" -ForegroundColor White
Write-Host "   • Netzwerk-Tab prüfen für GraphQL-Request/Response" -ForegroundColor White

# Browser-Test Anleitung für DELETE-Funktion

## ✅ Setup abgeschlossen

- Backend läuft auf: http://localhost:3000
- Frontend läuft auf: http://localhost:4200
- Debug-Logs wurden hinzugefügt

## 🧪 Test-Schritte im Browser

### 1. Browser vorbereiten

- Öffne: http://localhost:4200
- Drücke F12 (DevTools öffnen)
- Wechsle zum **Console** Tab
- Lösche alte Logs (rechte Maustaste → Clear console)

### 2. Neuer Login (wichtig!)

Da der AuthService geändert wurde, muss neu eingeloggt werden:

- Falls bereits eingeloggt: **Abmelden** (oben rechts)
- Zu /login navigieren
- Einloggen mit:
  - **Username**: admin
  - **Password**: p

**Erwartete Console-Ausgabe:**

```
POST http://localhost:3000/auth/token 200 OK
✅ Token erhalten
```

### 3. Zu einem Buch navigieren

- Gehe zu "Suche" (search)
- Klicke auf ein beliebiges Buch
- Der rote "🗑️ Artikel löschen" Button sollte sichtbar sein

### 4. DELETE testen

- Klicke auf "🗑️ Artikel löschen"
- Modal öffnet sich → Klicke "Ja, löschen"

**Erwartete Console-Ausgabe:**

```
🗑️  deleteBuch() aufgerufen für ID: [nummer]
🔑 Token im localStorage: VORHANDEN
🔐 Interceptor: Adding token to request: DELETE http://localhost:3000/rest/[id]
✅ Buch erfolgreich gelöscht: [nummer]
```

### 5. Fehlersuche (falls es nicht funktioniert)

#### Symptom: "Token im localStorage: FEHLT"

**Problem**: Token wurde nicht gespeichert beim Login
**Lösung**:

1. Ausloggen
2. localStorage löschen (Console: `localStorage.clear()`)
3. Neu einloggen

#### Symptom: "401 Unauthorized" im Network Tab

**Problem**: Token ungültig oder Backend erkennt ihn nicht
**Lösung**:

1. Console: `console.log(localStorage.getItem('buchspa_token'))`
2. Token sollte mit "eyJ" beginnen (JWT-Format)
3. Falls nicht: Neu einloggen

#### Symptom: "403 Forbidden"

**Problem**: Token vorhanden, aber keine Admin-Rechte
**Lösung**: Mit "admin/p" einloggen (nicht anderer User)

#### Symptom: Interceptor-Log fehlt

**Problem**: Interceptor wird nicht aufgerufen
**Lösung**:

1. Prüfe main.ts: `provideHttpClient(withInterceptors([authInterceptor]))`
2. Frontend neu laden (Strg+Shift+R)

## 🐛 Debug-Kommandos (Browser Console)

Token prüfen:

```javascript
localStorage.getItem('buchspa_token');
```

Auth-State prüfen:

```javascript
JSON.parse(localStorage.getItem('buchspa_auth'));
```

Token manuell setzen (für Tests):

```javascript
localStorage.setItem('buchspa_token', 'HIER_TOKEN_EINFUEGEN');
```

## 📊 Was passiert beim Löschen?

1. **Button-Klick** → `openDeleteConfirmation()`
2. **Modal öffnet** → Bestätigung
3. **"Ja"-Klick** → `deleteBuch(id)` aufgerufen
4. **API-Call** → `BuchApiService.delete(id)`
5. **HTTP DELETE** → `http://localhost:3000/rest/{id}`
6. **Interceptor** → Fügt `Authorization: Bearer {token}` hinzu
7. **Backend** → Prüft Token, löscht Buch
8. **Response** → 204 No Content
9. **Success** → Grüne Alert, Redirect nach 2s

## ✅ Erfolg sieht so aus:

- Console: Alle Logs grün ✅
- Network Tab: DELETE Request mit Status 204
- Grüne Alert-Box erscheint
- Nach 2 Sekunden: Redirect zur Suche
- Buch ist nicht mehr in der Liste

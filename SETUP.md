# 🚀 Setup-Anleitung für Entwickler

> **Vollständige Anleitung zum Einrichten und Starten des Projekts nach dem Klonen von GitHub**

---

## ⚡ Ein-Klick-Setup (Vollautomatisch)

Für das schnellste Setup führe einfach aus (als Administrator für Software-Installation):

```powershell
.\Setup-Komplett.ps1
```

Dieses Script:

- ✅ Prüft und installiert fehlende Software (Node.js, pnpm, Docker, Git)
- ✅ Startet Docker Desktop falls nicht aktiv
- ✅ Kopiert alle Konfigurationsdateien
- ✅ Installiert alle Dependencies
- ✅ Generiert Prisma Client & baut Backend
- ✅ Startet das komplette Projekt

**Optionen:**

```powershell
.\Setup-Komplett.ps1 -NoStart    # Nur installieren, nicht starten
.\Setup-Komplett.ps1 -Force      # Existierende Konfig-Dateien überschreiben
```

---

## 📋 Inhaltsverzeichnis (Manuelles Setup)

1. [Voraussetzungen](#voraussetzungen)
2. [Repository klonen](#repository-klonen)
3. [Fehlende Dateien erstellen](#fehlende-dateien-erstellen)
4. [Dependencies installieren](#dependencies-installieren)
5. [Datenbank einrichten](#datenbank-einrichten)
6. [Projekt starten](#projekt-starten)
7. [Tests ausführen](#tests-ausführen)
8. [Häufige Probleme](#häufige-probleme)

---

## Voraussetzungen

Stelle sicher, dass folgende Software installiert ist:

| Software   | Version | Überprüfen mit     | Download                                                      |
| ---------- | ------- | ------------------ | ------------------------------------------------------------- |
| Node.js    | ≥ 22.x  | `node --version`   | [nodejs.org](https://nodejs.org/)                             |
| pnpm       | ≥ 9.x   | `pnpm --version`   | `npm install -g pnpm`                                         |
| Docker     | ≥ 24.x  | `docker --version` | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Git        | ≥ 2.x   | `git --version`    | [git-scm.com](https://git-scm.com/)                           |
| PowerShell | ≥ 7.x   | `$PSVersionTable`  | [Microsoft](https://docs.microsoft.com/de-de/powershell/)     |

> **Hinweis:** Docker Desktop muss laufen, bevor du das Projekt startest.
>
> **Tipp:** Das Script `Setup-Komplett.ps1` kann fehlende Software automatisch installieren!

---

## Repository klonen

```bash
git clone https://github.com/DEIN-USERNAME/angular-project.git
cd angular-project
```

---

## Fehlende Dateien erstellen

Diese Dateien sind aus Sicherheitsgründen NICHT im Repository und müssen manuell erstellt werden.

### 🚀 Schnell-Setup (empfohlen)

Im Repository gibt es einen Ordner `setup-vorlagen/` mit allen nötigen Template-Dateien:

```powershell
# 1. Alle Vorlagen automatisch kopieren
.\setup-vorlagen\copy-to-project.ps1

# 2. Dependencies installieren
pnpm install
cd frontend && pnpm install && cd ..

# 3. Prisma Client generieren & Backend bauen
pnpm exec prisma generate
pnpm build

# 4. Projekt starten
.\Start-All.ps1
```

Das Script `copy-to-project.ps1` kopiert:

- `.env.example` → `.env`
- `db_password.txt.example` → `.extras/compose/postgres/db_password.txt`

### Manuelles Setup

Falls du die Dateien manuell erstellen möchtest:

#### 1. `.env` Datei (Projekt-Root)

Erstelle eine `.env` Datei im Hauptverzeichnis mit folgendem Inhalt:

```env
# Datenbank
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=p
DB_DATABASE=buch
DB_SCHEMA=buch

# Keycloak
KEYCLOAK_HOST=localhost
KEYCLOAK_PORT=8843
KEYCLOAK_CLIENT_ID=buch-client
KEYCLOAK_CLIENT_SECRET=

# Server
NODE_ENV=development
HTTPS=true
PORT=3000

# Logging
LOG_LEVEL=debug
LOG_DIR=./log

# Mail (optional - kann leer bleiben)
MAIL_HOST=
MAIL_PORT=
MAIL_USER=
MAIL_PASSWORD=
```

#### 2. PostgreSQL Passwort-Datei

Erstelle die Datei `.extras/compose/postgres/db_password.txt`:

```text
p
```

> **Wichtig:** Diese Datei enthält nur das Passwort `p` (ohne Zeilenumbruch).

#### 3. TLS-Zertifikate (falls fehlend)

Die TLS-Zertifikate sollten bereits im Repository sein unter:

- `src/config/resources/tls/certificate.crt`
- `src/config/resources/tls/key.pem`

Falls die `key.pem` fehlt (wird ignoriert), erstelle ein selbst-signiertes Zertifikat:

```powershell
# Im Projektverzeichnis ausführen
cd src/config/resources/tls

# Zertifikat erstellen (Windows mit OpenSSL)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out certificate.crt -days 365 -nodes -subj "/CN=localhost"
```

### 4. Bruno/Postman Environments (optional)

Für API-Tests mit Bruno, erstelle den Ordner:

```text
test/bruno/nest/environments/
```

---

## Dependencies installieren

```powershell
# Im Hauptverzeichnis
pnpm install

# Im Frontend-Verzeichnis
cd frontend
pnpm install
cd ..
```

### Prisma Client generieren

```powershell
pnpm exec prisma generate
```

### Backend bauen

```powershell
pnpm build
```

---

## Datenbank einrichten

### 1. Docker-Container starten

```powershell
# PostgreSQL starten
cd .extras/compose/postgres
docker compose up -d

# Keycloak starten
cd ../keycloak
docker compose up -d

# Zurück zum Hauptverzeichnis
cd ../../..
```

### 2. Container-Status prüfen

```powershell
docker ps
```

Du solltest zwei Container sehen:

- `postgres` (Port 5432) - Status: healthy
- `keycloak` (Port 8843) - Status: running (kann "unhealthy" zeigen, funktioniert trotzdem)

### 3. Datenbank mit Testdaten befüllen

Nachdem das Backend gestartet wurde:

```powershell
# Option A: Via curl (mit Bearer Token)
$token = (Invoke-RestMethod -Uri "https://localhost:8843/realms/buch/protocol/openid-connect/token" -Method POST -Body @{grant_type="password"; client_id="buch-client"; username="admin"; password="p"} -SkipCertificateCheck).access_token

Invoke-RestMethod -Uri "https://localhost:3000/dev/db_populate" -Method POST -Headers @{Authorization="Bearer $token"} -SkipCertificateCheck

# Option B: Via Browser
# Öffne https://localhost:3000/swagger
# Führe POST /dev/db_populate aus (benötigt Authentifizierung)
```

---

## Projekt starten

### Schnellstart (empfohlen)

```powershell
# Startet alles mit einem Befehl
.\Start-All.ps1
```

Dieser Befehl:

1. ✅ Startet PostgreSQL (Docker)
2. ✅ Startet Keycloak (Docker)
3. ✅ Startet NestJS Backend (neues Fenster)
4. ✅ Startet Angular Frontend (neues Fenster)
5. ✅ Öffnet den Browser nach 8 Sekunden

### Optionen

```powershell
# Nur Backend-Stack (ohne Frontend)
.\Start-All.ps1 -NoFrontend

# Mit LAN-Modus (vom Handy erreichbar)
.\Start-All.ps1 -lan

# Ohne automatischen Browser-Start
.\Start-All.ps1 -NoBrowser
```

### Manueller Start (Schritt für Schritt)

```powershell
# Terminal 1: Docker-Container
cd .extras/compose/postgres && docker compose up -d
cd ../keycloak && docker compose up -d

# Terminal 2: Backend
cd angular-project
pnpm start

# Terminal 3: Frontend
cd angular-project/frontend
pnpm start
```

### Stoppen

```powershell
.\Stop-All.ps1
```

---

## 🌐 URLs nach dem Start

| Service     | URL                            | Zugangsdaten  |
| ----------- | ------------------------------ | ------------- |
| Frontend    | https://localhost:4200         | -             |
| Backend API | https://localhost:3000         | -             |
| Swagger     | https://localhost:3000/swagger | -             |
| GraphQL     | https://localhost:3000/graphql | -             |
| Keycloak    | https://localhost:8843         | admin / admin |
| PostgreSQL  | localhost:5432                 | postgres / p  |

### Login-Daten für die App

| Benutzer | Passwort | Rolle    |
| -------- | -------- | -------- |
| admin    | p        | Admin    |
| user     | p        | Benutzer |

---

## Tests ausführen

### E2E Tests (Playwright)

```powershell
cd frontend

# Alle Tests ausführen
pnpm test:e2e

# Mit UI
pnpm test:e2e:ui

# Im Debug-Modus
pnpm test:e2e:debug

# Report anzeigen
pnpm test:e2e:report
```

### Backend Integration Tests (Vitest)

```powershell
# SSL-Warnung deaktivieren (PowerShell)
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"

# Tests ausführen
pnpm exec vitest run

# Mit UI
pnpm test
```

### Unit Tests

```powershell
pnpm test:unit
```

---

## Häufige Probleme

### 1. "ECONNREFUSED" beim Backend-Start

**Ursache:** PostgreSQL läuft nicht.

**Lösung:**

```powershell
cd .extras/compose/postgres
docker compose up -d
docker ps  # Prüfen ob Container "healthy"
```

### 2. "401 Unauthorized" bei API-Aufrufen

**Ursache:** Keycloak läuft nicht oder Token abgelaufen.

**Lösung:**

```powershell
cd .extras/compose/keycloak
docker compose up -d
# Neu einloggen im Frontend
```

### 3. "DEPTH_ZERO_SELF_SIGNED_CERT" Fehler

**Ursache:** Selbst-signierte Zertifikate werden nicht akzeptiert.

**Lösung für Tests:**

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
```

### 4. Frontend startet nicht

**Ursache:** Dependencies fehlen oder Port 4200 belegt.

**Lösung:**

```powershell
cd frontend
pnpm install
# Port freigeben oder anderen Port verwenden
pnpm start -- --port 4300
```

### 5. "Cannot find module" nach Git Pull

**Lösung:**

```powershell
pnpm install
cd frontend && pnpm install
pnpm exec prisma generate
pnpm build
```

### 6. Docker-Container starten nicht

**Lösung:**

```powershell
# Alle Container stoppen und neu starten
docker compose down
docker compose up -d

# Logs prüfen
docker logs postgres
docker logs keycloak
```

---

## 📁 Projektstruktur (Kurzübersicht)

```text
angular-project/
├── frontend/                 # Angular 21 SPA
│   ├── src/app/             # Komponenten & Services
│   ├── e2e/                 # Playwright E2E Tests
│   └── package.json
├── src/                     # NestJS Backend
│   ├── buch/               # Buch-Modul (REST, GraphQL)
│   ├── config/             # Konfiguration
│   └── security/           # Auth, Keycloak
├── prisma/                  # Datenbank-Schema
├── test/                    # Backend-Tests
├── .extras/compose/         # Docker Compose Files
├── Start-All.ps1           # Schnellstart-Script
├── Stop-All.ps1            # Stop-Script
└── SETUP.md                # Diese Datei
```

---

## 💡 Nützliche Befehle

```powershell
# Datenbank zurücksetzen
pnpm exec prisma migrate reset

# Neue Migration erstellen
pnpm exec prisma migrate dev --name beschreibung

# Prisma Studio (DB-GUI)
pnpm exec prisma studio

# Backend im Watch-Mode
pnpm dev

# Frontend im Watch-Mode
cd frontend && pnpm start
```

---

## 📚 Weitere Dokumentation

- [ReadMe.md](ReadMe.md) - Projekt-Hauptdokumentation
- [ReadMe.prisma.md](ReadMe.prisma.md) - Prisma-Setup
- [ReadMe.vscode.md](ReadMe.vscode.md) - VS Code Konfiguration
- [frontend/Readme.md](frontend/Readme.md) - Frontend-Dokumentation
- [frontend/README.E2E.md](frontend/README.E2E.md) - E2E Test-Dokumentation
- [1.struktur/projektbeschreibung.md](1.struktur/projektbeschreibung.md) - Projektübersicht
- [1.struktur/technische-details.md](1.struktur/technische-details.md) - Technische Details

---

**Erstellt:** Januar 2026
**Letzte Aktualisierung:** Januar 2026

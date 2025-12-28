# Neue Dateien - Übersicht

> **Dokumentation aller Dateien, die seit dem Start-Commit (`3191d43`) neu hinzugefügt wurden.**
> Stand: 28. Dezember 2025

---

## 📊 Zusammenfassung

| Kategorie              | Dateien  | Zeilen      | Anteil |
| ---------------------- | -------- | ----------- | ------ |
| Frontend Components    | 12       | ~6.500      | 38%    |
| Frontend Services      | 7        | ~1.100      | 6%     |
| Frontend Templates     | 13       | ~1.500      | 9%     |
| Frontend Tests         | 2        | ~850        | 5%     |
| E2E Tests (Playwright) | 8        | ~600        | 4%     |
| Cover Assets (SVG)     | 159      | ~3.200      | 19%    |
| Cover Scripts          | 7        | ~1.000      | 6%     |
| Backend-Erweiterungen  | 8        | ~1.200      | 7%     |
| Dokumentation          | 5        | ~1.800      | 10%    |
| Config/Sonstiges       | 6        | ~300        | 2%     |
| **TOTAL**              | **~227** | **~17.050** | 100%   |

---

## 1️⃣ Frontend - Angular Components

### Komponenten (components/)

| Datei                                                    | Zeilen | Beschreibung                                        |
| -------------------------------------------------------- | ------ | --------------------------------------------------- |
| `frontend/src/app/app.component.ts`                      | 68     | App Shell: Header, Navigation, Theme-Toggle, Footer |
| `frontend/src/app/auth.guard.ts`                         | 22     | Route Guard für geschützte Seiten                   |
| `frontend/src/app/auth.interceptor.ts`                   | 27     | HTTP Interceptor für JWT Token                      |
| `frontend/src/app/carousel-test.component.ts`            | ~50    | Test-Komponente für Karussell                       |
| `frontend/src/app/components/landing-page.component.ts`  | 447    | Startseite mit Statistiken und 3 Buch-Karussells    |
| `frontend/src/app/components/search.component.ts`        | 406    | Buchsuche mit Filtern, Sortierung und Paging        |
| `frontend/src/app/components/detail.component.ts`        | 1756   | Buch-Detailseite mit allen Produktinfos             |
| `frontend/src/app/components/new.component.ts`           | 1073   | Formular zum Anlegen neuer Bücher                   |
| `frontend/src/app/components/login.component.ts`         | 290    | Login-Formular mit JWT-Authentifizierung            |
| `frontend/src/app/components/cart.component.ts`          | 526    | Warenkorb mit Mengensteuerung                       |
| `frontend/src/app/components/wishlist.component.ts`      | 294    | Merkliste/Favoriten-Verwaltung                      |
| `frontend/src/app/components/book-carousel.component.ts` | 398    | Wiederverwendbares Buch-Karussell                   |
| `frontend/src/app/components/impressum.component.ts`     | 75     | Impressum                                           |
| `frontend/src/app/components/kontakt.component.ts`       | 73     | Kontaktseite                                        |

---

## 2️⃣ Frontend - Services (State Management)

| Datei                                                | Zeilen | Beschreibung                       |
| ---------------------------------------------------- | ------ | ---------------------------------- |
| `frontend/src/app/services/buch-api.service.ts`      | 330    | GraphQL API-Kommunikation, Caching |
| `frontend/src/app/services/auth.service.ts`          | 175    | JWT Token-Handling, Login/Logout   |
| `frontend/src/app/services/cart.service.ts`          | 187    | Warenkorb-State mit localStorage   |
| `frontend/src/app/services/wishlist.service.ts`      | 162    | Merklisten-State mit localStorage  |
| `frontend/src/app/services/graphql-queries.ts`       | 112    | Alle GraphQL Queries & Mutations   |
| `frontend/src/app/services/graphql-client.ts`        | 28     | GraphQL Client Setup               |
| `frontend/src/app/services/buch-api.service.spec.ts` | 322    | Tests für BuchApiService           |

---

## 3️⃣ Frontend - Templates (HTML & CSS)

| Datei                                                     | Zeilen | Beschreibung         |
| --------------------------------------------------------- | ------ | -------------------- |
| `frontend/src/app/templates/app.component.html`           | ~150   | App Shell Template   |
| `frontend/src/app/templates/app.component.css`            | ~100   | App Shell Styles     |
| `frontend/src/app/templates/book-carousel.component.html` | ~80    | Karussell Template   |
| `frontend/src/app/templates/book-carousel.component.css`  | ~60    | Karussell Styles     |
| `frontend/src/app/templates/detail.component.html`        | ~300   | Detailseite Template |
| `frontend/src/app/templates/detail.component.css`         | ~200   | Detailseite Styles   |
| `frontend/src/app/templates/landing-page.component.html`  | ~200   | Startseite Template  |
| `frontend/src/app/templates/landing-page.component.css`   | ~150   | Startseite Styles    |
| `frontend/src/app/templates/login.component.html`         | ~80    | Login Template       |
| `frontend/src/app/templates/login.component.css`          | ~50    | Login Styles         |
| `frontend/src/app/templates/new.component.html`           | ~250   | Neues Buch Template  |
| `frontend/src/app/templates/new.component.css`            | ~100   | Neues Buch Styles    |
| `frontend/src/app/templates/search.component.html`        | ~180   | Suchseite Template   |

---

## 4️⃣ Frontend - Tests

### Unit Tests

| Datei                                                  | Zeilen | Beschreibung              |
| ------------------------------------------------------ | ------ | ------------------------- |
| `frontend/src/app/components/detail.component.spec.ts` | 525    | Tests für DetailComponent |

### E2E Tests (Playwright)

| Datei                               | Zeilen | Beschreibung           |
| ----------------------------------- | ------ | ---------------------- |
| `frontend/e2e/specs/search.spec.ts` | 116    | Suche E2E Tests        |
| `frontend/e2e/specs/detail.spec.ts` | 133    | Detailseite E2E Tests  |
| `frontend/e2e/specs/create.spec.ts` | 204    | Buch anlegen E2E Tests |
| `frontend/e2e/specs/login.spec.ts`  | 52     | Login E2E Tests        |

### Page Objects

| Datei                               | Zeilen | Beschreibung       |
| ----------------------------------- | ------ | ------------------ |
| `frontend/e2e/pages/search.page.ts` | 83     | Search Page Object |
| `frontend/e2e/pages/detail.page.ts` | 101    | Detail Page Object |
| `frontend/e2e/pages/create.page.ts` | 156    | Create Page Object |
| `frontend/e2e/pages/login.page.ts`  | 40     | Login Page Object  |

---

## 5️⃣ Frontend - Konfiguration & Styles

| Datei                                      | Zeilen | Beschreibung                      |
| ------------------------------------------ | ------ | --------------------------------- |
| `frontend/src/main.ts`                     | 40     | Bootstrap & Routing-Konfiguration |
| `frontend/src/styles.css`                  | 337    | Globale Styles, Dark/Light Mode   |
| `frontend/src/index.html`                  | 13     | HTML Entry Point                  |
| `frontend/angular.json`                    | 74     | Angular CLI Konfiguration         |
| `frontend/package.json`                    | 42     | NPM Dependencies                  |
| `frontend/playwright.config.ts`            | 41     | Playwright Konfiguration          |
| `frontend/proxy.conf.json`                 | 26     | Dev-Server Proxy                  |
| `frontend/tsconfig.json`                   | 26     | TypeScript Konfiguration          |
| `frontend/tsconfig.app.json`               | 9      | App TypeScript Config             |
| `frontend/tsconfig.spec.json`              | 8      | Test TypeScript Config            |
| `frontend/src/environments/environment.ts` | 5      | Environment Variables             |

---

## 6️⃣ Frontend - Assets

### Cover-Bilder (SVG)

| Ordner                                  | Dateien | Beschreibung                         |
| --------------------------------------- | ------- | ------------------------------------ |
| `frontend/src/assets/covers/`           | 159     | SVG Cover für Bücher (IDs 1000-1158) |
| `frontend/src/assets/logo-buch-spa.svg` | 1       | App-Logo                             |

---

## 7️⃣ Cover-Generierung Scripts

| Datei                                                              | Zeilen | Beschreibung                  |
| ------------------------------------------------------------------ | ------ | ----------------------------- |
| `frontend/src/assets/cover-generierung/generate-covers-ai.mjs`     | 373    | KI-basierte Cover-Generierung |
| `frontend/src/assets/cover-generierung/generate-covers-svg.mjs`    | 224    | SVG Cover Generator           |
| `frontend/src/assets/cover-generierung/generate-covers.mjs`        | 172    | Canvas-basierte Cover         |
| `frontend/src/assets/cover-generierung/generate-covers-simple.mjs` | 193    | Vereinfachte Cover            |
| `frontend/src/assets/cover-generierung/regenerate-covers.ps1`      | 193    | PowerShell Generator          |
| `frontend/src/assets/cover-generierung/add-cover-abbildungen.mjs`  | 46     | DB-Einträge erstellen         |
| `frontend/src/assets/cover-generierung/set-cover-url.mjs`          | 33     | Cover-URLs in DB setzen       |

---

## 8️⃣ Scripts (Entwicklung & Build)

### scripts/db/ - Datenbank-Scripts

| Datei                             | Zeilen | Beschreibung                         |
| --------------------------------- | ------ | ------------------------------------ |
| `scripts/db/list-books.mjs`       | 21     | Bücher aus DB auflisten (Prisma)     |
| `scripts/db/list-books-pg.mjs`    | 28     | Bücher aus DB auflisten (PostgreSQL) |
| `scripts/db/migrate-add-pfad.mjs` | 39     | Migrations-Script für Pfad-Feld      |
| `scripts/db/count-books.mjs`      | -      | Bücher zählen                        |
| `scripts/db/dist-reset-db.mjs`    | -      | DB zurücksetzen (Distribution)       |
| `scripts/db/reset-db.mjs`         | -      | DB zurücksetzen (Entwicklung)        |
| `scripts/db/run-seed.mjs`         | -      | Seed-Daten laden                     |

### scripts/build/ - Build-Scripts

| Datei                                            | Zeilen | Beschreibung              |
| ------------------------------------------------ | ------ | ------------------------- |
| `scripts/build/asciidoctor.mts`                  | -      | AsciiDoc Dokumentation    |
| `scripts/build/copy-resources.mts`               | -      | Ressourcen kopieren       |
| `scripts/build/sonar-scanner.mts`                | -      | SonarQube Code-Analyse    |
| `scripts/build/dependency-check.mts`             | -      | Dependency Security Check |
| `scripts/build/dependency-check-suppression.xml` | -      | Suppression-Regeln        |
| `scripts/build/typedoc.mjs`                      | -      | TypeDoc Dokumentation     |

### scripts/dev/ - Entwicklungs-/Test-Scripts

| Datei                                  | Zeilen | Beschreibung                   |
| -------------------------------------- | ------ | ------------------------------ |
| `scripts/dev/static-serve.mjs`         | 52     | Statischer HTTP-Server für SPA |
| `scripts/dev/generate-load.mts`        | -      | Lasttest-Generator             |
| `scripts/dev/temp-graphql-pages.mjs`   | 58     | GraphQL Pagination Test        |
| `scripts/dev/temp-graphql-test.mjs`    | 39     | GraphQL Query Test             |
| `scripts/dev/test-delete.ps1`          | -      | PowerShell: Buch löschen Test  |
| `scripts/dev/test-post.ps1`            | -      | PowerShell: POST Test          |
| `scripts/dev/test-frontend-create.ps1` | -      | PowerShell: Frontend Create    |
| `scripts/dev/test-frontend-delete.ps1` | -      | PowerShell: Frontend Delete    |

---

## 9️⃣ Backend-Erweiterungen

### Neue Dateien

| Datei                         | Zeilen | Beschreibung             |
| ----------------------------- | ------ | ------------------------ |
| `src/db/seed.ts`              | 834    | Seed-Daten für Datenbank |
| `src/home/home.controller.ts` | 47     | SPA-Serving Controller   |
| `src/home/home.module.ts`     | 27     | Home Module              |

### Geänderte Dateien (wesentliche Erweiterungen)

| Datei                                         | Änderungen  | Beschreibung            |
| --------------------------------------------- | ----------- | ----------------------- |
| `src/config/resources/graphql/schema.graphql` | +43 Zeilen  | Neue Felder, Sortierung |
| `src/buch/resolver/query.ts`                  | +42 Zeilen  | Erweiterte Queries      |
| `src/buch/service/buch-service.ts`            | +93 Zeilen  | Suchlogik erweitert     |
| `src/buch/service/buch-write-service.ts`      | Refactoring | Anpassungen             |
| `src/config/dev/db-populate.ts`               | +64 Zeilen  | Testdaten laden         |
| `src/main.ts`                                 | +19 Zeilen  | Frontend-Integration    |

---

## 🔟 Dokumentation

| Datei                             | Zeilen | Beschreibung               |
| --------------------------------- | ------ | -------------------------- |
| `struktur/projektbeschreibung.md` | 354    | Projekt-Gesamtübersicht    |
| `struktur/technische-details.md`  | 607    | Architektur & Technologien |
| `struktur/zustandsdiagramm.puml`  | 356    | UML Zustandsdiagramm       |
| `frontend/EMPFEHLUNGEN_README.md` | 283    | Karussell-Implementierung  |
| `frontend/README.E2E.md`          | 156    | E2E Test Dokumentation     |
| `frontend/Readme.md`              | 3      | Frontend Readme            |

---

## 📁 Verzeichnisstruktur der neuen Dateien

```text
angular-project/
├── frontend/                          # 🆕 KOMPLETT NEU
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts       # Root Component
│   │   │   ├── auth.guard.ts          # Route Protection
│   │   │   ├── auth.interceptor.ts    # JWT Token Injection
│   │   │   ├── carousel-test.component.ts # Karussell Test
│   │   │   ├── components/            # Alle Komponenten
│   │   │   │   ├── book-carousel.component.ts
│   │   │   │   ├── cart.component.ts
│   │   │   │   ├── detail.component.ts
│   │   │   │   ├── detail.component.spec.ts
│   │   │   │   ├── impressum.component.ts
│   │   │   │   ├── kontakt.component.ts
│   │   │   │   ├── landing-page.component.ts
│   │   │   │   ├── login.component.ts
│   │   │   │   ├── new.component.ts
│   │   │   │   ├── search.component.ts
│   │   │   │   └── wishlist.component.ts
│   │   │   ├── services/              # Alle Services
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── buch-api.service.ts
│   │   │   │   ├── buch-api.service.spec.ts
│   │   │   │   ├── cart.service.ts
│   │   │   │   ├── graphql-client.ts
│   │   │   │   ├── graphql-queries.ts
│   │   │   │   └── wishlist.service.ts
│   │   │   └── templates/             # HTML & CSS Templates
│   │   │       ├── app.component.html
│   │   │       ├── app.component.css
│   │   │       ├── book-carousel.component.html
│   │   │       ├── book-carousel.component.css
│   │   │       ├── detail.component.html
│   │   │       ├── detail.component.css
│   │   │       ├── landing-page.component.html
│   │   │       ├── landing-page.component.css
│   │   │       ├── login.component.html
│   │   │       ├── login.component.css
│   │   │       ├── new.component.html
│   │   │       ├── new.component.css
│   │   │       └── search.component.html
│   │   ├── assets/
│   │   │   ├── covers/               # 159 SVG-Dateien
│   │   │   ├── cover-generierung/    # 7 Generator-Scripts
│   │   │   └── logo-buch-spa.svg
│   │   ├── styles.css
│   │   ├── main.ts
│   │   └── index.html
│   ├── e2e/                          # Playwright Tests
│   │   ├── specs/
│   │   │   ├── create.spec.ts
│   │   │   ├── detail.spec.ts
│   │   │   ├── login.spec.ts
│   │   │   └── search.spec.ts
│   │   └── pages/
│   │       ├── create.page.ts
│   │       ├── detail.page.ts
│   │       ├── login.page.ts
│   │       └── search.page.ts
│   └── *.json, *.ts                  # Konfiguration
│
├── scripts/                          # Organisierte Scripts
│   ├── db/                           # Datenbank-Scripts
│   │   ├── count-books.mjs
│   │   ├── dist-reset-db.mjs
│   │   ├── list-books.mjs
│   │   ├── list-books-pg.mjs
│   │   ├── migrate-add-pfad.mjs
│   │   ├── reset-db.mjs
│   │   └── run-seed.mjs
│   ├── build/                        # Build-Scripts
│   │   ├── asciidoctor.mts
│   │   ├── copy-resources.mts
│   │   ├── dependency-check.mts
│   │   ├── dependency-check-suppression.xml
│   │   ├── sonar-scanner.mts
│   │   └── typedoc.mjs
│   └── dev/                          # Entwicklungs-Scripts
│       ├── generate-load.mts
│       ├── static-serve.mjs
│       ├── temp-graphql-pages.mjs
│       ├── temp-graphql-test.mjs
│       ├── test-delete.ps1
│       ├── test-frontend-create.ps1
│       ├── test-frontend-delete.ps1
│       └── test-post.ps1
│
├── src/                              # Backend (erweitert)
│   ├── db/seed.ts                    # 🆕
│   ├── home/                         # 🆕
│   └── buch/, config/                # Erweitert
│
└── 1.struktur/                       # 🆕 KOMPLETT NEU
    ├── projektbeschreibung.md
    ├── technische-details.md
    ├── neue-dateien-uebersicht.md
    ├── zustandsdiagramm.puml
    └── ablauf-dokumentation/
        ├── 00-uebersicht.md
        ├── 01-startseite-laden.md
        ├── 02-buch-suchen.md
        ├── 03-detailseite-oeffnen.md
        ├── 04-login-authentifizierung.md
        ├── 05-buch-neu-anlegen.md
        ├── 06-buch-loeschen.md
        └── 07-warenkorb-merkliste.md
```

---

## ⏱️ Commit-Historie (chronologisch)

| Commit                | Datum      | Beschreibung                  |
| --------------------- | ---------- | ----------------------------- |
| `3191d43`             | 21.11.2025 | **Start** - Backend vorhanden |
| `b8d956b` - `6eddc3a` | Nov 2025   | Server Fixes                  |
| `b6df612` - `906ff60` | Nov 2025   | Frontend/Backend Updates      |
| `e04aab0` - `6525761` | Nov 2025   | GraphQL Umstellung            |
| `621543b`             | Nov 2025   | Paging & Details              |
| `92ac067` - `25233b6` | Nov 2025   | Karussell Implementierung     |
| `bbc5a29`             | Nov 2025   | Cover Generierung             |
| `b6efe9e` - `28cdec4` | Nov 2025   | Detail-Seite Erweiterung      |
| `125e025`             | Nov 2025   | Playwright Tests              |
| `61c1db8`             | Nov 2025   | Einkaufswagen                 |
| `b7f0c58`             | Nov 2025   | Frontend Erweiterung          |
| `5548413`             | Nov 2025   | Dark Mode                     |
| `e586f76`             | Nov 2025   | Neue Cover                    |
| `1a3356d`             | Nov 2025   | Dokumentation                 |
| `37955ef` - `30d0469` | Dez 2025   | Warenkorb & Löschen           |
| `3cda869` - `af38b16` | Dez 2025   | Neu Anlegen                   |
| `6c98cea`             | Dez 2025   | HTTPS                         |
| `...`                 | Dez 2025   | **Aktuell**                   |

---

## Erstellungsdatum

Erstellt am 19.12.2025, aktualisiert am 28.12.2025

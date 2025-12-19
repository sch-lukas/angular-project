# Neue Dateien - Übersicht

> **Dokumentation aller Dateien, die seit dem Start-Commit (`3191d43`) neu hinzugefügt wurden.**
> Stand: 19. Dezember 2025

---

## 📊 Zusammenfassung

| Kategorie              | Dateien  | Zeilen      | Anteil |
| ---------------------- | -------- | ----------- | ------ |
| Frontend Components    | 12       | ~6.500      | 40%    |
| Frontend Services      | 4        | ~850        | 5%     |
| Frontend Tests         | 2        | ~850        | 5%     |
| E2E Tests (Playwright) | 8        | ~600        | 4%     |
| Cover Assets (SVG)     | 159      | ~3.200      | 20%    |
| Cover Scripts          | 7        | ~1.000      | 6%     |
| Backend-Erweiterungen  | 8        | ~1.200      | 7%     |
| Dokumentation          | 5        | ~1.800      | 11%    |
| Config/Sonstiges       | 6        | ~300        | 2%     |
| **TOTAL**              | **~211** | **~16.300** | 100%   |

---

## 1️⃣ Frontend - Angular Components

### Haupt-Komponenten (features/buch/pages/)

| Datei                                                            | Zeilen | Beschreibung                                        |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------- |
| `frontend/src/app/app.component.ts`                              | 249    | App Shell: Header, Navigation, Theme-Toggle, Footer |
| `frontend/src/app/features/buch/pages/landing-page.component.ts` | 447    | Startseite mit Statistiken und 3 Buch-Karussells    |
| `frontend/src/app/features/buch/pages/search.component.ts`       | 406    | Buchsuche mit Filtern, Sortierung und Paging        |
| `frontend/src/app/features/buch/pages/detail.component.ts`       | 1756   | Buch-Detailseite mit allen Produktinfos             |
| `frontend/src/app/features/buch/pages/new.component.ts`          | 1073   | Formular zum Anlegen neuer Bücher                   |
| `frontend/src/app/features/auth/pages/login.component.ts`        | 290    | Login-Formular mit JWT-Authentifizierung            |

### Feature-Komponenten

| Datei                                                           | Zeilen | Beschreibung                      |
| --------------------------------------------------------------- | ------ | --------------------------------- |
| `frontend/src/app/features/buch/cart/cart.component.ts`         | 526    | Warenkorb mit Mengensteuerung     |
| `frontend/src/app/features/buch/wishlist/wishlist.component.ts` | 294    | Merkliste/Favoriten-Verwaltung    |
| `frontend/src/app/shared/components/book-carousel.component.ts` | 398    | Wiederverwendbares Buch-Karussell |

### Statische Seiten (features/static/pages/)

| Datei                                                           | Zeilen | Beschreibung |
| --------------------------------------------------------------- | ------ | ------------ |
| `frontend/src/app/features/static/pages/impressum.component.ts` | 75     | Impressum    |
| `frontend/src/app/features/static/pages/kontakt.component.ts`   | 73     | Kontaktseite |

---

## 2️⃣ Frontend - Services (State Management)

| Datei                                                         | Zeilen | Beschreibung                       |
| ------------------------------------------------------------- | ------ | ---------------------------------- |
| `frontend/src/app/core/services/buch-api.service.ts`          | 329    | GraphQL API-Kommunikation, Caching |
| `frontend/src/app/core/services/auth.service.ts`              | 175    | JWT Token-Handling, Login/Logout   |
| `frontend/src/app/features/buch/cart/cart.service.ts`         | 186    | Warenkorb-State mit localStorage   |
| `frontend/src/app/features/buch/wishlist/wishlist.service.ts` | 161    | Merklisten-State mit localStorage  |

---

## 3️⃣ Frontend - GraphQL & Auth

| Datei                                                    | Zeilen | Beschreibung                      |
| -------------------------------------------------------- | ------ | --------------------------------- |
| `frontend/src/app/core/services/graphql-queries.ts`      | 112    | Alle GraphQL Queries & Mutations  |
| `frontend/src/app/core/services/graphql-client.ts`       | 28     | GraphQL Client Setup              |
| `frontend/src/app/core/guards/auth.guard.ts`             | 22     | Route Guard für geschützte Seiten |
| `frontend/src/app/core/interceptors/auth.interceptor.ts` | 27     | HTTP Interceptor für JWT Token    |

---

## 4️⃣ Frontend - Tests

### Unit Tests

| Datei                                       | Zeilen | Beschreibung              |
| ------------------------------------------- | ------ | ------------------------- |
| `frontend/src/app/buch-api.service.spec.ts` | 322    | Tests für BuchApiService  |
| `frontend/src/app/detail.component.spec.ts` | 525    | Tests für DetailComponent |

### E2E Tests (Playwright)

| Datei                               | Zeilen | Beschreibung           |
| ----------------------------------- | ------ | ---------------------- |
| `frontend/e2e/specs/search.spec.ts` | 116    | Suche E2E Tests        |
| `frontend/e2e/specs/detail.spec.ts` | 133    | Detailseite E2E Tests  |
| `frontend/e2e/specs/create.spec.ts` | 204    | Buch anlegen E2E Tests |
| `frontend/e2e/specs/login.spec.ts`  | 52     | Login E2E Tests        |

### Page Objects

| Datei                                    | Zeilen | Beschreibung       |
| ---------------------------------------- | ------ | ------------------ |
| `frontend/e2e/pages/search.page.ts`      | 83     | Search Page Object |
| `frontend/e2e/pages/detail.page.ts`      | 101    | Detail Page Object |
| `frontend/e2e/pages/create.page.ts`      | 156    | Create Page Object |
| `frontend/e2e/pages/login.page.ts`       | 40     | Login Page Object  |
| `frontend/e2e/fixtures/test-fixtures.ts` | 56     | Test Fixtures      |

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

### scripts/build/ - Build-Scripts

| Datei                                            | Zeilen | Beschreibung              |
| ------------------------------------------------ | ------ | ------------------------- |
| `scripts/build/asciidoctor.mts`                  | -      | AsciiDoc Dokumentation    |
| `scripts/build/copy-resources.mts`               | -      | Ressourcen kopieren       |
| `scripts/build/sonar-scanner.mts`                | -      | SonarQube Code-Analyse    |
| `scripts/build/dependency-check.mts`             | -      | Dependency Security Check |
| `scripts/build/dependency-check-suppression.xml` | -      | Suppression-Regeln        |

### scripts/dev/ - Entwicklungs-/Test-Scripts

| Datei                                | Zeilen | Beschreibung                   |
| ------------------------------------ | ------ | ------------------------------ |
| `scripts/dev/static-serve.mjs`       | 52     | Statischer HTTP-Server für SPA |
| `scripts/dev/generate-load.mts`      | -      | Lasttest-Generator             |
| `scripts/dev/temp-graphql-pages.mjs` | 58     | GraphQL Pagination Test        |
| `scripts/dev/temp-graphql-test.mjs`  | 39     | GraphQL Query Test             |

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
│   │   │   ├── app.component.ts
│   │   │   ├── core/                  # Kern-Infrastruktur
│   │   │   │   ├── guards/
│   │   │   │   │   └── auth.guard.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts
│   │   │   │   └── services/
│   │   │   │       ├── auth.service.ts
│   │   │   │       ├── buch-api.service.ts
│   │   │   │       ├── graphql-client.ts
│   │   │   │       └── graphql-queries.ts
│   │   │   ├── features/              # Feature-Module
│   │   │   │   ├── auth/
│   │   │   │   │   └── pages/
│   │   │   │   │       └── login.component.ts
│   │   │   │   ├── buch/
│   │   │   │   │   ├── cart/
│   │   │   │   │   │   ├── cart.component.ts
│   │   │   │   │   │   └── cart.service.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── detail.component.ts
│   │   │   │   │   │   ├── landing-page.component.ts
│   │   │   │   │   │   ├── new.component.ts
│   │   │   │   │   │   └── search.component.ts
│   │   │   │   │   └── wishlist/
│   │   │   │   │       ├── wishlist.component.ts
│   │   │   │   │       └── wishlist.service.ts
│   │   │   │   └── static/
│   │   │   │       └── pages/
│   │   │   │           ├── impressum.component.ts
│   │   │   │           └── kontakt.component.ts
│   │   │   ├── shared/                # Wiederverwendbare Komponenten
│   │   │   │   └── components/
│   │   │   │       └── book-carousel.component.ts
│   │   │   └── templates/             # HTML & CSS Templates
│   │   │       ├── app.component.html
│   │   │       ├── app.component.css
│   │   │       ├── book-carousel.component.html
│   │   │       ├── book-carousel.component.css
│   │   │       ├── cart.component.html
│   │   │       ├── cart.component.css
│   │   │       ├── detail.component.html
│   │   │       ├── detail.component.css
│   │   │       ├── landing-page.component.html
│   │   │       ├── landing-page.component.css
│   │   │       ├── login.component.html
│   │   │       ├── login.component.css
│   │   │       ├── new.component.html
│   │   │       ├── new.component.css
│   │   │       ├── search.component.html
│   │   │       └── wishlist.component.html
│   │   ├── assets/
│   │   │   ├── covers/               # 159 SVG-Dateien
│   │   │   ├── cover-generierung/    # 7 Generator-Scripts
│   │   │   └── logo-buch-spa.svg
│   │   ├── styles.css
│   │   ├── main.ts
│   │   └── index.html
│   ├── e2e/                          # Playwright Tests
│   │   ├── specs/
│   │   ├── pages/
│   │   └── fixtures/
│   └── *.json, *.ts                  # Konfiguration
│
├── scripts/                          # Organisierte Scripts
│   ├── db/                           # Datenbank-Scripts
│   │   ├── list-books.mjs
│   │   ├── list-books-pg.mjs
│   │   └── migrate-add-pfad.mjs
│   ├── build/                        # Build-Scripts
│   │   ├── asciidoctor.mts
│   │   ├── copy-resources.mts
│   │   ├── sonar-scanner.mts
│   │   ├── dependency-check.mts
│   │   └── dependency-check-suppression.xml
│   └── dev/                          # Entwicklungs-Scripts
│       ├── static-serve.mjs
│       ├── generate-load.mts
│       ├── temp-graphql-pages.mjs
│       └── temp-graphql-test.mjs
│
├── src/                              # Backend (erweitert)
│   ├── db/seed.ts                    # 🆕
│   ├── home/                         # 🆕
│   └── buch/, config/                # Erweitert
│
└── struktur/                         # 🆕 KOMPLETT NEU
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
| `1cbe90a`             | Dez 2025   | **Aktuell**                   |

---

## Erstellungsdatum

Erstellt am 19.12.2025

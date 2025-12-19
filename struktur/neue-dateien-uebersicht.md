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

### Haupt-Komponenten

| Datei                                        | Zeilen | Beschreibung                                        |
| -------------------------------------------- | ------ | --------------------------------------------------- |
| `frontend/src/app/app.component.ts`          | 249    | App Shell: Header, Navigation, Theme-Toggle, Footer |
| `frontend/src/app/landing-page.component.ts` | 447    | Startseite mit Statistiken und 3 Buch-Karussells    |
| `frontend/src/app/search.component.ts`       | 406    | Buchsuche mit Filtern, Sortierung und Paging        |
| `frontend/src/app/detail.component.ts`       | 1756   | Buch-Detailseite mit allen Produktinfos             |
| `frontend/src/app/new.component.ts`          | 1073   | Formular zum Anlegen neuer Bücher                   |
| `frontend/src/app/login.component.ts`        | 290    | Login-Formular mit JWT-Authentifizierung            |

### Feature-Komponenten

| Datei                                             | Zeilen | Beschreibung                      |
| ------------------------------------------------- | ------ | --------------------------------- |
| `frontend/src/app/cart/cart.component.ts`         | 526    | Warenkorb mit Mengensteuerung     |
| `frontend/src/app/wishlist/wishlist.component.ts` | 294    | Merkliste/Favoriten-Verwaltung    |
| `frontend/src/app/book-carousel.component.ts`     | 398    | Wiederverwendbares Buch-Karussell |

### Statische Seiten

| Datei                                         | Zeilen | Beschreibung                  |
| --------------------------------------------- | ------ | ----------------------------- |
| `frontend/src/app/impressum.component.ts`     | 75     | Impressum                     |
| `frontend/src/app/kontakt.component.ts`       | 73     | Kontaktseite                  |
| `frontend/src/app/carousel-test.component.ts` | 55     | Test-Komponente für Karussell |

---

## 2️⃣ Frontend - Services (State Management)

| Datei                                           | Zeilen | Beschreibung                       |
| ----------------------------------------------- | ------ | ---------------------------------- |
| `frontend/src/app/buch-api.service.ts`          | 329    | GraphQL API-Kommunikation, Caching |
| `frontend/src/app/auth.service.ts`              | 175    | JWT Token-Handling, Login/Logout   |
| `frontend/src/app/cart/cart.service.ts`         | 186    | Warenkorb-State mit localStorage   |
| `frontend/src/app/wishlist/wishlist.service.ts` | 161    | Merklisten-State mit localStorage  |

---

## 3️⃣ Frontend - GraphQL & Auth

| Datei                                  | Zeilen | Beschreibung                      |
| -------------------------------------- | ------ | --------------------------------- |
| `frontend/src/app/graphql-queries.ts`  | 112    | Alle GraphQL Queries & Mutations  |
| `frontend/src/app/graphql-client.ts`   | 28     | GraphQL Client Setup              |
| `frontend/src/app/auth.guard.ts`       | 22     | Route Guard für geschützte Seiten |
| `frontend/src/app/auth.interceptor.ts` | 27     | HTTP Interceptor für JWT Token    |

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

## 8️⃣ Sonstige Scripts (Entwicklung)

| Datei                            | Zeilen | Beschreibung                         |
| -------------------------------- | ------ | ------------------------------------ |
| `scripts/static-serve.mjs`       | 52     | Statischer HTTP-Server für SPA       |
| `scripts/list-books.mjs`         | 21     | Bücher aus DB auflisten (Prisma)     |
| `scripts/list-books-pg.mjs`      | 28     | Bücher aus DB auflisten (PostgreSQL) |
| `scripts/migrate-add-pfad.mjs`   | 39     | Migrations-Script für Pfad-Feld      |
| `scripts/temp-graphql-pages.mjs` | 58     | GraphQL Pagination Test              |
| `scripts/temp-graphql-test.mjs`  | 39     | GraphQL Query Test                   |

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

```
angular-project/
├── frontend/                          # 🆕 KOMPLETT NEU
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts
│   │   │   ├── landing-page.component.ts
│   │   │   ├── search.component.ts
│   │   │   ├── detail.component.ts
│   │   │   ├── new.component.ts
│   │   │   ├── login.component.ts
│   │   │   ├── book-carousel.component.ts
│   │   │   ├── impressum.component.ts
│   │   │   ├── kontakt.component.ts
│   │   │   ├── buch-api.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.guard.ts
│   │   │   ├── auth.interceptor.ts
│   │   │   ├── graphql-queries.ts
│   │   │   ├── graphql-client.ts
│   │   │   ├── cart/
│   │   │   │   ├── cart.component.ts
│   │   │   │   └── cart.service.ts
│   │   │   └── wishlist/
│   │   │       ├── wishlist.component.ts
│   │   │       └── wishlist.service.ts
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
├── scripts/                          # Teilweise neu
│   ├── static-serve.mjs              # 🆕
│   ├── list-books*.mjs               # 🆕
│   └── temp-graphql-*.mjs            # 🆕
│
├── src/                              # Backend (erweitert)
│   ├── db/seed.ts                    # 🆕
│   ├── home/                         # 🆕
│   └── buch/, config/                # Erweitert
│
└── struktur/                         # 🆕 KOMPLETT NEU
    ├── projektbeschreibung.md
    ├── technische-details.md
    └── zustandsdiagramm.puml
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

_Erstellt am 19.12.2025_

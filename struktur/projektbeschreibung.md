# Buchhandlung SPA - Projektbeschreibung

## 📚 Überblick

Die Buchhandlung SPA ist eine moderne Single-Page-Application für eine Online-Buchhandlung, entwickelt mit **Angular 19**, **NestJS**, **GraphQL** und **Prisma**. Das Projekt demonstriert moderne Web-Entwicklung mit Fokus auf User Experience, Responsive Design und State Management.

---

## 🎯 Projektziel

Entwicklung einer vollständigen E-Commerce-Plattform für Bücher mit:

- ✅ Benutzerfreundlicher Oberfläche (UI/UX)
- ✅ Umfangreichen Such- und Filterfunktionen
- ✅ Warenkorb- und Merklisten-Funktionalität
- ✅ Dark/Light Mode mit automatischer System-Erkennung
- ✅ Responsive Design für Mobile, Tablet und Desktop
- ✅ Moderne GraphQL-API für effiziente Datenabfragen

---

## 🏗️ Architektur-Übersicht

### Frontend Stack

- **Framework**: Angular 19 (Standalone Components)
- **UI Library**: Bootstrap 5.3.2 + NG Bootstrap 18.0.0
- **State Management**: RxJS BehaviorSubject
- **Persistenz**: Browser localStorage
- **API Communication**: GraphQL Client
- **Styling**: CSS Custom Properties, Responsive Design

### Backend Stack

- **Framework**: NestJS
- **API**: GraphQL (Apollo Server)
- **ORM**: Prisma
- **Datenbank**: PostgreSQL
- **Authentifizierung**: Keycloak (OAuth2/OIDC)

### Development Tools

- **Build**: Angular CLI, Vite
- **Package Manager**: pnpm
- **Testing**: Vitest (Unit), Playwright (E2E)
- **Linting**: ESLint
- **Formatting**: Prettier

---

## 📦 Projektstruktur

```text
angular-project/
├── frontend/                    # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts                    # Root Component
│   │   │   ├── core/                               # Kern-Infrastruktur
│   │   │   │   ├── guards/
│   │   │   │   │   └── auth.guard.ts               # Route Protection
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── auth.interceptor.ts         # JWT Token Injection
│   │   │   │   └── services/
│   │   │   │       ├── auth.service.ts             # Authentifizierung
│   │   │   │       ├── buch-api.service.ts         # GraphQL API Service
│   │   │   │       ├── graphql-client.ts           # GraphQL Client Setup
│   │   │   │       └── graphql-queries.ts          # Query Definitionen
│   │   │   ├── features/                           # Feature-Module
│   │   │   │   ├── auth/pages/
│   │   │   │   │   └── login.component.ts          # Login-Seite
│   │   │   │   ├── buch/
│   │   │   │   │   ├── cart/                       # Warenkorb (NEU)
│   │   │   │   │   │   ├── cart.service.ts
│   │   │   │   │   │   └── cart.component.ts
│   │   │   │   │   ├── pages/
│   │   │   │   │   │   ├── detail.component.ts     # Buch-Detailseite
│   │   │   │   │   │   ├── landing-page.component.ts # Startseite
│   │   │   │   │   │   ├── new.component.ts        # Neues Buch erstellen
│   │   │   │   │   │   └── search.component.ts     # Such-/Ergebnisseite
│   │   │   │   │   └── wishlist/                   # Merkliste (NEU)
│   │   │   │   │       ├── wishlist.service.ts
│   │   │   │   │       └── wishlist.component.ts
│   │   │   │   └── static/pages/
│   │   │   │       ├── impressum.component.ts
│   │   │   │       └── kontakt.component.ts
│   │   │   ├── shared/                             # Wiederverwendbare Komponenten
│   │   │   │   └── components/
│   │   │   │       └── book-carousel.component.ts  # Buch-Karussell
│   │   │   └── templates/                          # HTML & CSS Templates
│   │   │       ├── *.component.html
│   │   │       └── *.component.css
│   │   ├── assets/
│   │   │   └── covers/                   # 159 generierte SVG-Cover (NEU)
│   │   ├── styles.css                    # Globale Styles mit Dark Mode
│   │   └── main.ts                       # App Bootstrap + Routing
│   ├── e2e/                              # Playwright Tests
│   │   ├── specs/
│   │   ├── pages/
│   │   └── fixtures/
│   ├── angular.json
│   ├── package.json
│   └── proxy.conf.json
│
├── src/                         # NestJS Backend
│   ├── main.ts
│   ├── module.ts
│   ├── buch/
│   │   ├── controller/
│   │   ├── resolver/             # GraphQL Resolver
│   │   └── service/
│   ├── admin/
│   ├── config/
│   └── security/
│
├── prisma/
│   ├── schema.prisma             # Datenbank Schema
│   └── migrations/
│
├── scripts/                      # Organisierte Scripts
│   ├── db/                       # Datenbank-Utilities
│   │   ├── list-books.mjs
│   │   ├── list-books-pg.mjs
│   │   └── migrate-add-pfad.mjs
│   ├── build/                    # Build-Tools
│   │   ├── asciidoctor.mts
│   │   ├── copy-resources.mts
│   │   ├── sonar-scanner.mts
│   │   └── dependency-check.mts
│   └── dev/                      # Entwicklungs-Scripts
│       ├── static-serve.mjs
│       ├── generate-load.mts
│       └── temp-graphql-*.mjs
│
├── struktur/                     # Projekt-Dokumentation (NEU)
│   ├── projektbeschreibung.md
│   ├── technische-details.md
│   ├── neue-dateien-uebersicht.md
│   ├── zustandsdiagramm.puml
│   └── ablauf-dokumentation/
│       └── 00-07 Workflow-Dokumente
│
├── test/
│   ├── integration/              # GraphQL Integration Tests
│   └── unit/                     # Service Unit Tests
│
├── docker-bake.hcl
├── Dockerfile
├── package.json
└── README.md
```

---

## 🆕 Neue Features (seit GitHub-Start)

### 1. **Warenkorb-System** 🛒

Vollständig implementiertes Shopping Cart mit:

- State Management via `CartService` (BehaviorSubject)
- localStorage-Persistenz über Seitenneuladen hinweg
- Desktop: Responsive Tabelle mit Mengensteuerung
- Mobile: Card-Layout für bessere Touchscreen-Bedienung
- Echtzeit-Preisberechnung und Item-Zähler im Header
- Navigation zum Warenkorb mit Badge-Anzeige

**Dateien**:

- `frontend/src/app/features/buch/cart/cart.service.ts` (173 Zeilen)
- `frontend/src/app/features/buch/cart/cart.component.ts` (467 Zeilen)

### 2. **Merkliste/Wishlist** ❤️

Benutzerfreundliche Favoriten-Verwaltung:

- Toggle-Funktion: Rot wenn gemerkt, Grau wenn nicht
- Persistierung in localStorage
- Grid-Layout mit responsiven Bootstrap-Cards
- Schnellzugriff zu Buch-Details
- Badge im Header zeigt Anzahl gemerkter Bücher

**Dateien**:

- `frontend/src/app/features/buch/wishlist/wishlist.service.ts` (156 Zeilen)
- `frontend/src/app/features/buch/wishlist/wishlist.component.ts` (295 Zeilen)

### 3. **Startseiten-Carousels** 📚

Drei interaktive Buch-Karussells:

- **"Neu im Programm"**: Neueste Bücher (sortiert nach Preis absteigend)
- **"Beliebte Bücher"**: Top-Ratings (Filter: Rating ≥ 4)
- **"🏆 Schwabenpreis"**: Günstigste Bücher (aufsteigend sortiert, nur lieferbare)

Features:

- Horizontales Scrolling mit Pfeil-Navigation
- Lazy Loading der Buchdaten via GraphQL
- Responsive: Pfeile verstecken sich auf Mobile
- Wiederverwendbare `BookCarouselComponent`

**Dateien**:

- `frontend/src/app/shared/components/book-carousel.component.ts` (361 Zeilen)
- `frontend/src/app/features/buch/pages/landing-page.component.ts` (407 Zeilen - erweitert)

### 4. **Erweiterte Buch-Detailseite** 📖

Komplett überarbeitetes Layout:

- Zweispaltig: Cover links, Produktinfos rechts
- **Buchbeschreibung**: Volltext-Anzeige in Card mit Gradient-Header
- **Autoren-Biographie**: Separate Sektion mit Autor-Infos
- "Ähnliche Bücher" Carousel am Seitenende
- Integration von Warenkorb- und Merkliste-Buttons
- Success-Alerts mit Animation

**Dateien**:

- `frontend/src/app/features/buch/pages/detail.component.ts` (1576 Zeilen - massiv erweitert)

### 5. **Dark/Light Mode** 🌓

Vollständiger Theme-Support:

- Automatische Erkennung der System-Präferenz (`prefers-color-scheme`)
- Toggle-Button im Header
- Persistierung in localStorage
- CSS Custom Properties für alle Komponenten
- Optimierte Farbpalette für maximale Lesbarkeit:
  - Tabellen: Dunkelgraue Hintergründe (#374151, #1f2937)
  - Text: Helle Schrift (#f3f4f6, #d1d5db)
  - Cards: Abgestimmte Schatten und Borders
  - Preis-Highlights: Grüne Akzente (#34d399)

**Dateien**:

- `frontend/src/app/app.component.ts` (erweitert)
- `frontend/src/styles.css` (Dark Mode Variablen)
- Alle Komponenten: `:host-context(.theme-dark)` Styles

### 6. **Dynamische Buch-Cover** 🎨

SVG-basierte Cover-Generierung:

- 159 einzigartige Cover (IDs 1000-1158)
- 16 verschiedene Farbvarianten:
  - Violet, Blue, Cyan, Green, Emerald
  - Orange, Red, Pink, Rose, Amber
  - Indigo, Teal, Sky, Lime, Purple, Fuchsia
- Zyklische Farb-Verteilung für maximale Vielfalt
- Automatisch generierte Titel, Subtitel, Autoren
- Dekorative Rechtecke für modernen Look

**Dateien**:

- `frontend/src/assets/cover-generierung/regenerate-covers.ps1` (PowerShell Generator)
- `frontend/src/assets/covers/*.svg` (159 SVG-Dateien)

### 7. **GraphQL-Erweiterungen** 🔄

Optimierte API-Abfragen:

- Neue Felder: `beschreibung`, `autorBiographie`, `lieferbar`
- Sortierungs-Parameter: `sort: "preis,asc"` / `"preis,desc"`
- Paginierung für große Ergebnislisten
- Effizientes Caching und Error Handling

**Dateien**:

- `frontend/src/app/core/services/graphql-queries.ts` (erweitert)
- `frontend/src/app/core/services/buch-api.service.ts` (erweitert)

---

## 👥 Benutzer-Flows

### Flow 1: Buch kaufen

1. Startseite → Carousel durchsuchen
2. Buch anklicken → Detailseite
3. Beschreibung lesen → Autor-Info prüfen
4. "In den Warenkorb" → Success-Alert
5. Warenkorb öffnen (Badge im Header)
6. Menge anpassen → Gesamtpreis prüfen

### Flow 2: Buch merken

1. Suche → Ergebnisse filtern
2. Buch auswählen → Detailseite
3. "Merken" klicken → Button wird rot
4. Merkliste öffnen (Badge im Header)
5. Buch-Grid anzeigen → Favoriten verwalten

### Flow 3: Theme wechseln

1. Header → "Dark"/"Light" Button
2. Theme umschalten → Sofortige Änderung
3. localStorage speichert Präferenz
4. Beim nächsten Besuch: Automatisch gewähltes Theme

---

## 🎨 Design-Prinzipien

### Responsive Design

- **Mobile First**: Optimiert für Smartphones (< 768px)
- **Tablet**: Medium-Breakpoint (768px - 991px)
- **Desktop**: Large-Breakpoint (≥ 992px)
- Bootstrap Grid System: `col-12 col-md-6 col-lg-4`

### Accessibility

- Semantisches HTML
- ARIA-Labels für Screenreader
- Keyboard-Navigation
- Kontrastreiche Farbpalette (WCAG 2.1 AA)

### Performance

- Lazy Loading für Bilder
- GraphQL-Caching
- localStorage für Client-Side State
- Optimierte Bundle-Größe

---

## 📊 Technische Kennzahlen

- **Codezeilen Frontend**: ~8.000+ LOC
- **Komponenten**: 15+ Angular Components
- **Services**: 5+ Injectable Services
- **Routen**: 8 definierte Routes
- **GraphQL Queries**: 4 optimierte Queries
- **SVG-Assets**: 159 generierte Cover
- **Responsive Breakpoints**: 3 (Mobile, Tablet, Desktop)
- **Theme-Varianten**: 2 (Light, Dark)

---

## 🚀 Deployment & Entwicklung

### Entwicklungsserver starten

```bash
# Backend + Frontend gleichzeitig
pnpm start

# Nur Frontend
cd frontend && pnpm start

# Nur Backend
pnpm start:backend
```

### Build für Produktion

```bash
pnpm build
```

### Tests ausführen

```bash
# Unit Tests
pnpm test

# E2E Tests
pnpm test:e2e
```

---

## 🎓 Lernziele erreicht

1. ✅ **Angular Standalone Components**: Moderne Architektur ohne NgModules
2. ✅ **RxJS State Management**: BehaviorSubject, Observables, Subscriptions
3. ✅ **GraphQL Integration**: Queries, Mutations, Error Handling
4. ✅ **Responsive Design**: Bootstrap Grid, Media Queries
5. ✅ **Theming**: CSS Custom Properties, Dynamic Styles
6. ✅ **Persistenz**: localStorage API, Browser Storage
7. ✅ **Routing**: Angular Router, Navigation Guards
8. ✅ **TypeScript**: Strong Typing, Interfaces, Generics

---

## 📝 Fazit

Das Projekt demonstriert eine vollständige E-Commerce-Lösung mit modernen Web-Technologien. Besonderer Fokus liegt auf **User Experience**, **Performance** und **Code-Qualität**. Die implementierten Features zeigen praktische Anwendung von Angular-Best-Practices und bereiten optimal auf reale Enterprise-Projekte vor.

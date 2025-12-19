# Ablauf-Dokumentation - Übersicht

Diese Dokumentation erklärt anhand eines **Beispiel-Nutzerflusses**, wie die verschiedenen Teile der Anwendung miteinander kommunizieren.

---

## 📁 Inhaltsverzeichnis

| Nr. | Datei                                                          | Szenario                             |
| --- | -------------------------------------------------------------- | ------------------------------------ |
| 01  | [01-startseite-laden.md](01-startseite-laden.md)               | Nutzer öffnet die Startseite         |
| 02  | [02-buch-suchen.md](02-buch-suchen.md)                         | Nutzer sucht nach Büchern            |
| 03  | [03-detailseite-oeffnen.md](03-detailseite-oeffnen.md)         | Nutzer klickt auf ein Buch           |
| 04  | [04-login-authentifizierung.md](04-login-authentifizierung.md) | Nutzer meldet sich an                |
| 05  | [05-buch-neu-anlegen.md](05-buch-neu-anlegen.md)               | Admin legt neues Buch an             |
| 06  | [06-buch-loeschen.md](06-buch-loeschen.md)                     | Admin löscht ein Buch                |
| 07  | [07-warenkorb-merkliste.md](07-warenkorb-merkliste.md)         | Nutzer verwendet Warenkorb/Merkliste |

---

## 🏗️ Architektur-Überblick

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER                                         │
│  ┌────────────────────────────────────────────────────────────────────────┐ │
│  │                        ANGULAR FRONTEND                                 │ │
│  │                                                                         │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │ │
│  │  │   Landing   │  │   Search    │  │   Detail    │  │    New      │   │ │
│  │  │    Page     │  │  Component  │  │  Component  │  │  Component  │   │ │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘   │ │
│  │         │                │                │                │          │ │
│  │         └────────────────┴────────────────┴────────────────┘          │ │
│  │                                   │                                    │ │
│  │                          ┌────────▼────────┐                          │ │
│  │                          │  BuchApiService │                          │ │
│  │                          │  (GraphQL)      │                          │ │
│  │                          └────────┬────────┘                          │ │
│  │                                   │                                    │ │
│  │  ┌─────────────┐         ┌────────▼────────┐        ┌─────────────┐   │ │
│  │  │ CartService │         │  AuthService    │        │ Wishlist    │   │ │
│  │  │ (localStorage)        │  (JWT Token)    │        │ Service     │   │ │
│  │  └─────────────┘         └────────┬────────┘        └─────────────┘   │ │
│  │                                   │                                    │ │
│  └───────────────────────────────────┼────────────────────────────────────┘ │
│                                      │                                       │
└──────────────────────────────────────┼───────────────────────────────────────┘
                                       │ HTTPS
                                       ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                            NESTJS BACKEND                                     │
│                                                                               │
│  ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐        │
│  │  GraphQL API    │     │   REST API      │     │  Token Controller│        │
│  │  /graphql       │     │   /rest/buch    │     │  /auth/token     │        │
│  └────────┬────────┘     └────────┬────────┘     └────────┬────────┘        │
│           │                       │                       │                  │
│           └───────────────────────┴───────────────────────┘                  │
│                                   │                                          │
│                          ┌────────▼────────┐                                │
│                          │   BuchService   │                                │
│                          └────────┬────────┘                                │
│                                   │                                          │
│                          ┌────────▼────────┐                                │
│                          │  Prisma ORM     │                                │
│                          └────────┬────────┘                                │
│                                   │                                          │
└───────────────────────────────────┼──────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │     PostgreSQL        │
                        │     Datenbank         │
                        └───────────────────────┘
```

---

## 🔑 Wichtige Konzepte

### 1. **GraphQL vs REST**

- **GraphQL** (`/graphql`): Hauptsächlich für Daten-Abfragen (Queries)
- **REST** (`/rest/buch`): Für Mutationen (Erstellen, Ändern, Löschen)

### 2. **State Management**

- **BuchApiService**: Kommunikation mit Backend
- **CartService**: Lokaler Warenkorb-State (localStorage)
- **WishlistService**: Lokale Merkliste (localStorage)
- **AuthService**: JWT Token Verwaltung

### 3. **Authentifizierung**

- **Keycloak**: Identity Provider
- **JWT Token**: Wird bei jeder Anfrage im Header mitgeschickt
- **AuthInterceptor**: Fügt Token automatisch hinzu
- **AuthGuard**: Schützt Routen vor unauthentifizierten Zugriffen

---

## 📍 Beispiel-User-Flow (Komplettübersicht)

```
1. STARTSEITE
   └── Nutzer öffnet https://localhost:3000
       └── LandingPageComponent lädt
           └── BuchApiService.getNewestBooks() → GraphQL Query
               └── Backend: BuchService.find() → Prisma → PostgreSQL
                   └── Bücher werden in Karussells angezeigt

2. BUCH ANKLICKEN
   └── Nutzer klickt auf Buch-Card
       └── Router navigiert zu /buch/:id
           └── DetailComponent lädt
               └── BuchApiService.getById(id) → GraphQL Query
                   └── Backend liefert Buch-Details

3. LOGIN
   └── Nutzer klickt "Anmelden"
       └── Router navigiert zu /login
           └── LoginComponent zeigt Formular
               └── AuthService.login(user, pass) → POST /auth/token
                   └── Backend: Keycloak validiert → JWT Token zurück
                       └── Token wird in localStorage gespeichert

4. BUCH NEU ANLEGEN (Admin)
   └── Nutzer navigiert zu /buch/neu
       └── NewComponent zeigt Formular
           └── AuthGuard prüft: Ist User eingeloggt?
               └── BuchApiService.create(buchData) → POST /rest/buch
                   └── AuthInterceptor fügt JWT Token hinzu
                       └── Backend: BuchWriteService.create() → Prisma → DB

5. BUCH LÖSCHEN (Admin)
   └── Nutzer klickt "Löschen" auf Detailseite
       └── BuchApiService.delete(id) → DELETE /rest/buch/:id
           └── AuthInterceptor fügt JWT Token hinzu
               └── Backend: BuchWriteService.delete() → Prisma → DB
```

---

_Weiter zu: [01-startseite-laden.md](01-startseite-laden.md)_

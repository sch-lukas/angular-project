# 02 - Buch suchen

> **Szenario:** Ein Benutzer sucht nach Büchern über die Suchseite mit verschiedenen Filterkriterien.

---

## 🔄 Ablauf-Diagramm

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 1. NAVIGATION: User klickt auf "Suche" in der Navigation                             │
│                                                                                      │
│    navbar.component.ts → routerLink="/search"                                        │
│    Router navigiert zu SearchComponent                                               │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 2. SEARCH COMPONENT: Initialisierung                                                 │
│                                                                                      │
│    search.component.ts:                                                              │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ ngOnInit() {                                                                 │  │
│    │     // Suchkriterien aus Query-Params lesen                                  │  │
│    │     this.route.queryParams.subscribe(params => {                             │  │
│    │         if (params['titel']) {                                               │  │
│    │             this.searchForm.patchValue({ titel: params['titel'] });          │  │
│    │             this.search();  // Automatisch suchen                            │  │
│    │         }                                                                    │  │
│    │     });                                                                      │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    Suchformular (Reactive Form):                                                     │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ formData = {                                                                 │  │
│    │     suchtext: '',             // Freitext-Suche (Titel)                      │  │
│    │     isbn: '',                 // ISBN-Suche                                  │  │
│    │     art: '',                  // EPUB | HARDCOVER | PAPERBACK                │  │
│    │     ratingFilter: '',         // 1-5 Sterne                                  │  │
│    │     nurLieferbar: false,      // Nur lieferbare                              │  │
│    │     sortierung: '',           // preisAsc | preisDesc                        │  │
│    │ };                                                                           │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 3. UI: Suchformular                                                                  │
│                                                                                      │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │  ╔═══════════════════════════════════════════════════════════════════════╗  │  │
│    │  ║  🔍 Bücher suchen                                                     ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  Titel:    [________________________]                                 ║  │  │
│    │  ║  ISBN:     [________________________]                                 ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  Art:      [EPUB / HARDCOVER / PAPERBACK ▼]                           ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  Rating:   ○ Alle  ○ 1⭐  ○ 2⭐  ○ 3⭐  ○ 4⭐  ○ 5⭐                   ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  ☐ Nur lieferbare Bücher                                              ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  Sortierung: ○ Standard  ○ Preis ↑  ○ Preis ↓                         ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  [🔍 Suchen]                                                          ║  │  │
│    │  ╚═══════════════════════════════════════════════════════════════════════╝  │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼ User klickt "Suchen"
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 4. SEARCH-METHODE: Suchkriterien verarbeiten                                         │
│                                                                                      │
│    search.component.ts:                                                              │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ search(): void {                                                             │  │
│    │     this.isLoading = true;                                                   │  │
│    │     this.errorMsg = null;                                                    │  │
│    │                                                                              │  │
│    │     // Leere Werte entfernen                                                 │  │
│    │     const criteria = Object.fromEntries(                                     │  │
│    │         Object.entries(this.searchForm.value)                                │  │
│    │             .filter(([_, v]) => v !== '' && v !== null && v !== false)       │  │
│    │     );                                                                       │  │
│    │                                                                              │  │
│    │     this.api.search(criteria).subscribe({                                    │  │
│    │         next: (results) => {                                                 │  │
│    │             this.books = results;                                            │  │
│    │             this.isLoading = false;                                          │  │
│    │         },                                                                   │  │
│    │         error: (err) => {                                                    │  │
│    │             this.errorMsg = err.message;                                     │  │
│    │             this.isLoading = false;                                          │  │
│    │         }                                                                    │  │
│    │     });                                                                      │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 5. BUCH-API-SERVICE: GraphQL Query mit Variablen                                     │
│                                                                                      │
│    buch-api.service.ts:                                                              │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ search(criteria: SearchCriteria): Observable<Buch[]> {                       │  │
│    │     const variables = this.buildSearchVariables(criteria);                   │  │
│    │                                                                              │  │
│    │     return this.http.post<GraphQLResponse>('/graphql', {                     │  │
│    │         query: `                                                             │  │
│    │             query BuecherSuche($spikeWerte: Spikevalue) {                    │  │
│    │                 buecher(spikeWerte: $spikeWerte) {                            │  │
│    │                     id                                                       │  │
│    │                     isbn                                                     │  │
│    │                     art                                                      │  │
│    │                     preis                                                    │  │
│    │                     rating                                                   │  │
│    │                     lieferbar                                                │  │
│    │                     schlagwoerter                                            │  │
│    │                     titel {                                                  │  │
│    │                         titel                                                │  │
│    │                         untertitel                                           │  │
│    │                     }                                                        │  │
│    │                     rabatt                                                   │  │
│    │                 }                                                            │  │
│    │             }                                                                │  │
│    │         `,                                                                   │  │
│    │         variables                                                            │  │
│    │     }).pipe(                                                                 │  │
│    │         map(res => res.data?.buecher ?? [])                                  │  │
│    │     );                                                                       │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    GraphQL-Query (generiert):                                                        │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ POST /graphql                                                                │  │
│    │ {                                                                            │  │
│    │     "query": "query BuecherSuche($suchWerte: Suchkriterien) { ... }",        │  │
│    │     "variables": {                                                           │  │
│    │         "suchWerte": {                                                       │  │
│    │             "titel": "Angular",                                              │  │
│    │             "art": "DRUCKAUSGABE",                                           │  │
│    │             "rating": 4                                                      │  │
│    │         }                                                                    │  │
│    │     }                                                                        │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼  HTTPS
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 6. PROXY: Request an Backend weiterleiten                                            │
│                                                                                      │
│    proxy.conf.json:                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ {                                                                            │  │
│    │     "/graphql": {                                                            │  │
│    │         "target": "https://localhost:3000",                                  │  │
│    │         "secure": false                                                      │  │
│    │     }                                                                        │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    http://localhost:4200/graphql → https://localhost:3000/graphql                    │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 7. BACKEND: GraphQL Resolver                                                         │
│                                                                                      │
│    src/buch/resolver/buch-query.resolver.ts:                                         │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ @Query('buecher')                                                            │  │
│    │ async find(                                                                  │  │
│    │     @Args() { spikeWerte }: SuchkriterienInput                               │  │
│    │ ): Promise<Buch[]> {                                                         │  │
│    │     this.#logger.debug('find: suchKriterien=%o', suchKriterien);             │  │
│    │                                                                              │  │
│    │     // Service-Aufruf mit Suchkriterien                                      │  │
│    │     const buecher = await this.#buchReadService.find(suchKriterien);         │  │
│    │                                                                              │  │
│    │     return buecher;                                                          │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 8. BUCH-READ-SERVICE: Prisma Query aufbauen                                          │
│                                                                                      │
│    src/buch/service/buch-read-service.ts:                                            │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ async find(suchkriterien?: Suchkriterien): Promise<Buch[]> {                 │  │
│    │     this.#logger.debug('find: suchKriterien=%o', suchKriterien);             │  │
│    │                                                                              │  │
│    │     // Where-Clause dynamisch aufbauen                                       │  │
│    │     const where: Prisma.BuchWhereInput = {};                                 │  │
│    │                                                                              │  │
│    │     if (suchkriterien?.titel) {                                              │  │
│    │         where.titel = {                                                      │  │
│    │             titel: {                                                         │  │
│    │                 contains: suchkriterien.titel,                               │  │
│    │                 mode: 'insensitive'  // Case-insensitive                     │  │
│    │             }                                                                │  │
│    │         };                                                                   │  │
│    │     }                                                                        │  │
│    │                                                                              │  │
│    │     if (suchkriterien?.rating) {                                             │  │
│    │         where.rating = { gte: suchkriterien.rating };                        │  │
│    │     }                                                                        │  │
│    │                                                                              │  │
│    │     if (suchkriterien?.lieferbar) {                                          │  │
│    │         where.lieferbar = true;                                              │  │
│    │     }                                                                        │  │
│    │                                                                              │  │
│    │     return this.#prisma.buch.findMany({                                      │  │
│    │         where,                                                               │  │
│    │         include: { titel: true, abbildungen: true },                         │  │
│    │         orderBy: { titel: { titel: 'asc' } }                                 │  │
│    │     });                                                                      │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 9. PRISMA: SQL Query generieren und ausführen                                        │
│                                                                                      │
│    Generiertes SQL (bei Suche nach "Angular" mit Rating >= 4):                       │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ SELECT                                                                       │  │
│    │     b.id, b.isbn, b.art, b.preis, b.rating, b.lieferbar,                     │  │
│    │     b.schlagwoerter, b.rabatt,                                               │  │
│    │     t.titel, t.untertitel                                                    │  │
│    │ FROM buch.buch b                                                             │  │
│    │ LEFT JOIN buch.titel t ON t.buch_id = b.id                                   │  │
│    │ WHERE                                                                        │  │
│    │     LOWER(t.titel) LIKE LOWER('%Angular%')                                   │  │
│    │     AND b.rating >= 4                                                        │  │
│    │ ORDER BY t.titel ASC;                                                        │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 10. RESPONSE: GraphQL JSON Antwort                                                   │
│                                                                                      │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ {                                                                            │  │
│    │     "data": {                                                                │  │
│    │         "buecher": [                                                         │  │
│    │             {                                                                │  │
│    │                 "id": 1,                                                     │  │
│    │                 "isbn": "978-3-7910-5000-7",                                 │  │
│    │                 "art": "DRUCKAUSGABE",                                       │  │
│    │                 "preis": 39.95,                                              │  │
│    │                 "rating": 5,                                                 │  │
│    │                 "lieferbar": true,                                           │  │
│    │                 "schlagwoerter": ["JAVASCRIPT", "TYPESCRIPT"],               │  │
│    │                 "titel": {                                                   │  │
│    │                     "titel": "Angular Masterclass",                          │  │
│    │                     "untertitel": "Von Anfänger zum Profi"                   │  │
│    │                 },                                                           │  │
│    │                 "rabatt": 0.05                                               │  │
│    │             },                                                               │  │
│    │             // ... weitere Bücher                                            │  │
│    │         ]                                                                    │  │
│    │     }                                                                        │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 11. FRONTEND: Ergebnisse anzeigen                                                    │
│                                                                                      │
│    search.component.ts:                                                              │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ <!-- Ergebnisliste -->                                                       │  │
│    │ <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">                 │  │
│    │     <div *ngFor="let buch of books" class="col">                             │  │
│    │         <div class="card h-100" (click)="openDetail(buch.id)">               │  │
│    │             <img [src]="getCoverUrl(buch)" class="card-img-top">             │  │
│    │             <div class="card-body">                                          │  │
│    │                 <h5 class="card-title">{{ buch.titel.titel }}</h5>           │  │
│    │                 <p class="card-text">{{ buch.titel.untertitel }}</p>         │  │
│    │                 <div class="d-flex justify-content-between">                 │  │
│    │                     <span>{{ buch.preis | currency:'EUR' }}</span>           │  │
│    │                     <span>{{ getStars(buch.rating) }}</span>                 │  │
│    │                 </div>                                                       │  │
│    │             </div>                                                           │  │
│    │         </div>                                                               │  │
│    │     </div>                                                                   │  │
│    │ </div>                                                                       │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    Ergebnis-Anzeige:                                                                 │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │  │
│    │  │  📘 Cover       │  │  📙 Cover       │  │  📕 Cover       │              │  │
│    │  │                 │  │                 │  │                 │              │  │
│    │  │ Angular Master  │  │ TypeScript Deep │  │ RxJS in Action  │              │  │
│    │  │ Von Anfänger... │  │ Fortgeschritten │  │ Reactive Prog.  │              │  │
│    │  │                 │  │                 │  │                 │              │  │
│    │  │ €39.95  ★★★★★   │  │ €49.95  ★★★★☆   │  │ €35.00  ★★★★★   │              │  │
│    │  └─────────────────┘  └─────────────────┘  └─────────────────┘              │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Beteiligte Dateien

### Frontend

| Datei                                                      | Rolle                              |
| ---------------------------------------------------------- | ---------------------------------- |
| `frontend/src/app/features/buch/pages/search.component.ts` | Suchformular, Ergebnis-Darstellung |
| `frontend/src/app/core/services/buch-api.service.ts`       | `search()` GraphQL Query           |

### Backend

| Datei                                      | Rolle                 |
| ------------------------------------------ | --------------------- |
| `src/buch/resolver/buch-query.resolver.ts` | GraphQL Query Handler |
| `src/buch/service/buch-read-service.ts`    | Prisma Query Builder  |

---

## 🔍 Wichtige Konzepte

### Reactive Forms (Angular)

```typescript
// FormGroup erstellen
this.searchForm = this.fb.group({
  titel: [''],
  rating: [null],
});

// Werte auslesen
const values = this.searchForm.value;

// Werte setzen
this.searchForm.patchValue({ titel: 'Angular' });

// Formular zurücksetzen
this.searchForm.reset();
```

### GraphQL Variable Mapping

```typescript
// Frontend: Kriterien in GraphQL-Variables umwandeln
private buildSearchVariables(criteria: SearchCriteria): object {
    return {
        suchWerte: {
            ...(criteria.titel && { titel: criteria.titel }),
            ...(criteria.rating && { rating: criteria.rating }),
            ...(criteria.art && { art: criteria.art })
        }
    };
}
```

### Prisma Where-Clause

```typescript
// Backend: Dynamische WHERE-Bedingungen
const where: Prisma.BuchWhereInput = {};

// contains = LIKE '%...%'
where.titel = { titel: { contains: 'Angular', mode: 'insensitive' } };

// gte = >=
where.rating = { gte: 4 };

// equals (implicit)
where.art = 'DRUCKAUSGABE';
```

---

## ⚠️ Fehlerszenarien

| Fehler           | Ursache                 | Frontend-Reaktion               |
| ---------------- | ----------------------- | ------------------------------- |
| Keine Ergebnisse | Keine Bücher gefunden   | "Keine Bücher gefunden" Meldung |
| Netzwerkfehler   | Server nicht erreichbar | Fehler-Alert anzeigen           |
| GraphQL-Fehler   | Ungültige Query         | Fehler aus Response extrahieren |

---

_Weiter zu: [03-detailseite-oeffnen.md](03-detailseite-oeffnen.md)_

# Technische Details - Zusammenspiel der Komponenten

## 🔄 Datenfluss und Komponentenkommunikation

### 1. Warenkorb-System: End-to-End Datenfluss

```
┌─────────────────────────────────────────────────────────────────┐
│                    Warenkorb Datenfluss                          │
└─────────────────────────────────────────────────────────────────┘

DetailComponent                    CartService                 CartComponent
     │                                 │                             │
     │  1. addToCart()                │                             │
     ├────────────────────────────────>│                             │
     │                                 │                             │
     │                            2. Prüfe: Item                    │
     │                               existiert?                      │
     │                                 │                             │
     │                            3. Ja: Menge++                     │
     │                            4. Nein: Neu hinzufügen            │
     │                                 │                             │
     │                            5. localStorage.setItem()          │
     │                                 │                             │
     │                            6. BehaviorSubject.next()          │
     │                                 ├─────────────────────────────>
     │                                 │                             │
     │  7. Success Alert              │         8. Komponente        │
     │<────────────────────────────────│            reagiert auf     │
     │    anzeigen                     │            Observable       │
     │                                 │                             │
     │                                 │         9. Template Update  │
     │                                 │         10. Preisberechnung │
     │                                 │                             │
```

#### Implementierungsdetails:

**CartService (cart.service.ts)**

```typescript
export class CartService {
  private readonly STORAGE_KEY = 'buchhandlung_cart';
  private itemsSubject = new BehaviorSubject<CartItem[]>(
    this.loadFromStorage(),
  );

  // Public Observable für Komponenten
  public items$ = this.itemsSubject.asObservable();

  addItem(buch: BuchItem) {
    const items = this.itemsSubject.value;
    const existing = items.find((i) => i.id === buch.id);

    if (existing) {
      existing.quantity++;
    } else {
      items.push({ ...buch, quantity: 1 });
    }

    this.saveAndNotify(items);
  }

  private saveAndNotify(items: CartItem[]) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
    this.itemsSubject.next(items); // Alle Subscriber werden benachrichtigt
  }
}
```

**Warum BehaviorSubject?**

- Speichert aktuellen Wert (auch für späte Subscriber)
- Multicast: Mehrere Komponenten können gleichzeitig subscriben
- Reactive: Automatische Updates bei Änderungen

---

### 2. Merkliste-System: Toggle-Mechanismus

```
┌─────────────────────────────────────────────────────────────────┐
│                   Wishlist Toggle Datenfluss                     │
└─────────────────────────────────────────────────────────────────┘

DetailComponent                WishlistService            WishlistComponent
     │                              │                            │
     │  1. onToggleWishlist()      │                            │
     ├─────────────────────────────>│                            │
     │                              │                            │
     │                         2. isInWishlist()                 │
     │                              │                            │
     │                         3. Ja: removeItem()               │
     │                         4. Nein: addItem()                │
     │                              │                            │
     │                         5. localStorage.setItem()         │
     │                              │                            │
     │                         6. BehaviorSubject.next()         │
     │                              ├────────────────────────────>
     │                              │                            │
     │  7. Button-Style Update     │        8. Grid neu         │
     │     (rot ↔ grau)             │           rendern          │
     │                              │                            │
```

#### Besonderheit: Synchroner UI-Feedback

**DetailComponent Template**

```html
<button
  [ngClass]="isInWishlist() ? 'btn-danger' : 'btn-outline-secondary'"
  (click)="onToggleWishlist()"
>
  {{ isInWishlist() ? '❤️ Gemerkt' : '🤍 Merken' }}
</button>
```

**Synchronisation über Observable**

```typescript
export class DetailComponent {
  wishlistService = inject(WishlistService);

  isInWishlist(): boolean {
    // Direkter Zugriff auf BehaviorSubject-Wert
    return this.wishlistService.isInWishlist(this.buch!.id!);
  }

  onToggleWishlist() {
    this.wishlistService.toggleItem(this.buch!);
    // Kein manuelles Update nötig - Angular Change Detection regelt automatisch
  }
}
```

---

### 3. Carousel-System: Datenbeschaffung und Rendering

```
┌─────────────────────────────────────────────────────────────────┐
│              Landing Page Carousel Datenfluss                    │
└─────────────────────────────────────────────────────────────────┘

LandingPageComponent          BuchApiService          BookCarouselComponent
     │                              │                            │
     │  ngOnInit()                  │                            │
     ├──────────────────────────────┤                            │
     │                              │                            │
     │  loadCarouselBooks()         │                            │
     │                              │                            │
     │  ┌─────────────────────┐    │                            │
     │  │ Promise.all([       │    │                            │
     │  │   query1: Neu       │────>──> GraphQL: size=10        │
     │  │   query2: Beliebt   │────>──> GraphQL: filter rating  │
     │  │   query3: Schwabenp.│────>──> GraphQL: sort preis     │
     │  └─────────────────────┘    │                            │
     │                              │                            │
     │  Responses empfangen         │                            │
     │<─────────────────────────────┤                            │
     │                              │                            │
     │  Filter & Sort anwenden      │                            │
     │  - Rating >= 4               │                            │
     │  - lieferbar === true        │                            │
     │  - sort by preis asc         │                            │
     │                              │                            │
     │  [books] Input Binding       │                            │
     ├─────────────────────────────────────────────────────────>│
     │                              │                            │
     │                              │    Render Carousel         │
     │                              │    - Horizontal Scroll     │
     │                              │    - Arrow Navigation      │
     │                              │    - Responsive Cards      │
```

#### GraphQL Query-Optimierung

**Schwabenpreis Query (günstigste Bücher)**

```typescript
this.api.list({ size: 15, sortierung: 'preisAsc' }).subscribe({
  next: (result) => {
    this.booksRecommended = result.content
      .filter((book) => book.lieferbar && book.preis && book.preis > 0)
      .sort((a, b) => (a.preis || 0) - (b.preis || 0))
      .slice(0, 10);
  },
});
```

**Warum zweistufige Filterung?**

1. **Backend**: Sortierung nach Preis (schnell, indexiert)
2. **Frontend**: Zusätzlicher Filter für Lieferbarkeit (flexible Client-Logik)
3. **Slice**: Nur Top 10 für Performance

---

### 4. Dark Mode: Theme-Switching Mechanismus

```
┌─────────────────────────────────────────────────────────────────┐
│                  Dark Mode Theme-Wechsel                         │
└─────────────────────────────────────────────────────────────────┘

Browser                    AppComponent              Alle Komponenten
  │                             │                            │
  │  System Preference         │                            │
  │  prefers-color-scheme      │                            │
  ├────────────────────────────>│                            │
  │                             │                            │
  │                        ngOnInit()                        │
  │                        - localStorage check              │
  │                        - matchMedia()                    │
  │                             │                            │
  │                        isDarkMode = true/false           │
  │                             │                            │
  │                        Template Binding:                 │
  │                        [class.theme-dark]="isDarkMode"   │
  │                             │                            │
  │  <body class="theme-dark">  │                            │
  │<────────────────────────────┤                            │
  │                             │                            │
  │                             │  CSS Custom Properties      │
  │                             │  --app-bg: #3a3f47         │
  │                             │  --app-text: #eceff4       │
  │                             │                            │
  │                             │  :host-context(.theme-dark)│
  │                             ├────────────────────────────>
  │                             │                            │
  │                             │        Re-render mit       │
  │                             │        Dark Styles         │
```

#### CSS Custom Properties System

**styles.css (Root Level)**

```css
:root {
  --color-bg-light: #f3f4f6;
  --color-bg-dark: #3a3f47;
  --color-text-light: #111827;
  --color-text-dark: #eceff4;
}

.theme-light {
  --app-bg: var(--color-bg-light);
  --app-text: var(--color-text-light);
}

.theme-dark {
  --app-bg: var(--color-bg-dark);
  --app-text: var(--color-text-dark);
}

body {
  background: var(--app-bg);
  color: var(--app-text);
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}
```

**Komponenten-Level Styles**

```css
/* detail.component.ts */
.product-card {
  background: white;
  color: #212529;
}

:host-context(.theme-dark) .product-card {
  background: #1f2937;
  color: #f3f4f6;
}
```

**Vorteile dieses Ansatzes:**

- Zentrale Theme-Verwaltung
- Smooth Transitions
- Keine JavaScript-Manipulation von Styles
- Performance-optimiert (CSS-only)

---

### 5. GraphQL Integration: API-Kommunikation

```
┌─────────────────────────────────────────────────────────────────┐
│              GraphQL Kommunikationsfluss                         │
└─────────────────────────────────────────────────────────────────┘

Component              BuchApiService         HttpClient        Backend
   │                         │                     │               │
   │  getById(1082)         │                     │               │
   ├────────────────────────>│                     │               │
   │                         │                     │               │
   │                    Build Query:               │               │
   │                    ┌───────────────┐          │               │
   │                    │ query {       │          │               │
   │                    │   buch(id:...) {         │               │
   │                    │     titel     │          │               │
   │                    │     preis     │          │               │
   │                    │     beschr.   │          │               │
   │                    │   }           │          │               │
   │                    └───────────────┘          │               │
   │                         │                     │               │
   │                    POST Request               │               │
   │                         ├─────────────────────>───────────────>
   │                         │                     │               │
   │                         │                     │  GraphQL      │
   │                         │                     │  Resolver     │
   │                         │                     │               │
   │                         │                     │  Prisma Query │
   │                         │                     │  findUnique() │
   │                         │                     │               │
   │                         │              Response              │
   │                         │<─────────────────────<──────────────
   │                         │                     │               │
   │                    Error Check:               │               │
   │                    - GraphQL errors?          │               │
   │                    - Network errors?          │               │
   │                         │                     │               │
   │                    Transform Data             │               │
   │                    - Rabatt parsen            │               │
   │                    - Type Mapping             │               │
   │                         │                     │               │
   │  Observable<BuchItem>  │                     │               │
   │<────────────────────────┤                     │               │
   │                         │                     │               │
   │  subscribe()            │                     │               │
   │  - next: data           │                     │               │
   │  - error: handling      │                     │               │
```

#### Error Handling Strategy

**BuchApiService**

```typescript
getById(id: number): Observable<BuchItem> {
  return executeGraphQL<{ buch: BuchItem }>(
    this.http,
    BUCH_BY_ID_QUERY,
    { id: id.toString() }
  ).pipe(
    map(response => {
      // 1. GraphQL-spezifische Fehler
      if (response.errors && response.errors.length > 0) {
        const errorMsg = response.errors.map(e => e.message).join(', ');
        throw new Error(`GraphQL-Fehler: ${errorMsg}`);
      }

      // 2. Daten-Validierung
      if (!response.data?.buch) {
        throw new Error(`Buch mit ID ${id} nicht gefunden`);
      }

      // 3. Daten-Transformation
      const buch = response.data.buch;
      const rabattValue = (buch as any).rabatt;
      if (typeof rabattValue === 'string') {
        const m = /^([\d.]+)/.exec(rabattValue);
        (buch as any).rabatt = m ? parseFloat(m[1]) : 0;
      }

      return buch;
    })
  );
}
```

---

### 6. Routing und Navigation Guards

```
┌─────────────────────────────────────────────────────────────────┐
│                  Routing mit Auth Guard                          │
└─────────────────────────────────────────────────────────────────┘

Browser URL Change        Router               AuthGuard          Component
      │                     │                      │                  │
      │  /new               │                      │                  │
      ├─────────────────────>│                      │                  │
      │                     │                      │                  │
      │                canActivate()               │                  │
      │                     ├──────────────────────>                  │
      │                     │                      │                  │
      │                     │           Check:     │                  │
      │                     │           isLoggedIn$                   │
      │                     │                      │                  │
      │                     │           ┌──────────┤                  │
      │                     │           │ Token    │                  │
      │                     │           │ valid?   │                  │
      │                     │           └──────────┤                  │
      │                     │                      │                  │
      │                     │    true: Navigate    │                  │
      │                     │<─────────────────────┤                  │
      │                     ├─────────────────────────────────────────>
      │                     │                      │                  │
      │                     │    false: Redirect   │    NewComponent  │
      │                     │         to /login    │    aktiviert     │
```

#### Route-Konfiguration

**main.ts**

```typescript
export const routes: Route[] = [
  { path: '', component: LandingPageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'search', component: SearchComponent },
  { path: 'detail/:id', component: DetailComponent },
  { path: 'cart', component: CartComponent }, // NEU
  { path: 'wishlist', component: WishlistComponent }, // NEU
  {
    path: 'new',
    component: NewComponent,
    canActivate: [authGuard], // Geschützte Route
  },
  { path: 'kontakt', component: KontaktComponent },
  { path: 'impressum', component: ImpressumComponent },
];
```

---

## 🔧 Technische Best Practices

### 1. **Standalone Components** (Angular 19)

```typescript
@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NgbAlert],
  template: `...`,
  styles: [`...`]
})
```

**Vorteile:**

- Kein NgModule nötig
- Lazy Loading per Component
- Bessere Tree-Shaking
- Explizite Abhängigkeiten

### 2. **RxJS BehaviorSubject für State**

```typescript
private itemsSubject = new BehaviorSubject<CartItem[]>([]);
public items$ = this.itemsSubject.asObservable();
```

**Vorteile:**

- Reactive State Management
- Automatische Change Detection
- Type-Safe Observables
- Memory-Leak-Prävention durch Unsubscribe

### 3. **localStorage als Client-Side Cache**

```typescript
private saveToStorage(items: CartItem[]): void {
  localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
}

private loadFromStorage(): CartItem[] {
  const data = localStorage.getItem(this.STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}
```

**Vorteile:**

- Persistenz über Sessions hinweg
- Kein Backend-Request für Cart/Wishlist
- Schnelle Load-Times
- Offline-Fähigkeit

### 4. **CSS Custom Properties für Theming**

```css
:root {
  --app-bg: var(--color-bg-light);
  --app-text: var(--color-text-light);
}

.theme-dark {
  --app-bg: var(--color-bg-dark);
  --app-text: var(--color-text-dark);
}
```

**Vorteile:**

- Ein Theme-Switch für gesamte App
- CSS-only (keine JS-Manipulation)
- Smooth Transitions
- Performance-optimiert

### 5. **GraphQL für effiziente Datenabfragen**

```graphql
query BuchById($id: ID!) {
  buch(id: $id) {
    id
    titel {
      titel
      untertitel
    }
    preis
    beschreibung
    autorBiographie
  }
}
```

**Vorteile:**

- Nur benötigte Felder laden (kein Over-Fetching)
- Single Request für komplexe Daten
- Stark typisiert
- Versionierung nicht nötig

---

## 📊 Performance-Optimierungen

### 1. Lazy Loading von Routen

```typescript
// Zukünftig möglich:
{ path: 'admin', loadComponent: () => import('./admin.component') }
```

### 2. OnPush Change Detection (empfohlen für Zukunft)

```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 3. trackBy für ngFor

```typescript
trackByBookId(index: number, item: BuchItem): number {
  return item.id!;
}
```

### 4. Reactive Forms für große Formulare

```typescript
// Aktuell: Template-Driven Forms
// Empfehlung für Skalierung: Reactive Forms
```

---

## 🎯 Zusammenfassung der Architektur-Entscheidungen

| Feature                | Technologie          | Begründung                             |
| ---------------------- | -------------------- | -------------------------------------- |
| **Frontend Framework** | Angular 19           | Modern, Enterprise-ready, TypeScript   |
| **UI Library**         | Bootstrap 5          | Responsive Grid, Component Library     |
| **State Management**   | RxJS BehaviorSubject | Reactive, Observable-basiert           |
| **Persistenz**         | localStorage         | Client-side, schnell, offline-fähig    |
| **API**                | GraphQL              | Effizient, typsicher, flexible Queries |
| **Styling**            | CSS Custom Props     | Theme-Support, Performance             |
| **Routing**            | Angular Router       | Integriert, Guards, Lazy Loading       |
| **Testing**            | Vitest + Playwright  | Schnell, moderne API, E2E-Support      |

---

## 🚀 Weiterentwicklungs-Potenzial

### Kurzfristig (nächste Sprints)

- [ ] Checkout-Prozess für Warenkorb
- [ ] Benutzer-Authentifizierung persistieren
- [ ] Filterung nach Genres/Kategorien
- [ ] Volltextsuche mit Highlighting

### Mittelfristig (nächste Monate)

- [ ] Bestellhistorie
- [ ] Bewertungssystem
- [ ] Social Sharing
- [ ] PWA mit Service Worker

### Langfristig (Vision)

- [ ] Recommendation Engine (ML)
- [ ] Multi-Language Support (i18n)
- [ ] Real-time Notifications (WebSockets)
- [ ] Micro-Frontend Architecture

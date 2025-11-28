# Buch-Empfehlungskarussell - Implementierungsdokumentation

## Übersicht

Diese Dokumentation beschreibt die Implementierung des Empfehlungskarussells auf der Buch-Detailseite, das ähnliche Bücher aus derselben Kategorie anzeigt.

## Implementierte Features

### 1. Service-Erweiterung (`BuchApiService`)

#### Neue Methode: `getRelated()`

```typescript
getRelated(
    currentBuchId: number,
    art?: 'EPUB' | 'HARDCOVER' | 'PAPERBACK',
    maxResults = 10
): Observable<BuchItem[]>
```

**Funktionalität:**

- Lädt ähnliche Bücher basierend auf der Buch-Art
- Filtert das aktuelle Buch aus den Ergebnissen
- Konvertiert String-Rabatte automatisch zu Zahlen
- Begrenzt die Anzahl der Ergebnisse auf `maxResults`
- Fehlerbehandlung mit aussagekräftigen Fehlermeldungen

**GraphQL-Query:**
Verwendet `RELATED_BUECHER_QUERY` aus `graphql-queries.ts`, die bereits vorhanden ist.

### 2. Detail-Komponente (`DetailComponent`)

#### Neue Properties

```typescript
related: BuchItem[] = [];           // Array ähnlicher Bücher
relatedLoading = false;              // Ladezustand
relatedError: string | null = null;  // Fehlermeldungen
```

#### Neue Methoden

**`loadRelated()`**

- Private Methode zum Laden ähnlicher Bücher
- Wird automatisch aufgerufen nachdem das Hauptbuch geladen wurde
- Parameter: `currentId`, `art`, Anzahl (10)
- Fehlerbehandlung mit Logging und Benutzer-Feedback

**`getChunks<T>(array: T[], chunkSize: number): T[][]`**

- Hilfsfunktion zum Aufteilen eines Arrays in Chunks
- Wird für Desktop-Karussell verwendet (3 Bücher pro Slide)
- Generisch und wiederverwendbar

### 3. UI-Implementierung

#### Responsive Karussell

Das Karussell passt sich automatisch an die Bildschirmgröße an:

**Desktop (≥ md Breakpoint):**

- 3 Bücher pro Slide in Bootstrap-Grid (col-md-4)
- Navigation nur sichtbar bei mehr als 3 Büchern
- Chunks-basierte Darstellung

**Mobile (< md Breakpoint):**

- 1 Buch pro Slide
- Zentrierte Darstellung mit max-width: 350px
- Navigation bei mehr als 1 Buch

#### Buch-Karten (recommendation-card)

Jede Karte zeigt:

- Cover-Bild (Platzhalter 120x170px)
- Titel (max. 2 Zeilen mit Ellipsis)
- Preis (formatiert in EUR)
- Rating-Badge (Sterne-Symbol)
- Art-Badge (EPUB/HARDCOVER/PAPERBACK)
- "Details ansehen"-Button mit RouterLink

#### States

- **Loading:** Spinner mit "Lädt Empfehlungen..."
- **Error:** Warning-Alert mit Fehlermeldung (dismissible)
- **Empty:** "Keine weiteren Empfehlungen verfügbar"
- **Success:** Karussell mit Büchern

### 4. Styling

#### CSS-Klassen

```css
.recommendation-card {
  /* Hover-Effekt: Lift + Shadow */
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.recommendation-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}
```

#### Design-Prinzipien

- **Konsistenz:** Verwendet Bootstrap-Komponenten und -Farben
- **Accessibility:** ARIA-Labels, Semantic HTML
- **Performance:** Lazy Loading, optimierte Queries
- **User Experience:** Smooth Transitions, klare Feedback-Mechanismen

### 5. Tests

#### Detail-Komponente Tests (`detail.component.spec.ts`)

**Test-Kategorien:**

1. **Initialisierung und Laden**
   - Komponente erstellen
   - Buch laden bei Init
   - Fehlerbehandlung (HTTP-Error, ungültige ID)

2. **Ähnliche Bücher / Empfehlungen**
   - Laden nach Hauptbuch-Load
   - Karussell-Rendering (vorhanden/nicht vorhanden)
   - Fehlerbehandlung
   - Loading-State

3. **getChunks() Hilfsfunktion**
   - Gleichmäßige Arrays
   - Ungleichmäßige Arrays
   - Edge Cases (leer, ein Element)

4. **Navigation**
   - RouterLinks in Empfehlungs-Karten

5. **UI-Rendering**
   - Titel, Preis, Rating, Badges
   - Schwabenpreis-Feature
   - Schlagwörter

6. **Responsive Verhalten**
   - col-md-4 Klassen vorhanden

#### Service Tests (`buch-api.service.spec.ts`)

**Test-Kategorien:**

1. **getRelated() Methode**
   - Laden mit Art-Filter
   - Laden ohne Filter
   - Aktuelles Buch filtern
   - maxResults respektieren
   - String-Rabatt konvertieren
   - Leere Ergebnisse
   - GraphQL-Fehler
   - Fehlende Daten

2. **getById() Methode**
   - Rabatt-Konvertierung

**Mocking:**

- `HttpClientTestingModule` für HTTP-Calls
- `RouterTestingModule` für Navigation
- Jasmine Spies für Services

### 6. Technologie-Stack

- **Framework:** Angular 19 (Standalone Components)
- **UI-Library:** ng-bootstrap 19.0.1
- **State Management:** RxJS 7.8
- **API:** GraphQL
- **Testing:** Jasmine/Karma (@angular/core/testing)
- **Styling:** Bootstrap 5 + Custom CSS

## Verwendung

### Automatischer Ablauf

1. Benutzer navigiert zu `/detail/:id`
2. Detail-Komponente lädt Buch-Details via `getById()`
3. Nach erfolgreichem Laden: `loadRelated()` wird aufgerufen
4. Service lädt ähnliche Bücher mit gleicher Art
5. Karussell wird gerendert (Desktop: 3 pro Slide, Mobile: 1 pro Slide)
6. Benutzer kann durch Empfehlungen navigieren
7. Klick auf "Details ansehen" → Navigation zu `/detail/:newId`
8. Zyklus beginnt von vorn

### Fehlerbehandlung

- Netzwerkfehler werden abgefangen und als Alert angezeigt
- Logging in Console für Debugging
- App stürzt nicht ab bei Fehlern
- Benutzer kann Alerts dismissen

## Erweiterungsmöglichkeiten

### Kurzfristig

- [ ] Cover-URLs vom Backend laden (statt Platzhalter)
- [ ] Empfehlungs-Algorithmus verfeinern (Schlagwörter-Matching)
- [ ] Lazy Loading für Carousel-Images
- [ ] Animationen verbessern (ngAnimate)

### Mittelfristig

- [ ] Caching für ähnliche Bücher (Service Worker)
- [ ] A/B-Testing verschiedener Empfehlungs-Strategien
- [ ] Personalisierte Empfehlungen (User-Preferences)
- [ ] Infinite Carousel mit mehr Büchern

### Langfristig

- [ ] Machine Learning-basierte Empfehlungen
- [ ] Collaborative Filtering
- [ ] "Kunden kauften auch"-Funktion

## Testing

### Ausführen

```bash
# Alle Tests
ng test

# Tests im Watch-Mode
ng test --watch

# Coverage
ng test --code-coverage
```

### Coverage-Ziele

- **Statements:** > 90%
- **Branches:** > 85%
- **Functions:** > 90%
- **Lines:** > 90%

## Performance

### Optimierungen

- GraphQL-Queries statt REST (weniger Daten)
- Observable-basiert (automatisches Cleanup)
- OnPush Change Detection (optional für Zukunft)
- Lazy Loading von Empfehlungen (nur bei Bedarf)

### Metriken

- **Time to Interactive:** < 2s (nach Hauptbuch-Load)
- **API-Call Zeit:** < 500ms (bei normalem Netzwerk)
- **Render-Zeit:** < 100ms

## Bekannte Einschränkungen

1. **Cover-Bilder:** Aktuell nur Platzhalter, da Backend-Endpunkt fehlt
2. **Empfehlungs-Logik:** Basiert nur auf `art`, nicht auf Schlagwörtern (Backend-Limitation)
3. **Infinite Scroll:** Noch nicht implementiert
4. **Caching:** Noch keine intelligente Cache-Strategie

## Änderungshistorie

### Version 1.0 (28.11.2025)

- ✅ Initiale Implementierung
- ✅ Service-Erweiterung (getRelated)
- ✅ Responsive Karussell (Desktop/Mobile)
- ✅ Umfassende Unit-Tests
- ✅ Dokumentation

---

**Autor:** Senior Angular Developer
**Projekt:** SWE_Angular_Buch
**Letzte Aktualisierung:** 28. November 2025

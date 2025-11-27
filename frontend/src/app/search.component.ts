import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { BuchApiService, BuchItem, BuchPage } from './buch-api.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [
        CommonModule,
        NgFor,
        NgIf,
        FormsModule,
        RouterLink,
        NgbPagination,
    ],
    template: `
        <div style="max-width: 1000px; margin: 0 auto;">
            <h1>Suche</h1>

            <!-- Suchformular -->
            <div
                style="border: 1px solid #ccc; padding: 16px; margin-bottom: 20px; border-radius: 4px;"
            >
                <h2 style="margin-top: 0;">Suchkriterien</h2>

                <div style="margin-bottom: 12px;">
                    <label
                        for="suchtext"
                        style="display: block; margin-bottom: 4px; font-weight: 600;"
                    >
                        Suchtext (Titel oder ISBN):
                    </label>
                    <input
                        id="suchtext"
                        type="text"
                        [(ngModel)]="formData.suchtext"
                        placeholder="z.B. TypeScript oder 978-3..."
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
                    />
                </div>

                <div style="margin-bottom: 12px;">
                    <label
                        for="ratingFilter"
                        style="display: block; margin-bottom: 4px; font-weight: 600;"
                    >
                        Bewertung (Rating):
                    </label>
                    <select
                        id="ratingFilter"
                        [(ngModel)]="formData.ratingFilter"
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
                    >
                        <option value="">– Alle –</option>
                        <option value="1">≥ 1 Stern</option>
                        <option value="3">≥ 3 Sterne</option>
                        <option value="5">≥ 5 Sterne</option>
                    </select>
                </div>

                <div style="margin-bottom: 12px;">
                    <label
                        style="display: block; margin-bottom: 4px; font-weight: 600;"
                        >Sortierung:</label
                    >
                    <div>
                        <label style="margin-right: 20px;">
                            <input
                                type="radio"
                                name="sortierung"
                                [(ngModel)]="formData.sortierung"
                                value="preisAsc"
                            />
                            Preis aufsteigend
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="sortierung"
                                [(ngModel)]="formData.sortierung"
                                value="preisDesc"
                            />
                            Preis absteigend
                        </label>
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label>
                        <input
                            type="checkbox"
                            [(ngModel)]="formData.nurMitRating"
                        />
                        Nur Bücher mit gesetztem Rating anzeigen
                    </label>
                </div>

                <button
                    (click)="onSearch()"
                    style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;"
                >
                    Suchen
                </button>
            </div>

            <!-- Fehleranzeige -->
            <div
                *ngIf="error"
                style="color: white; background-color: crimson; padding: 12px; margin-bottom: 12px; border-radius: 4px; font-weight: 600;"
            >
                ⚠ Fehler beim Laden der Daten: {{ error }}
            </div>

            <!-- Ladezustand -->
            <div *ngIf="isLoading" style="color: #666; font-style: italic;">
                Lädt...
            </div>

            <!-- Ergebnisse -->
            <div *ngIf="!isLoading && items !== null">
                <h2>Ergebnisse ({{ totalElements }} Einträge)</h2>

                <table
                    *ngIf="items && items.length > 0"
                    style="width: 100%; border-collapse: collapse; margin-top: 12px;"
                >
                    <thead>
                        <tr
                            style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;"
                        >
                            <th
                                style="text-align: left; padding: 8px; border-right: 1px solid #ddd;"
                            >
                                ID
                            </th>
                            <th
                                style="text-align: left; padding: 8px; border-right: 1px solid #ddd;"
                            >
                                Titel / ISBN
                            </th>
                            <th style="text-align: left; padding: 8px;">
                                Preis
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            *ngFor="let b of items; let odd = odd"
                            [style.background-color]="odd ? 'white' : '#f9f9f9'"
                        >
                            <td
                                style="padding: 8px; border-right: 1px solid #ddd; border-bottom: 1px solid #eee;"
                            >
                                <a
                                    [routerLink]="['/detail', b.id]"
                                    style="color: #007bff; text-decoration: none; font-weight: 600;"
                                    >{{ b.id }}</a
                                >
                            </td>
                            <td
                                style="padding: 8px; border-right: 1px solid #ddd; border-bottom: 1px solid #eee;"
                            >
                                <a
                                    [routerLink]="['/detail', b.id]"
                                    style="color: #007bff; text-decoration: none;"
                                >
                                    {{ b.titel?.titel || b.isbn || '–' }}
                                </a>
                            </td>
                            <td
                                style="padding: 8px; border-bottom: 1px solid #eee;"
                            >
                                {{
                                    b.preis != null
                                        ? (b.preis
                                          | currency
                                              : 'EUR'
                                              : 'symbol'
                                              : '1.2-2')
                                        : '–'
                                }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div
                    *ngIf="items && items.length === 0"
                    style="color: #666; padding: 12px; background-color: #f9f9f9; border-radius: 4px;"
                >
                    Keine Einträge gefunden.
                </div>

                <!-- NG Bootstrap Pagination -->
                <div
                    *ngIf="items && items.length > 0 && totalPages > 1"
                    style="margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 12px;"
                >
                    <ngb-pagination
                        [(page)]="ngbPage"
                        [pageSize]="pageSize"
                        [collectionSize]="totalElements"
                        [maxSize]="5"
                        [rotate]="true"
                        [boundaryLinks]="true"
                        (pageChange)="onPageChange($event)"
                        aria-label="Seitennavigation"
                    ></ngb-pagination>
                    <span
                        style="font-weight: 600; color: #666; font-size: 0.9em;"
                    >
                        Zeige {{ currentPage * pageSize + 1 }} bis
                        {{
                            Math.min(
                                (currentPage + 1) * pageSize,
                                totalElements
                            )
                        }}
                        von {{ totalElements }} Einträgen
                    </span>
                </div>
            </div>
        </div>
    `,
})
export class SearchComponent implements OnInit {
    items: BuchItem[] | null = null;
    error: string | null = null;
    isLoading = false;

    // Pagination State
    currentPage = 0;
    pageSize = 10;
    totalPages = 0;
    totalElements = 0;
    ngbPage = 1; // NG Bootstrap verwendet 1-basierte Seiten
    Math = Math; // Für Template-Zugriff
    private cachedTotalForFilter?: number; // Gespeicherte echte Gesamtanzahl bei Filtern

    formData = {
        suchtext: '',
        ratingFilter: '',
        sortierung: 'preisAsc',
        nurMitRating: false,
    };

    constructor(private readonly api: BuchApiService) {}

    ngOnInit(): void {
        // Initial laden - mit Fehlerbehandlung
        try {
            this.onSearch();
        } catch (err) {
            this.error = `Fehler beim Initialisieren: ${err instanceof Error ? err.message : String(err)}`;
            this.isLoading = false;
        }
    }

    /**
     * Baut die Such- und Paging-Parameter basierend auf aktuellem State
     */
    private buildSearchParams(): {
        page: number;
        size: number;
        titel?: string;
        rating?: number;
        sortierung?: 'preisAsc' | 'preisDesc';
    } {
        const params: any = {
            page: this.currentPage,
            size: this.pageSize,
        };

        // Sortierung (nur wenn explizit gesetzt)
        if (this.formData.sortierung) {
            params.sortierung = this.formData.sortierung;
        }

        // Titel-Suche (Backend unterstützt titel-Parameter)
        const suchtext = (this.formData.suchtext || '').trim();
        if (suchtext.length > 0) {
            params.titel = suchtext;
        }

        // Rating-Filter (Backend unterstützt rating-Parameter)
        if (this.formData.ratingFilter) {
            params.rating = Number.parseInt(this.formData.ratingFilter, 10);
        }

        return params;
    }

    onSearch(resetPage = true): void {
        if (resetPage) {
            this.currentPage = 0;
            this.cachedTotalForFilter = undefined; // Reset bei neuer Suche
        }

        this.isLoading = true;
        this.error = null;
        this.items = null;

        try {
            const hasFilter =
                !!this.formData.ratingFilter ||
                !!this.formData.suchtext?.trim();

            // Bei Filtern und erster Seite: Zähle erstmal alle mit size=100
            if (resetPage && hasFilter) {
                const countParams = {
                    page: 0,
                    size: 100,
                    ...(this.formData.suchtext?.trim() && {
                        titel: this.formData.suchtext.trim(),
                    }),
                    ...(this.formData.ratingFilter && {
                        rating: Number.parseInt(this.formData.ratingFilter, 10),
                    }),
                };
                this.api.list(countParams).subscribe({
                    next: (countPage: BuchPage) => {
                        const realTotal = countPage.content.length;
                        this.cachedTotalForFilter = realTotal;
                        // Berechne totalPages vor dem ersten Laden
                        this.totalPages = Math.ceil(realTotal / this.pageSize);
                        this.totalElements = realTotal;

                        // Jetzt mit korrekten totalPages die Suchparameter bauen
                        const params = this.buildSearchParams();
                        this.api.list(params).subscribe({
                            next: (page: BuchPage) => {
                                this.processPageData(page, params, realTotal);
                            },
                            error: (err) => this.handleError(err),
                        });
                    },
                    error: (err) => {
                        // Fallback: Lade ohne Count
                        const params = this.buildSearchParams();
                        this.api.list(params).subscribe({
                            next: (page: BuchPage) => {
                                this.processPageData(
                                    page,
                                    params,
                                    this.cachedTotalForFilter,
                                );
                            },
                            error: (err2) => this.handleError(err2),
                        });
                    },
                });
            } else {
                // Normale Pagination oder ohne Filter
                const params = this.buildSearchParams();
                this.api.list(params).subscribe({
                    next: (page: BuchPage) => {
                        this.processPageData(
                            page,
                            params,
                            this.cachedTotalForFilter,
                        );
                    },
                    error: (err) => this.handleError(err),
                });
            }
        } catch (err) {
            this.error = `Fehler bei der Suche: ${err instanceof Error ? err.message : String(err)}`;
            this.items = [];
            this.isLoading = false;
        }
    }

    private processPageData(
        page: BuchPage,
        params: any,
        knownTotal?: number,
    ): void {
        let filtered = page.content;

        // Clientseitige Filter (nur für Optionen, die Backend nicht unterstützt)

        // nurMitRating: nur Einträge mit gesetztem Rating
        if (this.formData.nurMitRating) {
            filtered = filtered.filter(
                (b) => b.rating !== undefined && b.rating !== null,
            );
        }

        // Sortierung erfolgt im Backend via sort-Parameter
        // Keine clientseitige Sortierung mehr nötig

        // Pagination-Metadaten speichern
        this.currentPage = page.page.number;
        this.ngbPage = this.currentPage + 1; // Synchronisiere NG Bootstrap Page (1-basiert)
        this.items = filtered;

        const hasFilter = !!params.rating || !!params.titel;

        if (filtered.length < this.pageSize) {
            // Definitiv letzte Seite - weniger als pageSize Einträge
            this.totalPages = this.currentPage + 1;
            const calculatedTotal =
                this.currentPage * this.pageSize + filtered.length;
            this.totalElements = calculatedTotal;

            // Speichere echte Gesamtanzahl für zukünftige Navigationen
            if (hasFilter) {
                this.cachedTotalForFilter = calculatedTotal;
            }
        } else if (knownTotal !== undefined) {
            // Wir kennen die echte Gesamtanzahl von vorherigem Durchlauf
            this.totalElements = knownTotal;
            this.totalPages = Math.ceil(knownTotal / this.pageSize);
        } else if (hasFilter) {
            // Bei Filtern ohne bekannte Gesamtanzahl: Konservative Schätzung
            this.totalPages = this.currentPage + 2;
            this.totalElements =
                (this.currentPage + 1) * this.pageSize + this.pageSize;
        } else {
            // Ohne Filter: Backend-Werte sind korrekt
            this.totalPages = page.page.totalPages;
            this.totalElements = page.page.totalElements;
        }

        this.isLoading = false;
    }

    private handleError(err: any): void {
        console.error('API-Fehler:', err);

        // Prüfe, ob es einfach keine Ergebnisse gibt (404 oder spezifische Message)
        const is404 = err?.status === 404;
        const isNotFound = err?.error?.message?.includes(
            'Keine Buecher gefunden',
        );

        if (is404 || isNotFound) {
            // Keine Ergebnisse = wir sind am Ende der Pagination
            this.items = [];
            this.error = null;
            this.totalPages = Math.max(1, this.currentPage);
            this.totalElements = (this.currentPage - 1) * this.pageSize;

            // Gehe zurück zur letzten gültigen Seite
            if (this.currentPage > 0) {
                this.currentPage--;
                setTimeout(() => this.onSearch(false), 0);
                return;
            }
        } else {
            // Echter Fehler - zeige Fehlermeldung
            const errMsg =
                err?.error?.message ||
                err?.message ||
                String(err) ||
                'Unbekannter Fehler beim Laden der Daten';
            this.error = errMsg;
            this.items = [];
        }
        this.isLoading = false;
    }

    onPageChange(page: number): void {
        // NG Bootstrap verwendet 1-basierte Seiten, wir verwenden 0-basiert
        this.currentPage = page - 1;
        this.onSearch(false);
    }
}

import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuchApiService, BuchItem, BuchPage } from './buch-api.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, NgFor, NgIf, FormsModule],
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
                                value="asc"
                            />
                            ID aufsteigend
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="sortierung"
                                [(ngModel)]="formData.sortierung"
                                value="desc"
                            />
                            ID absteigend
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
                            <th style="text-align: left; padding: 8px;">
                                Titel / ISBN
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
                                {{ b.id }}
                            </td>
                            <td
                                style="padding: 8px; border-bottom: 1px solid #eee;"
                            >
                                {{ b.titel?.titel || b.isbn || '–' }}
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

                <!-- Pagination Controls -->
                <div
                    *ngIf="items && items.length > 0 && totalPages > 1"
                    style="margin-top: 20px; display: flex; align-items: center; justify-content: space-between; padding: 12px; background-color: #f5f5f5; border-radius: 4px;"
                >
                    <button
                        (click)="prevPage()"
                        [disabled]="currentPage === 0"
                        style="padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;"
                        [style.opacity]="currentPage === 0 ? '0.5' : '1'"
                        [style.cursor]="
                            currentPage === 0 ? 'not-allowed' : 'pointer'
                        "
                    >
                        ← Zurück
                    </button>

                    <span style="font-weight: 600; color: #333;">
                        Seite {{ currentPage + 1 }} von {{ totalPages }} ({{
                            totalElements
                        }}
                        Einträge insgesamt)
                    </span>

                    <button
                        (click)="nextPage()"
                        [disabled]="currentPage >= totalPages - 1"
                        style="padding: 8px 16px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;"
                        [style.opacity]="
                            currentPage >= totalPages - 1 ? '0.5' : '1'
                        "
                        [style.cursor]="
                            currentPage >= totalPages - 1
                                ? 'not-allowed'
                                : 'pointer'
                        "
                    >
                        Weiter →
                    </button>
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
    private cachedTotalForFilter?: number; // Gespeicherte echte Gesamtanzahl bei Filtern

    formData = {
        suchtext: '',
        ratingFilter: '',
        sortierung: 'asc',
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
    } {
        const params: any = {
            page: this.currentPage,
            size: this.pageSize,
        };

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
            // Suchparameter über zentrale Funktion bauen
            const params = this.buildSearchParams();
            const hasFilter = !!params.rating || !!params.titel;

            // Bei Filtern und erster Seite: Zähle erstmal alle mit size=100
            if (resetPage && hasFilter) {
                const countParams = { ...params, page: 0, size: 100 };
                this.api.list(countParams).subscribe({
                    next: (countPage: BuchPage) => {
                        const realTotal = countPage.content.length;
                        this.cachedTotalForFilter = realTotal;

                        // Lade jetzt die erste Seite normal
                        this.api.list(params).subscribe({
                            next: (page: BuchPage) => {
                                this.processPageData(page, params, realTotal);
                            },
                            error: (err) => this.handleError(err),
                        });
                    },
                    error: (err) => {
                        // Fallback: Lade ohne Count
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

        // Sortierung nach ID (clientseitig, da Backend keine sort-Parameter hat)
        if (this.formData.sortierung === 'asc') {
            filtered.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
        } else {
            filtered.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
        }

        // Pagination-Metadaten speichern
        this.currentPage = page.page.number;
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

    nextPage(): void {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            this.onSearch(false);
        }
    }

    prevPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.onSearch(false);
        }
    }
}

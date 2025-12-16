import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BuchApiService, BuchItem, BuchPage } from './buch-api.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    template: `
        <div style="max-width: 1000px; margin: 0 auto;">
            <h1>Suche</h1>

            <!-- Suchformular -->
            <div
                style="border: 1px solid var(--app-text, #ccc); padding: 16px; margin-bottom: 20px; border-radius: 4px; background: var(--app-surface); opacity: 0.9;"
            >
                <h2 style="margin-top: 0; color: var(--app-text);">
                    Suchkriterien
                </h2>

                <div style="margin-bottom: 12px;">
                    <label
                        for="suchtext"
                        style="display: block; margin-bottom: 4px; font-weight: 600; color: var(--app-text);"
                    >
                        Suchtext (Titel oder ISBN):
                    </label>
                    <input
                        id="suchtext"
                        type="text"
                        [(ngModel)]="formData.suchtext"
                        placeholder="z.B. TypeScript oder 978-3..."
                        style="width: 100%; padding: 8px; border: 1px solid var(--app-text, #ccc); border-radius: 4px; box-sizing: border-box; background: var(--app-surface); color: var(--app-text);"
                    />
                </div>

                <div style="margin-bottom: 12px;">
                    <label
                        for="ratingFilter"
                        style="display: block; margin-bottom: 4px; font-weight: 600; color: var(--app-text);"
                    >
                        Bewertung (Rating):
                    </label>
                    <select
                        id="ratingFilter"
                        [(ngModel)]="formData.ratingFilter"
                        style="width: 100%; padding: 8px; border: 1px solid var(--app-text, #ccc); border-radius: 4px; box-sizing: border-box; background: var(--app-surface); color: var(--app-text);"
                    >
                        <option value="">– Alle –</option>
                        <option value="1">≥ 1 Stern</option>
                        <option value="3">≥ 3 Sterne</option>
                        <option value="5">≥ 5 Sterne</option>
                    </select>
                </div>

                <div style="margin-bottom: 12px;">
                    <label
                        style="display: block; margin-bottom: 4px; font-weight: 600; color: var(--app-text);"
                        >Sortierung:</label
                    >
                    <div>
                        <label
                            style="margin-right: 20px; color: var(--app-text);"
                        >
                            <input
                                type="radio"
                                name="sortierung"
                                [(ngModel)]="formData.sortierung"
                                value="preisAsc"
                            />
                            Preis aufsteigend
                        </label>
                        <label style="color: var(--app-text);">
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
                    <label style="color: var(--app-text);">
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
            <div
                *ngIf="isLoading"
                style="color: var(--app-text); font-style: italic; opacity: 0.7;"
            >
                Lädt...
            </div>

            <!-- Ergebnisse -->
            <div *ngIf="!isLoading && items !== null">
                <h2 style="color: var(--app-text);">
                    Ergebnisse ({{ totalElements }} Einträge)
                </h2>

                <table
                    *ngIf="items && items.length > 0"
                    style="width: 100%; border-collapse: collapse; margin-top: 12px;"
                >
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 8px;">ID</th>
                            <th style="text-align: left; padding: 8px;">
                                Titel / ISBN
                            </th>
                            <th style="text-align: left; padding: 8px;">
                                Preis
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let b of items; let odd = odd">
                            <td style="padding: 8px;">
                                <a
                                    [routerLink]="['/detail', b.id]"
                                    style="color: #007bff; text-decoration: none; font-weight: 600;"
                                    >{{ b.id }}</a
                                >
                            </td>
                            <td style="padding: 8px;">
                                <a
                                    [routerLink]="['/detail', b.id]"
                                    style="color: #007bff; text-decoration: none;"
                                >
                                    {{ b.titel?.titel || b.isbn || '–' }}
                                </a>
                            </td>
                            <td style="padding: 8px;">
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
                    style="color: var(--app-text); padding: 12px; background-color: var(--app-surface); border-radius: 4px; opacity: 0.8;"
                >
                    Keine Einträge gefunden.
                </div>

                <!-- Simple Pagination -->
                <div
                    *ngIf="items && items.length > 0"
                    style="margin-top: 20px; display: flex; flex-direction: column; align-items: center; gap: 16px;"
                >
                    <div style="display: flex; gap: 12px; align-items: center;">
                        <button
                            (click)="goToPreviousPage()"
                            [disabled]="currentPage <= 0"
                            style="padding:10px 20px; background:#007bff; color:#fff; border:none; border-radius:4px; font-weight:600; font-size:14px;"
                            [style.opacity]="currentPage <= 0 ? '0.4' : '1'"
                            [style.cursor]="
                                currentPage <= 0 ? 'not-allowed' : 'pointer'
                            "
                        >
                            ← Zurück
                        </button>
                        <span
                            style="font-weight: 600; color: var(--app-text); font-size: 16px; min-width: 150px; text-align: center;"
                        >
                            Seite {{ currentPage + 1 }}
                            <span *ngIf="totalPages > 0">
                                / {{ totalPages }}
                            </span>
                        </span>
                        <button
                            (click)="goToNextPage()"
                            [disabled]="!hasMorePages"
                            style="padding:10px 20px; background:#007bff; color:#fff; border:none; border-radius:4px; font-weight:600; font-size:14px;"
                            [style.opacity]="!hasMorePages ? '0.4' : '1'"
                            [style.cursor]="
                                !hasMorePages ? 'not-allowed' : 'pointer'
                            "
                        >
                            Weiter →
                        </button>
                    </div>
                    <span
                        style="font-weight: 400; color: var(--app-text); font-size: 14px; opacity: 0.8;"
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
    hasMorePages = false;
    Math = Math; // Für Template-Zugriff

    formData = {
        suchtext: '',
        ratingFilter: '',
        sortierung: 'preisAsc',
        nurMitRating: false,
    };

    constructor(
        private readonly api: BuchApiService,
        private readonly cdr: ChangeDetectorRef,
    ) {}

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
        }

        this.isLoading = true;
        this.error = null;
        this.items = null;

        const params = this.buildSearchParams();
        console.log('Search params:', params);
        this.api.list(params).subscribe({
            next: (page: BuchPage) => {
                console.log('Received page data:', page);
                this.processPageData(page);
            },
            error: (err) => {
                console.error('Search error:', err);
                this.handleError(err);
            },
        });
    }

    private processPageData(page: BuchPage): void {
        let filtered = page.content;

        // Clientseitige Filter (nur für Optionen, die Backend nicht unterstützt)
        if (this.formData.nurMitRating) {
            filtered = filtered.filter(
                (b) => b.rating !== undefined && b.rating !== null,
            );
        }

        // Verwende Backend-Metadaten direkt
        this.currentPage = page.page.number;
        this.totalPages = page.page.totalPages;
        this.totalElements = page.page.totalElements;
        this.items = filtered;

        // Prüfe ob weitere Seiten verfügbar sind
        this.hasMorePages = this.currentPage < this.totalPages - 1;

        this.isLoading = false;
        this.cdr.detectChanges();

        console.log(
            'UI updated, items:',
            this.items?.length,
            'isLoading:',
            this.isLoading,
        );
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
        this.cdr.detectChanges();
    }

    goToPreviousPage(): void {
        if (this.currentPage > 0) {
            this.currentPage--;
            this.onSearch(false);
        }
    }

    goToNextPage(): void {
        if (this.hasMorePages) {
            this.currentPage++;
            this.onSearch(false);
        }
    }
}

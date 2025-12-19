import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
    BuchApiService,
    BuchItem,
    BuchPage,
} from '../../../core/services/buch-api.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: '../../../templates/search.component.html',
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

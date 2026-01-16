import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    DestroyRef,
    OnInit,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
    BuchApiService,
    BuchArt,
    BuchItem,
    BuchPage,
} from '../services/buch-api';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: '../templates/search.html',
    styleUrls: ['../templates/search.css'],
})
export class SearchComponent implements OnInit {
    // Dependency Injection via inject() (Angular v21 Style Guide Empfehlung)
    private readonly api = inject(BuchApiService);
    private readonly cdr = inject(ChangeDetectorRef);
    // Angular v21: DestroyRef für automatisches Subscription-Cleanup
    private readonly destroyRef = inject(DestroyRef);

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
        isbn: '',
        art: '' as '' | BuchArt,
        ratingFilter: '',
        nurLieferbar: false,
        sortierung: '' as '' | 'preisAsc' | 'preisDesc',
    };

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
        isbn?: string;
        art?: BuchArt;
        rating?: number;
        lieferbar?: boolean;
        sortierung?: 'preisAsc' | 'preisDesc';
    } {
        const params: any = {
            page: this.currentPage,
            size: this.pageSize,
        };

        // Titel-Suche
        const suchtext = (this.formData.suchtext || '').trim();
        if (suchtext.length > 0) {
            params.titel = suchtext;
        }

        // ISBN-Suche
        const isbn = (this.formData.isbn || '').trim();
        if (isbn.length > 0) {
            params.isbn = isbn;
        }

        // Art-Filter
        if (this.formData.art) {
            params.art = this.formData.art;
        }

        // Rating-Filter
        if (this.formData.ratingFilter) {
            params.rating = Number.parseInt(this.formData.ratingFilter, 10);
        }

        // Lieferbar-Filter
        if (this.formData.nurLieferbar) {
            params.lieferbar = true;
        }

        // Sortierung
        if (this.formData.sortierung) {
            params.sortierung = this.formData.sortierung;
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
        // Angular v21: takeUntilDestroyed() für automatisches Unsubscribe bei Component-Zerstörung
        this.api
            .list(params)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
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
        // Verwende Backend-Metadaten direkt
        this.currentPage = page.page.number;
        this.totalPages = page.page.totalPages;
        this.totalElements = page.page.totalElements;
        this.items = page.content;

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

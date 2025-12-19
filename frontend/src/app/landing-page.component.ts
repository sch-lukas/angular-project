import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BookCarouselComponent } from './book-carousel.component';
import {
    BuchApiService,
    type BuchItem,
    type BuchStats,
} from './buch-api.service';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule, BookCarouselComponent],
    templateUrl: './templates/landing-page.component.html',
    styleUrls: ['./templates/landing-page.component.css'],
})
export class LandingPageComponent implements OnInit {
    stats: BuchStats | null = null;

    // Animierte Werte
    animatedTotalCount = 0;
    animatedBestRating = 0;
    animatedCheapestPrice = 0;

    // Buchlisten für Carousels
    booksNew: BuchItem[] = [];
    booksPopular: BuchItem[] = [];
    booksRecommended: BuchItem[] = [];

    constructor(
        private readonly api: BuchApiService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.loadStats();
        this.loadCarouselBooks();
    }

    private loadStats(): void {
        this.api.getStats().subscribe({
            next: (data) => {
                this.stats = data;
                this.cdr.detectChanges();
                this.animateCounters();
            },
            error: (err) => {
                console.error('Fehler beim Laden der Statistiken:', err);
            },
        });
    }

    private animateCounters(): void {
        if (!this.stats) return;

        const duration = 1500; // 1.5 Sekunden
        const steps = 60; // 60 FPS
        const interval = duration / steps;

        // Total Count Animation
        const totalCountStep = this.stats.totalCount / steps;
        let currentTotalCount = 0;

        const totalCountTimer = setInterval(() => {
            currentTotalCount += totalCountStep;
            if (currentTotalCount >= this.stats!.totalCount) {
                this.animatedTotalCount = this.stats!.totalCount;
                clearInterval(totalCountTimer);
            } else {
                this.animatedTotalCount = Math.floor(currentTotalCount);
            }
            this.cdr.detectChanges();
        }, interval);

        // Best Rating Animation
        if (this.stats.bestBook) {
            const ratingStep = this.stats.bestBook.rating / steps;
            let currentRating = 0;

            const ratingTimer = setInterval(() => {
                currentRating += ratingStep;
                if (currentRating >= this.stats!.bestBook!.rating) {
                    this.animatedBestRating = this.stats!.bestBook!.rating;
                    clearInterval(ratingTimer);
                } else {
                    this.animatedBestRating = Number.parseFloat(
                        currentRating.toFixed(1),
                    );
                }
                this.cdr.detectChanges();
            }, interval);
        }

        // Cheapest Price Animation
        if (this.stats.cheapestBook) {
            const priceStep = this.stats.cheapestBook.preis / steps;
            let currentPrice = 0;

            const priceTimer = setInterval(() => {
                currentPrice += priceStep;
                if (currentPrice >= this.stats!.cheapestBook!.preis) {
                    this.animatedCheapestPrice =
                        this.stats!.cheapestBook!.preis;
                    clearInterval(priceTimer);
                } else {
                    this.animatedCheapestPrice = Number.parseFloat(
                        currentPrice.toFixed(2),
                    );
                }
                this.cdr.detectChanges();
            }, interval);
        }
    }

    goToSearch(): void {
        this.router.navigate(['/search']);
    }

    goToBook(id: number | undefined): void {
        if (id) {
            this.router.navigate(['/detail', id]);
        }
    }

    /**
     * Lädt Bücher für die drei Carousels
     */
    private loadCarouselBooks(): void {
        // Neu im Programm: Sortiere nach Datum (neueste zuerst)
        this.api.list({ size: 10, sortierung: 'preisDesc' }).subscribe({
            next: (result) => {
                // Simuliere "neu" durch die ersten 10 Bücher
                this.booksNew = result.content.slice(0, 10);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Fehler beim Laden neuer Bücher:', err);
            },
        });

        // Beliebte Bücher: Sortiere nach Rating (höchste zuerst)
        this.api.list({ size: 20 }).subscribe({
            next: (result) => {
                // Filter: Rating >= 4
                this.booksPopular = result.content
                    .filter((book) => (book.rating ?? 0) >= 4)
                    .slice(0, 10);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Fehler beim Laden beliebter Bücher:', err);
            },
        });

        // Schwabenpreis: Günstigste Bücher (nach Preis aufsteigend sortiert)
        this.api.list({ size: 15, sortierung: 'preisAsc' }).subscribe({
            next: (result) => {
                // Filter: Nur lieferbare Bücher, sortiert nach Preis
                this.booksRecommended = result.content
                    .filter(
                        (book) =>
                            book.lieferbar && book.preis && book.preis > 0,
                    )
                    .sort((a, b) => (a.preis || 0) - (b.preis || 0))
                    .slice(0, 10);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error(
                    'Fehler beim Laden der Schwabenpreis-Bücher:',
                    err,
                );
            },
        });
    }
}

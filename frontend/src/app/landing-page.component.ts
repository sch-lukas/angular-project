import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
    template: `
        <div class="landing-page">
            <div class="logo-container">
                <img
                    src="assets/logo-buch-spa.svg"
                    alt="Buchhandlung Logo"
                    class="logo"
                />
            </div>

            <div class="stats-container">
                <div class="stat-card">
                    <div class="stat-icon">📚</div>
                    <div class="stat-value">{{ animatedTotalCount }}</div>
                    <div class="stat-label">Bücher im Katalog</div>
                </div>

                <div
                    class="stat-card clickable"
                    *ngIf="stats?.bestBook"
                    (click)="goToBook(stats?.bestBook?.id)"
                >
                    <div class="stat-icon">⭐</div>
                    <div class="stat-value">{{ animatedBestRating }}/5</div>
                    <div class="stat-label">Bestbewertetes Buch</div>
                    <div class="stat-subtitle">
                        {{ stats?.bestBook?.titel }}
                    </div>
                </div>

                <div
                    class="stat-card clickable"
                    *ngIf="stats?.cheapestBook"
                    (click)="goToBook(stats?.cheapestBook?.id)"
                >
                    <div class="stat-icon">🏆</div>
                    <div class="stat-value">
                        {{ animatedCheapestPrice | number: '1.2-2' }} €
                    </div>
                    <div class="stat-label">Schwabenpreis</div>
                    <div class="stat-subtitle">
                        {{ stats?.cheapestBook?.titel }}
                    </div>
                </div>
            </div>

            <div class="action-container">
                <button class="btn-primary" (click)="goToSearch()">
                    Zur Buchsuche
                </button>
            </div>

            <!-- Buch-Carousels -->
            <section class="carousel-section">
                <!-- Neu im Programm -->
                <div class="carousel-block">
                    <h2 class="carousel-title">📚 Neu im Programm</h2>
                    <app-book-carousel [books]="booksNew"></app-book-carousel>
                </div>

                <!-- Beliebte Bücher -->
                <div class="carousel-block">
                    <h2 class="carousel-title">⭐ Beliebte Bücher</h2>
                    <app-book-carousel
                        [books]="booksPopular"
                    ></app-book-carousel>
                </div>

                <!-- Schwabenpreis -->
                <div class="carousel-block">
                    <h2 class="carousel-title">🏆 Schwabenpreis</h2>
                    <p class="carousel-subtitle">Die günstigsten Bücher</p>
                    <app-book-carousel
                        [books]="booksRecommended"
                    ></app-book-carousel>
                </div>
            </section>
        </div>
    `,
    styles: [
        `
            .landing-page {
                max-width: 1200px;
                margin: 0 auto;
                padding: 2rem;
                text-align: center;
            }

            .logo-container {
                margin-bottom: 3rem;
            }

            .logo {
                max-width: 300px;
                height: auto;
                filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1));
            }

            .stats-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                gap: 2rem;
                margin-bottom: 3rem;
            }

            .stat-card {
                background: white;
                border-radius: 12px;
                padding: 2rem;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                transition:
                    transform 0.3s ease,
                    box-shadow 0.3s ease;
            }

            :host-context(.theme-dark) .stat-card {
                background: #374151;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .stat-card.clickable {
                cursor: pointer;
            }

            .stat-card.clickable:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            :host-context(.theme-dark) .stat-card.clickable:hover {
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            }

            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            :host-context(.theme-dark) .stat-card:hover {
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            }

            .stat-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .stat-value {
                font-size: 2.5rem;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 0.5rem;
            }

            :host-context(.theme-dark) .stat-value {
                color: #f3f4f6;
            }

            .stat-label {
                font-size: 1.1rem;
                color: #7f8c8d;
                margin-bottom: 0.5rem;
            }

            :host-context(.theme-dark) .stat-label {
                color: #d1d5db;
            }

            .stat-subtitle {
                font-size: 0.9rem;
                color: #95a5a6;
                font-style: italic;
                margin-top: 0.5rem;
            }

            :host-context(.theme-dark) .stat-subtitle {
                color: #9ca3af;
            }

            .action-container {
                margin-top: 3rem;
            }

            .btn-primary {
                background: #3498db;
                color: white;
                border: none;
                padding: 1rem 2rem;
                font-size: 1.1rem;
                border-radius: 8px;
                cursor: pointer;
                transition: background 0.3s ease;
                box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
            }

            .btn-primary:hover {
                background: #2980b9;
                box-shadow: 0 6px 12px rgba(52, 152, 219, 0.4);
            }

            /* Carousel Section */
            .carousel-section {
                margin-top: 5rem;
                padding: 0 1rem;
            }

            .carousel-block {
                margin-bottom: 4rem;
            }

            .carousel-title {
                font-size: 2rem;
                font-weight: bold;
                color: #2c3e50;
                text-align: center;
                margin-bottom: 2rem;
                position: relative;
                padding-bottom: 0.75rem;
            }

            :host-context(.theme-dark) .carousel-title {
                color: #f3f4f6;
            }

            .carousel-title::after {
                content: '';
                position: absolute;
                bottom: 0;
                left: 50%;
                transform: translateX(-50%);
                width: 80px;
                height: 4px;
                background: linear-gradient(90deg, #3498db, #2ecc71);
                border-radius: 2px;
            }

            .carousel-subtitle {
                font-size: 1.1rem;
                color: #7f8c8d;
                text-align: center;
                margin-top: -1rem;
                margin-bottom: 1.5rem;
            }

            :host-context(.theme-dark) .carousel-subtitle {
                color: #d1d5db;
            }

            @media (max-width: 768px) {
                .stats-container {
                    grid-template-columns: 1fr;
                }

                .logo {
                    max-width: 200px;
                }

                .stat-value {
                    font-size: 2rem;
                }

                .carousel-title {
                    font-size: 1.5rem;
                }

                .carousel-section {
                    padding: 0;
                }
            }
        `,
    ],
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
    ) {}

    ngOnInit(): void {
        this.loadStats();
        this.loadCarouselBooks();
    }

    private loadStats(): void {
        this.api.getStats().subscribe({
            next: (data) => {
                this.stats = data;
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

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BuchApiService, type BuchStats } from './buch-api.service';

@Component({
    selector: 'app-landing-page',
    standalone: true,
    imports: [CommonModule],
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

            .stat-card.clickable {
                cursor: pointer;
            }

            .stat-card.clickable:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
            }

            .stat-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
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

            .stat-label {
                font-size: 1.1rem;
                color: #7f8c8d;
                margin-bottom: 0.5rem;
            }

            .stat-subtitle {
                font-size: 0.9rem;
                color: #95a5a6;
                font-style: italic;
                margin-top: 0.5rem;
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

    constructor(
        private readonly api: BuchApiService,
        private readonly router: Router,
    ) {}

    ngOnInit(): void {
        this.loadStats();
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
}

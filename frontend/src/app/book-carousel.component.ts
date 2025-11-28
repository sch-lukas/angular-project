import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { BuchItem } from './buch-api.service';

@Component({
    selector: 'app-book-carousel',
    standalone: true,
    imports: [CommonModule, RouterLink],
    template: `
        <div class="carousel-wrapper" *ngIf="books && books.length > 0">
            <!-- Linker Pfeil -->
            <button
                class="carousel-arrow carousel-arrow-left"
                (click)="scrollCarousel('left')"
                *ngIf="books.length > 5"
                aria-label="Vorherige Bücher"
            >
                ‹
            </button>

            <!-- Scroll Container -->
            <div class="carousel-scroll-container" #carouselContainer>
                <div class="carousel-items">
                    <div *ngFor="let buch of books" class="carousel-item-card">
                        <a
                            [routerLink]="['/detail', buch.id]"
                            class="item-link"
                        >
                            <!-- Cover -->
                            <div class="item-image">
                                <img
                                    [src]="getCoverUrl(buch)"
                                    [alt]="buch.titel?.titel || 'Buch Cover'"
                                    onerror="this.src='https://via.placeholder.com/180x260?text=Kein+Cover'"
                                />
                            </div>

                            <!-- Titel -->
                            <h6 class="item-title">
                                {{ buch.titel?.titel || '–' }}
                            </h6>

                            <!-- Rating -->
                            <div class="item-rating" *ngIf="buch.rating">
                                <span class="rating-stars">
                                    <span
                                        *ngFor="let star of [1, 2, 3, 4, 5]"
                                        [class.filled]="star <= buch.rating"
                                        >★</span
                                    >
                                </span>
                                <span class="rating-value">{{
                                    buch.rating
                                }}</span>
                            </div>

                            <!-- Preis -->
                            <div class="item-price">
                                <span class="price-amount">
                                    {{
                                        buch.preis != null
                                            ? (buch.preis | number: '1.2-2') +
                                              ' €'
                                            : '–'
                                    }}
                                </span>
                                <span
                                    *ngIf="buch.rabatt && buch.rabatt > 0"
                                    class="price-discount"
                                >
                                    -{{ buch.rabatt * 100 | number: '1.0-0' }}%
                                </span>
                            </div>

                            <!-- Lieferbar -->
                            <div class="item-delivery" *ngIf="buch.lieferbar">
                                <span class="badge bg-success"
                                    >✓ Lieferbar</span
                                >
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Rechter Pfeil -->
            <button
                class="carousel-arrow carousel-arrow-right"
                (click)="scrollCarousel('right')"
                *ngIf="books.length > 5"
                aria-label="Nächste Bücher"
            >
                ›
            </button>
        </div>

        <!-- Leerer Zustand -->
        <div *ngIf="!books || books.length === 0" class="empty-state">
            <p class="text-muted">Keine Bücher verfügbar</p>
        </div>
    `,
    styles: [
        `
            .carousel-wrapper {
                position: relative;
                padding: 1rem 0;
                margin: 0 auto;
                max-width: 1400px;
            }

            .carousel-scroll-container {
                overflow-x: auto;
                overflow-y: hidden;
                scroll-behavior: smooth;
                -webkit-overflow-scrolling: touch;
                scrollbar-width: thin;
                scrollbar-color: #cbd5e0 #edf2f7;
                padding: 0.5rem 0;
            }

            .carousel-scroll-container::-webkit-scrollbar {
                height: 8px;
            }

            .carousel-scroll-container::-webkit-scrollbar-track {
                background: #edf2f7;
                border-radius: 4px;
            }

            .carousel-scroll-container::-webkit-scrollbar-thumb {
                background: #cbd5e0;
                border-radius: 4px;
            }

            .carousel-scroll-container::-webkit-scrollbar-thumb:hover {
                background: #a0aec0;
            }

            .carousel-items {
                display: flex;
                gap: 1rem;
                padding: 0.5rem;
            }

            .carousel-item-card {
                flex: 0 0 200px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .carousel-item-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
            }

            .item-link {
                display: block;
                text-decoration: none;
                color: inherit;
                padding: 1rem;
            }

            .item-image {
                width: 100%;
                height: 260px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f7f7f7;
                border-radius: 4px;
                margin-bottom: 0.75rem;
                overflow: hidden;
            }

            .item-image img {
                max-width: 100%;
                max-height: 100%;
                object-fit: cover;
            }

            .item-title {
                font-size: 0.9rem;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 0.5rem;
                height: 2.6rem;
                overflow: hidden;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                line-height: 1.3;
            }

            .item-rating {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                margin-bottom: 0.5rem;
            }

            .rating-stars {
                color: #e2e8f0;
                font-size: 0.85rem;
                letter-spacing: 1px;
            }

            .rating-stars .filled {
                color: #f59e0b;
            }

            .rating-value {
                font-size: 0.75rem;
                color: #718096;
                margin-left: 0.25rem;
            }

            .item-price {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                margin-bottom: 0.5rem;
            }

            .price-amount {
                font-size: 1.1rem;
                font-weight: bold;
                color: #2d3748;
            }

            .price-discount {
                font-size: 0.75rem;
                color: #e53e3e;
                background: #fed7d7;
                padding: 0.125rem 0.375rem;
                border-radius: 4px;
                font-weight: 600;
            }

            .item-delivery {
                margin-top: 0.5rem;
            }

            .badge {
                font-size: 0.7rem;
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
            }

            .bg-success {
                background-color: #48bb78 !important;
                color: white;
            }

            .carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 50%;
                width: 48px;
                height: 48px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 2rem;
                cursor: pointer;
                z-index: 10;
                transition: all 0.2s ease;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                color: #2d3748;
            }

            .carousel-arrow:hover {
                background: #f7fafc;
                border-color: #cbd5e0;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }

            .carousel-arrow:active {
                transform: translateY(-50%) scale(0.95);
            }

            .carousel-arrow-left {
                left: -24px;
            }

            .carousel-arrow-right {
                right: -24px;
            }

            .empty-state {
                text-align: center;
                padding: 3rem 1rem;
                background: #f7fafc;
                border-radius: 8px;
                margin: 1rem 0;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .carousel-arrow {
                    display: none;
                }

                .carousel-item-card {
                    flex: 0 0 160px;
                }

                .item-image {
                    height: 220px;
                }
            }
        `,
    ],
})
export class BookCarouselComponent {
    @Input() books: BuchItem[] = [];

    @ViewChild('carouselContainer')
    carouselContainer!: ElementRef<HTMLDivElement>;

    /**
     * Gibt die Cover-URL für ein Buch zurück
     */
    getCoverUrl(buch: BuchItem): string {
        // 1. Priorität: Wenn coverUrl bereits gesetzt ist
        if (buch.coverUrl) {
            return buch.coverUrl;
        }

        // 2. Priorität: Generiere aus ID
        if (buch.id) {
            return `/assets/covers/${buch.id}.svg`;
        }

        // 3. Fallback: Platzhalter
        return `https://via.placeholder.com/180x260?text=Kein+Cover`;
    }

    /**
     * Scrollt das Karussell nach links oder rechts
     */
    scrollCarousel(direction: 'left' | 'right'): void {
        if (!this.carouselContainer) return;

        const container = this.carouselContainer.nativeElement;
        const scrollAmount = 220 * 2; // 2 Items pro Klick (Item width + gap)

        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }
}

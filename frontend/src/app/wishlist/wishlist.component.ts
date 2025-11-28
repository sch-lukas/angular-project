import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import type { WishlistItem } from './wishlist.service';
import { WishlistService } from './wishlist.service';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink, NgbAlert],
    template: `
        <div class="container py-4" style="max-width: 1200px;">
            <!-- Header -->
            <div class="mb-4">
                <h1 class="display-5 fw-bold mb-3">❤️ Merkliste</h1>
                <a
                    routerLink="/search"
                    class="btn btn-outline-secondary"
                    style="display: inline-flex; align-items: center; gap: 8px;"
                >
                    <span>←</span> Zur Suche
                </a>
            </div>

            <!-- Success Alert -->
            <ngb-alert
                *ngIf="successMessage"
                type="success"
                [dismissible]="true"
                (closed)="successMessage = null"
                class="mb-4"
            >
                {{ successMessage }}
            </ngb-alert>

            <!-- Leere Merkliste -->
            <div
                *ngIf="(wishlistItems$ | async)?.length === 0"
                class="text-center py-5"
            >
                <div class="mb-4">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="80"
                        height="80"
                        fill="currentColor"
                        class="text-muted"
                        viewBox="0 0 16 16"
                    >
                        <path
                            fill-rule="evenodd"
                            d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                        />
                    </svg>
                </div>
                <h3 class="text-muted mb-3">Ihre Merkliste ist leer</h3>
                <p class="text-muted mb-4">
                    Entdecken Sie Bücher und fügen Sie Ihre Favoriten hinzu!
                </p>
                <a routerLink="/search" class="btn btn-primary">
                    Zur Buchsuche
                </a>
            </div>

            <!-- Merkliste-Inhalt -->
            <div *ngIf="(wishlistItems$ | async)?.length ?? 0 > 0">
                <!-- Desktop Grid -->
                <div class="row g-4">
                    <div
                        *ngFor="let item of wishlistItems$ | async"
                        class="col-12 col-md-6 col-lg-4"
                    >
                        <div class="card h-100 shadow-sm wishlist-card">
                            <div class="card-body d-flex flex-column">
                                <!-- Cover -->
                                <div class="text-center mb-3">
                                    <a
                                        [routerLink]="['/detail', item.id]"
                                        class="text-decoration-none"
                                    >
                                        <img
                                            *ngIf="item.coverUrl"
                                            [src]="item.coverUrl"
                                            [alt]="item.title"
                                            class="img-fluid rounded"
                                            style="max-height: 250px; width: auto; object-fit: cover;"
                                        />
                                        <div
                                            *ngIf="!item.coverUrl"
                                            class="bg-light d-flex align-items-center justify-content-center rounded"
                                            style="height: 250px;"
                                        >
                                            <span class="text-muted fs-1"
                                                >📚</span
                                            >
                                        </div>
                                    </a>
                                </div>

                                <!-- Titel -->
                                <h5 class="card-title mb-2">
                                    <a
                                        [routerLink]="['/detail', item.id]"
                                        class="text-decoration-none text-dark"
                                    >
                                        {{ item.title }}
                                    </a>
                                </h5>

                                <!-- ISBN -->
                                <p
                                    class="text-muted small mb-2"
                                    *ngIf="item.isbn"
                                >
                                    ISBN: {{ item.isbn }}
                                </p>

                                <!-- Art -->
                                <p
                                    class="text-muted small mb-2"
                                    *ngIf="item.art"
                                >
                                    {{ getArtLabel(item.art) }}
                                </p>

                                <!-- Rating -->
                                <div *ngIf="item.rating" class="mb-2">
                                    <span
                                        *ngFor="
                                            let star of getStars(item.rating)
                                        "
                                        class="text-warning"
                                    >
                                        ⭐
                                    </span>
                                    <span class="text-muted small ms-1">
                                        ({{ item.rating }}/5)
                                    </span>
                                </div>

                                <!-- Preis -->
                                <p class="fw-bold text-success mb-3 fs-5">
                                    {{ item.price | number: '1.2-2' }} €
                                </p>

                                <!-- Spacer -->
                                <div class="mt-auto">
                                    <div class="d-grid gap-2">
                                        <!-- Zum Detail -->
                                        <a
                                            [routerLink]="['/detail', item.id]"
                                            class="btn btn-primary btn-sm"
                                        >
                                            Details ansehen
                                        </a>
                                        <!-- Entfernen -->
                                        <button
                                            type="button"
                                            class="btn btn-outline-danger btn-sm"
                                            (click)="removeItem(item)"
                                        >
                                            ❌ Entfernen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Aktionen -->
                <div class="row mt-4">
                    <div class="col-12">
                        <div class="d-flex gap-2 justify-content-between">
                            <button
                                type="button"
                                class="btn btn-outline-danger"
                                (click)="confirmClearWishlist()"
                            >
                                🗑️ Merkliste leeren
                            </button>
                            <div class="text-muted">
                                <strong>{{ getTotalItems() }}</strong> Artikel
                                gemerkt
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .wishlist-card {
                transition: all 0.3s ease;
                border: 1px solid #e0e0e0;
            }

            .wishlist-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
            }

            .card-title a:hover {
                color: #0d6efd !important;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .wishlist-card {
                animation: fadeIn 0.3s ease-out;
            }
        `,
    ],
})
export class WishlistComponent implements OnInit {
    wishlistItems$!: Observable<WishlistItem[]>;
    successMessage: string | null = null;

    constructor(private readonly wishlistService: WishlistService) {}

    ngOnInit(): void {
        this.wishlistItems$ = this.wishlistService.items$;
    }

    /**
     * Entfernt ein Buch aus der Merkliste
     */
    removeItem(item: WishlistItem): void {
        this.wishlistService.removeItem(item.id);
        this.showSuccess(`"${item.title}" wurde aus der Merkliste entfernt`);
    }

    /**
     * Leert die komplette Merkliste mit Bestätigung
     */
    confirmClearWishlist(): void {
        if (confirm('Möchten Sie die Merkliste wirklich leeren?')) {
            this.wishlistService.clear();
            this.showSuccess('Merkliste wurde geleert');
        }
    }

    /**
     * Gibt die Gesamtanzahl der gemerkten Artikel zurück
     */
    getTotalItems(): number {
        let total = 0;
        this.wishlistItems$.subscribe((items) => {
            total = items.length;
        });
        return total;
    }

    /**
     * Konvertiert Art-Enum zu lesbarem Label
     */
    getArtLabel(art: 'EPUB' | 'HARDCOVER' | 'PAPERBACK'): string {
        const labels: Record<string, string> = {
            EPUB: 'E-Book',
            HARDCOVER: 'Hardcover',
            PAPERBACK: 'Taschenbuch',
        };
        return labels[art] || art;
    }

    /**
     * Erzeugt ein Array für Sterne-Anzeige
     */
    getStars(rating: number): number[] {
        return new Array(rating).fill(0);
    }

    /**
     * Zeigt eine Erfolgs-Nachricht für 3 Sekunden
     */
    private showSuccess(message: string): void {
        this.successMessage = message;
        setTimeout(() => {
            this.successMessage = null;
        }, 3000);
    }
}

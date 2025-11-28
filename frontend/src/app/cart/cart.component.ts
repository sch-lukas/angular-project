import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import type { CartItem } from './cart.service';
import { CartService } from './cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, NgbAlert],
    template: `
        <div class="container py-4" style="max-width: 1200px;">
            <!-- Header -->
            <div class="mb-4">
                <h1 class="display-5 fw-bold mb-3">🛒 Warenkorb</h1>
                <a
                    routerLink="/search"
                    class="btn btn-outline-secondary"
                    style="display: inline-flex; align-items: center; gap: 8px;"
                >
                    <span>←</span> Weiter einkaufen
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

            <!-- Leerer Warenkorb -->
            <div
                *ngIf="(cartItems$ | async)?.length === 0"
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
                            d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
                        />
                    </svg>
                </div>
                <h3 class="text-muted mb-3">Ihr Warenkorb ist leer</h3>
                <p class="text-muted mb-4">
                    Stöbern Sie in unserer Buchauswahl und fügen Sie Artikel
                    hinzu!
                </p>
                <a routerLink="/search" class="btn btn-primary">
                    Zur Buchsuche
                </a>
            </div>

            <!-- Warenkorb-Inhalt -->
            <div *ngIf="(cartItems$ | async)?.length ?? 0 > 0">
                <!-- Desktop Tabelle -->
                <div class="d-none d-lg-block">
                    <div class="card shadow-sm">
                        <div class="table-responsive">
                            <table class="table table-hover mb-0">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 80px;">Cover</th>
                                        <th>Artikel</th>
                                        <th style="width: 120px;">
                                            Einzelpreis
                                        </th>
                                        <th style="width: 150px;">Menge</th>
                                        <th style="width: 120px;">
                                            Gesamtpreis
                                        </th>
                                        <th style="width: 100px;"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr *ngFor="let item of cartItems$ | async">
                                        <td>
                                            <img
                                                *ngIf="item.coverUrl"
                                                [src]="item.coverUrl"
                                                [alt]="item.title"
                                                class="img-thumbnail"
                                                style="width: 60px; height: auto; object-fit: cover;"
                                            />
                                            <div
                                                *ngIf="!item.coverUrl"
                                                class="bg-light d-flex align-items-center justify-content-center"
                                                style="width: 60px; height: 80px; border-radius: 4px;"
                                            >
                                                <span class="text-muted"
                                                    >📚</span
                                                >
                                            </div>
                                        </td>
                                        <td class="align-middle">
                                            <div class="fw-semibold">
                                                {{ item.title }}
                                            </div>
                                            <div
                                                class="text-muted small"
                                                *ngIf="item.isbn"
                                            >
                                                ISBN: {{ item.isbn }}
                                            </div>
                                            <div
                                                class="text-muted small"
                                                *ngIf="item.art"
                                            >
                                                {{ getArtLabel(item.art) }}
                                            </div>
                                        </td>
                                        <td class="align-middle">
                                            {{ item.price | number: '1.2-2' }} €
                                        </td>
                                        <td class="align-middle">
                                            <div
                                                class="input-group"
                                                style="width: 130px;"
                                            >
                                                <button
                                                    type="button"
                                                    class="btn btn-outline-secondary btn-sm"
                                                    (click)="
                                                        decreaseQuantity(item)
                                                    "
                                                    [disabled]="
                                                        item.quantity <= 1
                                                    "
                                                >
                                                    −
                                                </button>
                                                <input
                                                    type="number"
                                                    class="form-control form-control-sm text-center"
                                                    [(ngModel)]="item.quantity"
                                                    (change)="
                                                        updateItemQuantity(item)
                                                    "
                                                    min="1"
                                                    max="99"
                                                />
                                                <button
                                                    type="button"
                                                    class="btn btn-outline-secondary btn-sm"
                                                    (click)="
                                                        increaseQuantity(item)
                                                    "
                                                    [disabled]="
                                                        item.quantity >= 99
                                                    "
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </td>
                                        <td class="align-middle fw-semibold">
                                            {{
                                                item.price * item.quantity
                                                    | number: '1.2-2'
                                            }}
                                            €
                                        </td>
                                        <td class="align-middle text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                (click)="removeItem(item)"
                                                title="Entfernen"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <!-- Mobile Cards -->
                <div class="d-lg-none">
                    <div
                        *ngFor="let item of cartItems$ | async"
                        class="card mb-3 shadow-sm"
                    >
                        <div class="card-body">
                            <div class="row g-3">
                                <div class="col-4">
                                    <img
                                        *ngIf="item.coverUrl"
                                        [src]="item.coverUrl"
                                        [alt]="item.title"
                                        class="img-fluid rounded"
                                        style="width: 100%; height: auto; object-fit: cover;"
                                    />
                                    <div
                                        *ngIf="!item.coverUrl"
                                        class="bg-light d-flex align-items-center justify-content-center rounded"
                                        style="width: 100%; height: 150px;"
                                    >
                                        <span class="text-muted fs-2">📚</span>
                                    </div>
                                </div>
                                <div class="col-8">
                                    <h6 class="card-title mb-2">
                                        {{ item.title }}
                                    </h6>
                                    <p
                                        class="text-muted small mb-2"
                                        *ngIf="item.isbn"
                                    >
                                        ISBN: {{ item.isbn }}
                                    </p>
                                    <p
                                        class="text-muted small mb-2"
                                        *ngIf="item.art"
                                    >
                                        {{ getArtLabel(item.art) }}
                                    </p>
                                    <p class="mb-2">
                                        <strong
                                            >{{
                                                item.price | number: '1.2-2'
                                            }}
                                            €</strong
                                        >
                                        pro Stück
                                    </p>
                                    <div
                                        class="input-group mb-2"
                                        style="max-width: 130px;"
                                    >
                                        <button
                                            type="button"
                                            class="btn btn-outline-secondary btn-sm"
                                            (click)="decreaseQuantity(item)"
                                            [disabled]="item.quantity <= 1"
                                        >
                                            −
                                        </button>
                                        <input
                                            type="number"
                                            class="form-control form-control-sm text-center"
                                            [(ngModel)]="item.quantity"
                                            (change)="updateItemQuantity(item)"
                                            min="1"
                                            max="99"
                                        />
                                        <button
                                            type="button"
                                            class="btn btn-outline-secondary btn-sm"
                                            (click)="increaseQuantity(item)"
                                            [disabled]="item.quantity >= 99"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <p class="fw-bold mb-2">
                                        Gesamt:
                                        {{
                                            item.price * item.quantity
                                                | number: '1.2-2'
                                        }}
                                        €
                                    </p>
                                    <button
                                        type="button"
                                        class="btn btn-outline-danger btn-sm"
                                        (click)="removeItem(item)"
                                    >
                                        🗑️ Entfernen
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Zusammenfassung & Aktionen -->
                <div class="row mt-4 g-3">
                    <div class="col-lg-8">
                        <button
                            type="button"
                            class="btn btn-outline-danger"
                            (click)="confirmClearCart()"
                        >
                            🗑️ Warenkorb leeren
                        </button>
                    </div>
                    <div class="col-lg-4">
                        <div class="card shadow">
                            <div class="card-body">
                                <h5 class="card-title mb-3">Zusammenfassung</h5>
                                <div
                                    class="d-flex justify-content-between mb-2"
                                >
                                    <span>Artikel:</span>
                                    <span>{{ getTotalItems() }}</span>
                                </div>
                                <div
                                    class="d-flex justify-content-between mb-3"
                                >
                                    <span class="fw-bold">Gesamtsumme:</span>
                                    <span class="fw-bold fs-5 text-primary">
                                        {{ getTotal() | number: '1.2-2' }} €
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    class="btn btn-primary w-100 mb-2"
                                    disabled
                                    title="Zur Kasse (noch nicht implementiert)"
                                >
                                    Zur Kasse
                                </button>
                                <p class="text-muted small mb-0 text-center">
                                    * Checkout-Funktion folgt
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .img-thumbnail {
                border: 1px solid #dee2e6;
            }

            input[type='number']::-webkit-inner-spin-button,
            input[type='number']::-webkit-outer-spin-button {
                opacity: 1;
            }

            .table > :not(caption) > * > * {
                padding: 1rem 0.75rem;
            }

            .input-group .form-control {
                border-left: none;
                border-right: none;
            }

            .card {
                transition: box-shadow 0.2s ease;
            }

            @media (max-width: 991px) {
                .card {
                    border-radius: 0.5rem;
                }
            }
        `,
    ],
})
export class CartComponent implements OnInit {
    cartItems$!: Observable<CartItem[]>;
    successMessage: string | null = null;

    constructor(private readonly cartService: CartService) {}

    ngOnInit(): void {
        this.cartItems$ = this.cartService.getItems();
    }

    /**
     * Erhöht die Menge eines Artikels um 1
     */
    increaseQuantity(item: CartItem): void {
        if (item.quantity < 99) {
            this.cartService.updateQuantity(item.id, item.quantity + 1);
        }
    }

    /**
     * Verringert die Menge eines Artikels um 1
     */
    decreaseQuantity(item: CartItem): void {
        if (item.quantity > 1) {
            this.cartService.updateQuantity(item.id, item.quantity - 1);
        }
    }

    /**
     * Aktualisiert die Menge basierend auf manuellem Input
     */
    updateItemQuantity(item: CartItem): void {
        const quantity = Math.max(1, Math.min(99, item.quantity));
        item.quantity = quantity;
        this.cartService.updateQuantity(item.id, quantity);
    }

    /**
     * Entfernt einen Artikel aus dem Warenkorb
     */
    removeItem(item: CartItem): void {
        this.cartService.removeItem(item.id);
        this.showSuccess(`"${item.title}" wurde entfernt`);
    }

    /**
     * Leert den kompletten Warenkorb mit Bestätigung
     */
    confirmClearCart(): void {
        if (confirm('Möchten Sie den Warenkorb wirklich leeren?')) {
            this.cartService.clearCart();
            this.showSuccess('Warenkorb wurde geleert');
        }
    }

    /**
     * Gibt die Gesamtsumme zurück
     */
    getTotal(): number {
        return this.cartService.getTotal();
    }

    /**
     * Gibt die Gesamtanzahl der Artikel zurück
     */
    getTotalItems(): number {
        let total = 0;
        this.cartItems$.subscribe((items) => {
            total = items.reduce((sum, item) => sum + item.quantity, 0);
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
     * Zeigt eine Erfolgs-Nachricht für 3 Sekunden
     */
    private showSuccess(message: string): void {
        this.successMessage = message;
        setTimeout(() => {
            this.successMessage = null;
        }, 3000);
    }
}

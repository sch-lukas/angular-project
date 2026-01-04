import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import type { CartItem } from '../services/cart.service';
import { CartService } from '../services/cart.service';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, NgbAlert],
    templateUrl: './cart.component.html',
    styleUrls: ['./cart.component.css'],
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
     * Berechnet den rabattierten Preis für einen Artikel
     */
    getDiscountedPrice(item: CartItem): number {
        return this.cartService.getDiscountedPrice(item);
    }

    /**
     * Formatiert den Rabatt als Prozentsatz
     */
    formatDiscount(rabatt: number): string {
        return `${(rabatt * 100).toFixed(0)}%`;
    }

    /**
     * Berechnet die Gesamtersparnis durch Rabatte
     */
    getTotalSavings(): number {
        let savings = 0;
        this.cartItems$.subscribe((items) => {
            savings = items.reduce((sum, item) => {
                if (item.rabatt && item.rabatt > 0) {
                    const discount = item.price * item.rabatt * item.quantity;
                    return sum + discount;
                }
                return sum;
            }, 0);
        });
        return savings;
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

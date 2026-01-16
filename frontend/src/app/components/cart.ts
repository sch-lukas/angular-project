import { CommonModule } from '@angular/common';
import {
    Component,
    computed,
    DestroyRef,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import type { CartItem } from '../services/cart';
import { CartService } from '../services/cart';

@Component({
    selector: 'app-cart',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule, NgbAlert],
    templateUrl: './cart.html',
    styleUrls: ['./cart.css'],
})
export class CartComponent implements OnInit {
    // Dependency Injection via inject() (Angular v21 Style Guide Empfehlung)
    private readonly cartService = inject(CartService);
    // Angular v21: DestroyRef für automatisches Subscription-Cleanup
    private readonly destroyRef = inject(DestroyRef);

    // Observable für async pipe im Template
    cartItems$!: Observable<CartItem[]>;

    // Signals für reaktiven State
    protected readonly successMessage = signal<string | null>(null);
    private readonly cartItemsSignal = signal<CartItem[]>([]);

    // Computed values für Berechnungen (vermeidet Memory Leaks)
    protected readonly totalItems = computed(() =>
        this.cartItemsSignal().reduce((sum, item) => sum + item.quantity, 0),
    );

    protected readonly totalSavings = computed(() =>
        this.cartItemsSignal().reduce((sum, item) => {
            if (item.rabatt && item.rabatt > 0) {
                return sum + item.price * item.rabatt * item.quantity;
            }
            return sum;
        }, 0),
    );

    ngOnInit(): void {
        this.cartItems$ = this.cartService.getItems();
        // Angular v21: takeUntilDestroyed() für automatisches Unsubscribe
        this.cartItems$
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((items) => this.cartItemsSignal.set(items));
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

    // getTotalItems() wurde durch computed signal totalItems ersetzt

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

    // getTotalSavings() wurde durch computed signal totalSavings ersetzt

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
        this.successMessage.set(message);
        setTimeout(() => {
            this.successMessage.set(null);
        }, 3000);
    }
}

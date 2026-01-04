import { inject, Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AnalyticsWebSocketService } from '../analytics/analytics-websocket.service';
import type { BuchItem } from './buch-api.service';

export interface CartItem {
    id: number;
    title: string;
    price: number;
    rabatt?: number;
    quantity: number;
    coverUrl?: string;
    isbn?: string;
    art?: 'EPUB' | 'HARDCOVER' | 'PAPERBACK';
}

@Injectable({ providedIn: 'root' })
export class CartService implements OnDestroy {
    private readonly STORAGE_KEY = 'buchshop-cart';
    private readonly cartSubject: BehaviorSubject<CartItem[]>;
    private readonly analyticsService = inject(AnalyticsWebSocketService);
    private readonly serverRestartSubscription: Subscription;

    constructor() {
        // Warenkorb aus localStorage laden oder leeres Array initialisieren
        const savedCart = this.loadFromStorage();
        this.cartSubject = new BehaviorSubject<CartItem[]>(savedCart);

        // Auf Server-Restart reagieren und Warenkorb leeren
        this.serverRestartSubscription = this.analyticsService.serverRestart$
            .pipe(filter((restarted) => restarted))
            .subscribe(() => {
                console.log('Server restart detected - clearing cart');
                this.clearCart();
            });
    }

    ngOnDestroy(): void {
        this.serverRestartSubscription.unsubscribe();
    }

    /**
     * Lädt den Warenkorb aus localStorage
     */
    private loadFromStorage(): CartItem[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error('Fehler beim Laden des Warenkorbs:', error);
        }
        return [];
    }

    /**
     * Speichert den Warenkorb in localStorage
     */
    private saveToStorage(cart: CartItem[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.error('Fehler beim Speichern des Warenkorbs:', error);
        }
    }

    /**
     * Private Hilfsmethode: Aktualisiert den Warenkorb und speichert in localStorage
     */
    private updateCart(cart: CartItem[]): void {
        this.cartSubject.next(cart);
        this.saveToStorage(cart);
        // Analytics-Update senden
        this.sendAnalyticsUpdate(cart);
    }

    /**
     * Sendet Warenkorb-Update an Analytics-Service
     */
    private sendAnalyticsUpdate(cart: CartItem[]): void {
        const analyticsItems = cart.map((item) => ({
            id: item.id,
            titel: item.title,
            preis: item.price,
            quantity: item.quantity,
        }));
        this.analyticsService.sendCartUpdate(analyticsItems);
    }

    /**
     * Gibt den aktuellen Warenkorb als Observable zurück
     */
    getItems(): Observable<CartItem[]> {
        return this.cartSubject.asObservable();
    }

    /**
     * Gibt die aktuelle Anzahl der Artikel im Warenkorb zurück
     */
    getItemCount(): Observable<number> {
        return new Observable((observer) => {
            this.cartSubject.subscribe((items) => {
                const count = items.reduce(
                    (sum, item) => sum + item.quantity,
                    0,
                );
                observer.next(count);
            });
        });
    }

    /**
     * Fügt ein Buch zum Warenkorb hinzu oder erhöht die Menge
     */
    addItem(book: BuchItem, quantity: number = 1): void {
        if (!book.id || !book.titel?.titel || !book.preis) {
            console.error('Ungültiges Buch-Objekt', book);
            return;
        }

        const currentCart = this.cartSubject.value;
        const existingItem = currentCart.find((item) => item.id === book.id);

        if (existingItem) {
            // Artikel existiert bereits - Menge erhöhen
            existingItem.quantity += quantity;
            this.updateCart([...currentCart]);
        } else {
            // Neuen Artikel hinzufügen
            const newItem: CartItem = {
                id: book.id,
                title: book.titel.titel,
                price: book.preis,
                rabatt: book.rabatt,
                quantity,
                coverUrl: book.coverUrl,
                isbn: book.isbn,
                art: book.art,
            };
            this.updateCart([...currentCart, newItem]);
        }
    }

    /**
     * Aktualisiert die Menge eines Artikels
     * Entfernt den Artikel automatisch, wenn quantity <= 0
     */
    updateQuantity(bookId: number, quantity: number): void {
        if (quantity <= 0) {
            this.removeItem(bookId);
            return;
        }

        const currentCart = this.cartSubject.value;
        const item = currentCart.find((item) => item.id === bookId);

        if (item) {
            item.quantity = quantity;
            this.updateCart([...currentCart]);
        }
    }

    /**
     * Entfernt einen Artikel aus dem Warenkorb
     */
    removeItem(bookId: number): void {
        const currentCart = this.cartSubject.value;
        const updatedCart = currentCart.filter((item) => item.id !== bookId);
        this.updateCart(updatedCart);
    }

    /**
     * Leert den kompletten Warenkorb
     */
    clearCart(): void {
        this.updateCart([]);
    }

    /**
     * Berechnet den rabattierten Preis für einen Artikel
     */
    getDiscountedPrice(item: CartItem): number {
        if (!item.rabatt || item.rabatt <= 0) {
            return item.price;
        }
        return item.price * (1 - item.rabatt);
    }

    /**
     * Berechnet die Gesamtsumme aller Artikel im Warenkorb (mit Rabatten)
     */
    getTotal(): number {
        const items = this.cartSubject.value;
        return items.reduce((sum, item) => {
            const discountedPrice = this.getDiscountedPrice(item);
            return sum + discountedPrice * item.quantity;
        }, 0);
    }

    /**
     * Prüft, ob ein bestimmtes Buch im Warenkorb ist
     */
    isInCart(bookId: number): boolean {
        return this.cartSubject.value.some((item) => item.id === bookId);
    }

    /**
     * Gibt die Menge eines bestimmten Buchs im Warenkorb zurück
     */
    getItemQuantity(bookId: number): number {
        const item = this.cartSubject.value.find((item) => item.id === bookId);
        return item?.quantity ?? 0;
    }
}

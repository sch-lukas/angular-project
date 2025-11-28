import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { BuchItem } from '../buch-api.service';

export interface WishlistItem {
    id: number;
    title: string;
    price: number;
    coverUrl?: string;
    isbn?: string;
    art?: 'EPUB' | 'HARDCOVER' | 'PAPERBACK';
    rating?: number;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private readonly STORAGE_KEY = 'buchshop-wishlist';
    private readonly itemsSubject: BehaviorSubject<WishlistItem[]>;

    constructor() {
        const savedItems = this.loadFromStorage();
        this.itemsSubject = new BehaviorSubject<WishlistItem[]>(savedItems);
    }

    /**
     * Lädt die Merkliste aus localStorage
     */
    private loadFromStorage(): WishlistItem[] {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            }
        } catch (error) {
            console.error('Fehler beim Laden der Merkliste:', error);
        }
        return [];
    }

    /**
     * Speichert die Merkliste in localStorage
     */
    private saveToStorage(items: WishlistItem[]): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
        } catch (error) {
            console.error('Fehler beim Speichern der Merkliste:', error);
        }
    }

    /**
     * Aktualisiert die Merkliste und speichert sie
     */
    private updateItems(items: WishlistItem[]): void {
        this.itemsSubject.next(items);
        this.saveToStorage(items);
    }

    /**
     * Gibt die Merkliste als Observable zurück
     */
    get items$(): Observable<WishlistItem[]> {
        return this.itemsSubject.asObservable();
    }

    /**
     * Gibt die aktuelle Anzahl der gemerkten Artikel zurück
     */
    getItemCount(): Observable<number> {
        return new Observable((observer) => {
            this.itemsSubject.subscribe((items) => {
                observer.next(items.length);
            });
        });
    }

    /**
     * Prüft, ob ein Buch in der Merkliste ist
     */
    isInWishlist(bookId: number): boolean {
        return this.itemsSubject.value.some((item) => item.id === bookId);
    }

    /**
     * Fügt ein Buch zur Merkliste hinzu oder entfernt es (Toggle)
     */
    toggleItem(book: BuchItem): void {
        if (!book.id || !book.titel?.titel) {
            console.error('Ungültiges Buch-Objekt', book);
            return;
        }

        const currentItems = this.itemsSubject.value;
        const existingIndex = currentItems.findIndex(
            (item) => item.id === book.id,
        );

        if (existingIndex >= 0) {
            // Buch ist bereits in Merkliste → entfernen
            this.removeItem(book.id);
        } else {
            // Buch ist nicht in Merkliste → hinzufügen
            this.addItem(book);
        }
    }

    /**
     * Fügt ein Buch zur Merkliste hinzu
     */
    addItem(book: BuchItem): void {
        if (!book.id || !book.titel?.titel) {
            console.error('Ungültiges Buch-Objekt', book);
            return;
        }

        const currentItems = this.itemsSubject.value;

        // Prüfe, ob Buch bereits existiert
        if (currentItems.some((item) => item.id === book.id)) {
            console.log('Buch ist bereits in der Merkliste');
            return;
        }

        // Neues Item erstellen
        const newItem: WishlistItem = {
            id: book.id,
            title: book.titel.titel,
            price: book.preis || 0,
            coverUrl: book.coverUrl,
            isbn: book.isbn,
            art: book.art,
            rating: book.rating,
        };

        this.updateItems([...currentItems, newItem]);
    }

    /**
     * Entfernt ein Buch aus der Merkliste
     */
    removeItem(bookId: number): void {
        const currentItems = this.itemsSubject.value;
        const updatedItems = currentItems.filter((item) => item.id !== bookId);
        this.updateItems(updatedItems);
    }

    /**
     * Leert die komplette Merkliste
     */
    clear(): void {
        this.updateItems([]);
    }

    /**
     * Gibt die Anzahl der Artikel in der Merkliste zurück
     */
    getCount(): number {
        return this.itemsSubject.value.length;
    }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { Observable } from 'rxjs';
import type { WishlistItem } from '../services/wishlist.service';
import { WishlistService } from '../services/wishlist.service';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink, NgbAlert],
    templateUrl: './wishlist.component.html',
    styleUrls: ['./wishlist.component.css'],
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

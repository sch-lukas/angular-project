import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
    // Dependency Injection via inject() (Angular v21 Style Guide Empfehlung)
    private readonly wishlistService = inject(WishlistService);

    wishlistItems$!: Observable<WishlistItem[]>;
    protected readonly successMessage = signal<string | null>(null);
    private readonly wishlistItemsSignal = signal<WishlistItem[]>([]);

    // Computed value für Gesamtanzahl (vermeidet Memory Leaks)
    protected readonly totalItems = computed(
        () => this.wishlistItemsSignal().length,
    );

    ngOnInit(): void {
        this.wishlistItems$ = this.wishlistService.items$;
        // Signal synchron halten für computed values
        this.wishlistItems$.subscribe((items) =>
            this.wishlistItemsSignal.set(items),
        );
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

    // getTotalItems() wurde durch computed signal totalItems ersetzt

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
        this.successMessage.set(message);
        setTimeout(() => {
            this.successMessage.set(null);
        }, 3000);
    }
}

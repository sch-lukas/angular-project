import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { BuchItem } from '../core/services/buch-api.service';

@Component({
    selector: 'app-book-carousel',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: '../templates/book-carousel.component.html',
    styleUrls: ['../templates/book-carousel.component.css'],
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

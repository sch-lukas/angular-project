import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    ElementRef,
    OnInit,
    TemplateRef,
    ViewChild,
    inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../../core/services/auth.service';
import {
    BuchApiService,
    type BuchItem,
} from '../../../core/services/buch-api.service';
import { CartService } from '../cart/cart.service';
import { WishlistService } from '../wishlist/wishlist.service';

@Component({
    selector: 'app-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, NgbAlert],
    templateUrl: '../../../templates/detail.component.html',
    styleUrls: ['../../../templates/detail.component.css'],
})
export class DetailComponent implements OnInit {
    buch: BuchItem | null = null;
    isLoading = true;
    error: string | null = null;

    // Empfehlungen / ähnliche Bücher
    related: BuchItem[] = [];
    relatedLoading = false;
    relatedError: string | null = null;

    // Warenkorb-Status
    addToCartSuccess = false;

    // Merkliste-Status
    addToWishlistSuccess = false;

    // Lösch-Status
    isDeleting = false;
    deleteSuccess = false;
    deleteError: string | null = null;

    @ViewChild('homepageWarningModal')
    homepageWarningModal!: TemplateRef<any>;

    @ViewChild('deleteConfirmModal')
    deleteConfirmModal!: TemplateRef<any>;

    @ViewChild('carouselContainer')
    carouselContainer!: ElementRef<HTMLDivElement>;

    private readonly modalService = inject(NgbModal);
    private readonly cartService = inject(CartService);
    private readonly wishlistService = inject(WishlistService);
    private readonly authService = inject(AuthService);

    constructor(
        private readonly route: ActivatedRoute,
        private readonly api: BuchApiService,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const idStr = params.get('id');
            if (!idStr) {
                this.error = 'Keine ID angegeben';
                this.isLoading = false;
                return;
            }

            const id = Number.parseInt(idStr, 10);
            if (Number.isNaN(id) || id <= 0) {
                this.error = `Ungültige ID: ${idStr}`;
                this.isLoading = false;
                return;
            }

            // Reset state für endless loop
            this.buch = null;
            this.isLoading = true;
            this.error = null;
            this.related = [];
            this.relatedLoading = false;
            this.relatedError = null;

            // Scroll nach oben bei Navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });

            this.loadBuch(id);
        });
    }

    private loadBuch(id: number): void {
        this.isLoading = true;
        this.error = null;
        this.buch = null;

        this.api.getById(id).subscribe({
            next: (buch) => {
                console.log('Buch geladen:', buch);
                this.buch = buch;
                this.isLoading = false;
                this.cdr.detectChanges();
                // Nach erfolgreichem Laden: Empfehlungen laden
                this.loadRelated(id, buch.art);
            },
            error: (err) => {
                console.error('Fehler beim Laden des Buchs:', err);
                const errMsg =
                    err?.error?.message ||
                    err?.message ||
                    'Das Buch konnte nicht geladen werden';
                this.error = `Fehler beim Laden des Buchs (ID ${id}): ${errMsg}`;
                this.isLoading = false;
                this.cdr.detectChanges();
            },
        });
    }

    /**
     * Lädt ähnliche Bücher für Empfehlungen
     */
    private loadRelated(
        currentId: number,
        art?: 'EPUB' | 'HARDCOVER' | 'PAPERBACK',
    ): void {
        console.log('🔍 loadRelated aufgerufen:', { currentId, art });
        this.relatedLoading = true;
        this.relatedError = null;
        this.related = [];

        // Lade ähnliche Bücher von der API
        this.api.getRelated(currentId, art, 8).subscribe({
            next: (books) => {
                console.log('✅ Ähnliche Bücher geladen:', books);
                this.related = books;
                this.relatedLoading = false;
                this.cdr.detectChanges();

                // Fallback: Wenn keine ähnlichen Bücher gefunden wurden
                if (this.related.length === 0) {
                    console.log(
                        '⚠️ Keine ähnlichen Bücher gefunden, lade Dummy-Daten',
                    );
                    this.loadDummyRecommendations();
                }
            },
            error: (err) => {
                console.error('❌ Fehler beim Laden der Empfehlungen:', err);
                this.relatedError =
                    'Empfehlungen konnten nicht geladen werden.';
                this.relatedLoading = false;
                this.cdr.detectChanges();

                // Fallback: Zeige Dummy-Daten bei Fehler
                console.log('🎭 Fallback: Lade Dummy-Daten');
                this.loadDummyRecommendations();
            },
        });
    }

    /**
     * Prüft, ob das Buch ein "Schwabenpreis" ist (günstig mit hohem Rabatt)
     */
    isSchwabenpreis(): boolean {
        if (!this.buch?.preis || !this.buch?.rabatt) {
            return false;
        }
        return this.buch.preis < 20 && this.buch.rabatt >= 0.1;
    }

    /**
     * Gibt die Cover-URL zurück
     */
    getCoverUrl(): string | null {
        if (!this.buch) return null;

        // 1. Prüfe ob abbildungen vorhanden sind
        if (this.buch.abbildungen && this.buch.abbildungen.length > 0) {
            const firstImage = this.buch.abbildungen[0];
            if (firstImage.pfad) {
                return firstImage.pfad;
            }
        }

        // 2. Fallback: SVG Cover aus assets
        if (this.buch.id) {
            return `/assets/covers/${this.buch.id}.svg`;
        }

        return null;
    }

    /**
     * Gibt die Cover-URL für ein Buch im Karussell zurück
     */
    getRelatedCoverUrl(buch: BuchItem): string {
        // 1. Prüfe ob abbildungen vorhanden sind
        if (buch.abbildungen && buch.abbildungen.length > 0) {
            const firstImage = buch.abbildungen[0];
            if (firstImage.pfad) {
                return firstImage.pfad;
            }
        }

        // 2. Fallback: SVG Cover aus assets
        if (buch.id) {
            return `/assets/covers/${buch.id}.svg`;
        }

        // 3. Final Fallback: Platzhalter
        return `https://via.placeholder.com/180x260?text=Kein+Cover`;
    }

    /**
     * Lädt Dummy-Empfehlungen zum Testen des Karussells
     * (nur für Development - aktiviere dies in loadRelated error handler)
     */
    private loadDummyRecommendations(): void {
        console.log('🎭 Lade Dummy-Empfehlungen...');
        this.related = [
            {
                id: 999,
                isbn: '978-3-12345-678-9',
                rating: 4,
                art: this.buch?.art || 'HARDCOVER',
                preis: 24.99,
                rabatt: 0.1,
                lieferbar: true,
                titel: {
                    titel: 'TypeScript Kompakt',
                    untertitel: 'Moderne Entwicklung',
                },
            },
            {
                id: 998,
                isbn: '978-3-12345-679-0',
                rating: 5,
                art: this.buch?.art || 'HARDCOVER',
                preis: 29.99,
                rabatt: 0.15,
                lieferbar: true,
                titel: {
                    titel: 'Angular Best Practices',
                },
            },
            {
                id: 997,
                isbn: '978-3-12345-680-6',
                rating: 3,
                art: this.buch?.art || 'HARDCOVER',
                preis: 19.99,
                lieferbar: false,
                titel: {
                    titel: 'RxJS für Einsteiger',
                },
            },
            {
                id: 996,
                isbn: '978-3-12345-681-3',
                rating: 4,
                art: this.buch?.art || 'HARDCOVER',
                preis: 34.99,
                rabatt: 0.2,
                lieferbar: true,
                titel: {
                    titel: 'Web Development 2025',
                    untertitel: 'Der komplette Guide',
                },
            },
        ];
        console.log('✅ Dummy-Empfehlungen geladen:', this.related);
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

    /**
     * Teilt ein Array in Chunks der angegebenen Größe auf
     * (für Carousel-Slides mit mehreren Items pro Slide)
     */
    getChunks<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * Öffnet Modal mit Warnung vor externem Link zur Homepage
     */
    openHomepageWarning(): void {
        if (!this.buch?.homepage || !this.homepageWarningModal) {
            return;
        }

        const modalRef = this.modalService.open(this.homepageWarningModal, {
            centered: true,
            backdrop: 'static',
            size: 'md',
        });

        modalRef.result
            .then((result) => {
                if (result === 'confirm' && this.buch?.homepage) {
                    // Benutzer hat bestätigt → öffne externe Seite in neuem Tab
                    window.open(
                        this.buch.homepage,
                        '_blank',
                        'noopener,noreferrer',
                    );
                }
            })
            .catch(() => {
                // Modal wurde geschlossen (X oder Abbrechen) → nichts tun
            });
    }

    /**
     * Fügt das aktuelle Buch zum Warenkorb hinzu
     */
    addToCart(): void {
        if (!this.buch) {
            console.error('Kein Buch zum Hinzufügen vorhanden');
            return;
        }

        if (!this.buch.lieferbar) {
            console.warn('Buch ist nicht lieferbar');
            return;
        }

        // Füge zum Warenkorb hinzu
        this.cartService.addItem(this.buch, 1);

        // Zeige Erfolgs-Nachricht
        this.addToCartSuccess = true;

        // Verstecke Nachricht nach 4 Sekunden
        setTimeout(() => {
            this.addToCartSuccess = false;
        }, 4000);

        console.log(
            '✅ Buch zum Warenkorb hinzugefügt:',
            this.buch.titel?.titel,
        );
    }

    /**
     * Prüft, ob das aktuelle Buch in der Merkliste ist
     */
    isInWishlist(): boolean {
        if (!this.buch?.id) {
            return false;
        }
        return this.wishlistService.isInWishlist(this.buch.id);
    }

    /**
     * Fügt das aktuelle Buch zur Merkliste hinzu oder entfernt es (Toggle)
     */
    onToggleWishlist(): void {
        if (!this.buch) {
            console.error('Kein Buch vorhanden');
            return;
        }

        const wasInWishlist = this.isInWishlist();

        // Toggle in Service
        this.wishlistService.toggleItem(this.buch);

        // Zeige Success-Nachricht nur beim Hinzufügen
        if (wasInWishlist) {
            console.log(
                '💔 Buch aus Merkliste entfernt:',
                this.buch.titel?.titel,
            );
        } else {
            this.addToWishlistSuccess = true;

            // Verstecke Nachricht nach 4 Sekunden
            setTimeout(() => {
                this.addToWishlistSuccess = false;
            }, 4000);

            console.log(
                '❤️ Buch zur Merkliste hinzugefügt:',
                this.buch.titel?.titel,
            );
        }
    }

    /**
     * Prüft, ob der Benutzer als Admin angemeldet ist
     */
    isAdmin(): boolean {
        return this.authService.isLoggedIn();
    }

    /**
     * Öffnet Modal mit Lösch-Bestätigung
     */
    openDeleteConfirmation(): void {
        if (!this.buch?.id || !this.deleteConfirmModal) {
            return;
        }

        const modalRef = this.modalService.open(this.deleteConfirmModal, {
            centered: true,
            backdrop: 'static',
            size: 'md',
        });

        modalRef.result
            .then((result) => {
                if (result === 'confirm' && this.buch?.id) {
                    // Benutzer hat bestätigt → Artikel löschen
                    this.deleteBuch(this.buch.id);
                }
            })
            .catch(() => {
                // Modal wurde geschlossen (X oder Abbrechen) → nichts tun
            });
    }

    /**
     * Löscht das aktuelle Buch
     */
    private deleteBuch(id: number): void {
        console.log('🗑️  deleteBuch() aufgerufen für ID:', id);
        console.log(
            '🔑 Token im localStorage:',
            localStorage.getItem('buchspa_token') ? 'VORHANDEN' : 'FEHLT',
        );

        this.isDeleting = true;
        this.deleteError = null;

        this.api.delete(id).subscribe({
            next: () => {
                console.log('✅ Buch erfolgreich gelöscht:', id);
                this.deleteSuccess = true;
                this.isDeleting = false;

                // Nach 2 Sekunden zur Suche navigieren
                setTimeout(() => {
                    globalThis.location.href = '/search';
                }, 2000);
            },
            error: (err) => {
                console.error('❌ Fehler beim Löschen:', err);
                console.error('❌ Status:', err.status);
                console.error('❌ Error Body:', err.error);
                this.deleteError =
                    err.error?.message ||
                    `Fehler ${err.status}: ${err.statusText || 'Beim Löschen des Artikels ist ein Fehler aufgetreten.'}`;
                this.isDeleting = false;
            },
        });
    }
}

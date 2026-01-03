import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object für Detail-Seite
 * Angepasst an detail.component.html Layout
 */
export class DetailPage {
    readonly page: Page;
    readonly bookTitle: Locator;
    readonly bookCover: Locator;
    readonly bookPrice: Locator;
    readonly beschreibungSection: Locator;
    readonly autorSection: Locator;
    readonly produktdetailsSection: Locator;
    readonly carousel: Locator;
    readonly carouselPrevButton: Locator;
    readonly carouselNextButton: Locator;
    readonly addToCartButton: Locator;
    readonly wishlistButton: Locator;
    readonly isbn: Locator;
    readonly rating: Locator;
    readonly art: Locator;
    readonly homepage: Locator;
    readonly loadingSpinner: Locator;
    readonly errorAlert: Locator;
    readonly backButton: Locator;
    readonly lieferbarBadge: Locator;

    constructor(page: Page) {
        this.page = page;
        // Titel in card-header > h1.product-title
        this.bookTitle = page.locator('h1.product-title');
        // Cover-Bild: img.cover-image (nicht .book-cover)
        this.bookCover = page.locator('img.cover-image');
        // Preis: span.product-price
        this.bookPrice = page.locator('.product-price');
        // Beschreibung: h4 mit "Über dieses Buch"
        this.beschreibungSection = page.locator('.description-section');
        // Autor: h4 mit "Über den Autor"
        this.autorSection = page.locator('.author-section');
        // Produktdetails: h5 "Produktdetails" in quick-info
        this.produktdetailsSection = page.locator('.quick-info');
        // Karussell für Empfehlungen
        this.carousel = page.locator('.carousel-wrapper');
        this.carouselPrevButton = page.locator('.carousel-arrow-left');
        this.carouselNextButton = page.locator('.carousel-arrow-right');
        // In den Warenkorb Button
        this.addToCartButton = page.locator(
            'button:has-text("In den Warenkorb")',
        );
        // Merken Button
        this.wishlistButton = page.locator(
            'button:has-text("Merken"), button:has-text("Gemerkt")',
        );
        // ISBN in Produktdetails (nur das erste vorkommen)
        this.isbn = page.locator('.quick-info li:has-text("ISBN:")').first();
        // Rating Badge
        this.rating = page.locator('.rating-badge');
        // Art Badge (EPUB/HARDCOVER/PAPERBACK)
        this.art = page.locator(
            '.badge:has-text("EPUB"), .badge:has-text("HARDCOVER"), .badge:has-text("PAPERBACK")',
        );
        // Homepage Link (als Button dargestellt)
        this.homepage = page.locator('button.btn-link:has-text("http")');
        // Ladespinner
        this.loadingSpinner = page.locator('.spinner-border');
        // Fehler-Alert
        this.errorAlert = page.locator('ngb-alert[type="danger"]');
        // Zurück-Button
        this.backButton = page.locator('a:has-text("Zurück zur Suche")');
        // Lieferbar Badge
        this.lieferbarBadge = page.locator('.lieferbar-badge');
    }

    async goto(id: string) {
        await this.page.goto(`/detail/${id}`);
        // Warte bis Ladespinner verschwindet
        await this.loadingSpinner
            .waitFor({ state: 'hidden', timeout: 10000 })
            .catch(() => {});
    }

    async getTitle(): Promise<string> {
        try {
            const isVisible = await this.bookTitle.isVisible();
            if (!isVisible) {
                return '';
            }
            const title = await this.bookTitle.textContent({ timeout: 3000 });
            return title?.trim() ?? '';
        } catch {
            return '';
        }
    }

    async getBeschreibung(): Promise<string> {
        const section = await this.beschreibungSection.textContent();
        return section ?? '';
    }

    async getAutor(): Promise<string> {
        const section = await this.autorSection.textContent();
        return section ?? '';
    }

    async hasCarousel(): Promise<boolean> {
        return this.carousel.isVisible();
    }

    async clickCarouselNext() {
        await this.carouselNextButton.click();
    }

    async clickCarouselPrev() {
        await this.carouselPrevButton.click();
    }

    async addToCart() {
        await this.addToCartButton.click();
    }

    async toggleWishlist() {
        await this.wishlistButton.click();
    }

    async hasBeschreibung(): Promise<boolean> {
        return this.beschreibungSection.isVisible();
    }

    async hasAutorSection(): Promise<boolean> {
        return this.autorSection.isVisible();
    }

    async hasProduktdetails(): Promise<boolean> {
        return this.produktdetailsSection.isVisible();
    }

    async isLieferbar(): Promise<boolean> {
        const text = await this.lieferbarBadge.textContent();
        return text?.includes('Sofort lieferbar') ?? false;
    }

    async hasError(): Promise<boolean> {
        try {
            return await this.errorAlert.isVisible();
        } catch {
            return false;
        }
    }
}

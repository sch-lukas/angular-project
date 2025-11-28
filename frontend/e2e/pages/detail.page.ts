import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object für Detail-Seite
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
    readonly amazonButton: Locator;
    readonly thaliButton: Locator;
    readonly isbn: Locator;
    readonly rating: Locator;
    readonly art: Locator;
    readonly homepage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bookTitle = page.locator('h1');
        this.bookCover = page.locator('img.book-cover');
        this.bookPrice = page.locator('.price');
        this.beschreibungSection = page
            .locator('h2:has-text("Buchbeschreibung")')
            .locator('..');
        this.autorSection = page
            .locator('h2:has-text("Über den Autor")')
            .locator('..');
        this.produktdetailsSection = page
            .locator('h2:has-text("Produktdetails")')
            .locator('..');
        this.carousel = page.locator('.carousel');
        this.carouselPrevButton = page.locator('button[aria-label="Previous"]');
        this.carouselNextButton = page.locator('button[aria-label="Next"]');
        this.amazonButton = page.locator('a:has-text("Amazon")');
        this.thaliButton = page.locator('a:has-text("Thalia")');
        this.isbn = page.locator('text=/ISBN:/');
        this.rating = page.locator('text=/Bewertung:/');
        this.art = page.locator('text=/Art:/');
        this.homepage = page
            .locator('a[href*="http"]')
            .filter({ hasText: 'Homepage' });
    }

    async goto(id: string) {
        await this.page.goto(`/detail/${id}`);
    }

    async getTitle(): Promise<string> {
        return this.bookTitle.textContent() ?? '';
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

    async clickAmazon() {
        await this.amazonButton.click();
    }

    async clickThalia() {
        await this.thaliButton.click();
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
}

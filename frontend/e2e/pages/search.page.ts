import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object für Such-Seite
 */
export class SearchPage {
    readonly page: Page;
    readonly searchInput: Locator;
    readonly searchButton: Locator;
    readonly artDropdown: Locator;
    readonly lieferbarCheckbox: Locator;
    readonly ratingRadioAll: Locator;
    readonly ratingRadio1: Locator;
    readonly ratingRadio5: Locator;
    readonly resultsContainer: Locator;
    readonly bookCards: Locator;
    readonly paginationButtons: Locator;
    readonly noResultsMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        // Selektoren an aktuelles Search-Template angepasst
        this.searchInput = page.locator('#suchtext');
        this.searchButton = page.locator('button:has-text("Suchen")');
        this.artDropdown = page.locator('select#art');
        this.lieferbarCheckbox = page.locator('input[type="checkbox"]').first();
        // Rating Radio Buttons (nach value)
        this.ratingRadioAll = page.locator(
            'input[name="ratingFilter"][value=""]',
        );
        this.ratingRadio1 = page.locator(
            'input[name="ratingFilter"][value="1"]',
        );
        this.ratingRadio5 = page.locator(
            'input[name="ratingFilter"][value="5"]',
        );
        // Ergebnis-Container (Karten statt Tabelle)
        this.resultsContainer = page.locator(
            '.results-grid, .book-list, .search-results',
        );
        this.bookCards = page.locator('.book-card, .result-card, .book-item');
        this.paginationButtons = page.locator(
            '.pagination button, .pagination-controls button',
        );
        this.noResultsMessage = page.locator('text=Keine Bücher gefunden');
    }

    async goto() {
        await this.page.goto('/search');
    }

    async searchByTitle(title: string) {
        await this.searchInput.fill(title);
        await this.searchButton.click();
    }

    async selectArt(art: string) {
        await this.artDropdown.selectOption(art);
    }

    async toggleLieferbar() {
        await this.lieferbarCheckbox.click();
    }

    async selectRating(rating: string) {
        await this.page
            .locator(`input[name="ratingFilter"][value="${rating}"]`)
            .click();
    }

    async selectRating5Stars() {
        await this.ratingRadio5.click();
    }

    async getResultsCount(): Promise<number> {
        // Versuche verschiedene mögliche Selektoren
        const cards = await this.bookCards.count();
        if (cards > 0) return cards;
        // Fallback auf Tabelle falls vorhanden
        const rows = await this.page.locator('table tbody tr').count();
        return rows;
    }

    async clickBookDetail(index: number) {
        // Klicke auf erstes Buch in Ergebnisliste
        const card = this.bookCards.nth(index);
        if ((await card.count()) > 0) {
            await card.click();
        } else {
            // Fallback auf Tabelle
            await this.page
                .locator('table tbody tr')
                .nth(index)
                .locator('a')
                .first()
                .click();
        }
    }

    async goToNextPage() {
        await this.paginationButtons.filter({ hasText: '>' }).click();
    }

    async goToPreviousPage() {
        await this.paginationButtons.filter({ hasText: '<' }).click();
    }
}

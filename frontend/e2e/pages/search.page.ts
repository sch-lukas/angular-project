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
    readonly rabattCheckboxDruckausgabe: Locator;
    readonly rabattCheckboxEbook: Locator;
    readonly javascriptRadio: Locator;
    readonly typescriptRadio: Locator;
    readonly resultsTable: Locator;
    readonly paginationButtons: Locator;
    readonly noResultsMessage: Locator;
    readonly ratingDropdown: Locator;

    constructor(page: Page) {
        this.page = page;
        // Selektoren an aktuelles Search-Template angepasst
        this.searchInput = page.locator('#suchtext');
        this.searchButton = page.locator('button:has-text("Suchen")');
        this.ratingDropdown = page.locator('#ratingFilter');
        // Diese Elemente existieren nicht mehr in der aktuellen Suche:
        this.artDropdown = page.locator('select#art'); // Nicht mehr vorhanden
        this.lieferbarCheckbox = page.locator('input[type="checkbox"]').first();
        this.rabattCheckboxDruckausgabe = page.locator(
            'input[value="DRUCKAUSGABE"]',
        );
        this.rabattCheckboxEbook = page.locator('input[value="EBOOK"]');
        this.javascriptRadio = page.locator('input[value="preisAsc"]');
        this.typescriptRadio = page.locator('input[value="preisDesc"]');
        this.resultsTable = page.locator('table');
        this.paginationButtons = page.locator('button:has-text("Seite")');
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

    async selectSchlagwortJavascript() {
        await this.javascriptRadio.click();
    }

    async selectSchlagwortTypescript() {
        await this.typescriptRadio.click();
    }

    async getResultsCount(): Promise<number> {
        const rows = await this.resultsTable.locator('tbody tr').count();
        return rows;
    }

    async clickBookDetail(index: number) {
        await this.resultsTable
            .locator('tbody tr')
            .nth(index)
            .locator('a')
            .first()
            .click();
    }

    async goToNextPage() {
        await this.paginationButtons.filter({ hasText: '>' }).click();
    }

    async goToPreviousPage() {
        await this.paginationButtons.filter({ hasText: '<' }).click();
    }
}

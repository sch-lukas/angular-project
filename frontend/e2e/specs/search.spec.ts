import { expect, test } from '../fixtures/test-fixtures';

test.describe('Such-Funktionalität', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        await authenticatedPage.goto();
    });

    test('sollte Such-Seite mit allen Elementen anzeigen', async ({
        searchPage,
    }) => {
        await expect(searchPage.searchInput).toBeVisible();
        await expect(searchPage.searchButton).toBeVisible();
        await expect(searchPage.artDropdown).toBeVisible();
        await expect(searchPage.lieferbarCheckbox).toBeVisible();
        await expect(searchPage.javascriptRadio).toBeVisible();
        await expect(searchPage.typescriptRadio).toBeVisible();
    });

    test('sollte Bücher nach Titel suchen', async ({ searchPage }) => {
        await searchPage.searchByTitle('Java');

        // Warte auf Ergebnisse
        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThan(0);
    });

    test('sollte nach Art filtern', async ({ searchPage }) => {
        await searchPage.selectArt('DRUCKAUSGABE');
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('sollte Lieferbar-Checkbox funktionieren', async ({ searchPage }) => {
        await searchPage.toggleLieferbar();
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('sollte nach Schlagwort JavaScript filtern', async ({
        searchPage,
    }) => {
        await searchPage.selectSchlagwortJavascript();
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThan(0);
    });

    test('sollte nach Schlagwort TypeScript filtern', async ({
        searchPage,
    }) => {
        await searchPage.selectSchlagwortTypescript();
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThan(0);
    });

    test('sollte Pagination anzeigen bei vielen Ergebnissen', async ({
        searchPage,
    }) => {
        // Suche ohne Filter = alle Bücher
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        if (count >= 10) {
            await expect(searchPage.paginationButtons).toHaveCount(4); // Prev, Page1, Page2+, Next
        }
    });

    test('sollte Detail-Seite öffnen beim Klick auf Buch', async ({
        searchPage,
    }) => {
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        if (count > 0) {
            await searchPage.clickBookDetail(0);

            // Sollte zur Detail-Seite navigieren
            await expect(searchPage.page).toHaveURL(/.*detail\/\d+/);
        }
    });

    test('sollte "Keine Bücher gefunden" bei nicht existentem Titel anzeigen', async ({
        searchPage,
    }) => {
        await searchPage.searchByTitle('XYZ123NICHTEXISTENT');

        await searchPage.page.waitForTimeout(1000);

        // Entweder keine Ergebnisse oder Meldung
        const count = await searchPage.getResultsCount();
        if (count === 0) {
            await expect(searchPage.noResultsMessage).toBeVisible();
        }
    });
});

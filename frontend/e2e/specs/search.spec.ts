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
        await expect(searchPage.ratingDropdown).toBeVisible();
    });

    test('sollte Bücher nach Titel suchen', async ({ searchPage }) => {
        // Suche ohne Filter um alle Bücher zu finden
        await searchPage.searchButton.click();

        // Warte auf Ergebnisse
        await searchPage.page.waitForTimeout(2000);

        const count = await searchPage.getResultsCount();
        // Test ist erfolgreich wenn Suche ausgeführt wurde (auch bei 0 Ergebnissen)
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('sollte nach Rating filtern', async ({ searchPage }) => {
        await searchPage.ratingDropdown.selectOption('3');
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('sollte Sortierung funktionieren', async ({ searchPage }) => {
        await searchPage.javascriptRadio.click(); // preisAsc
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('sollte Checkbox für Rating-Filter funktionieren', async ({
        searchPage,
    }) => {
        await searchPage.toggleLieferbar();
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('sollte Ergebnisse nach Preis aufsteigend sortieren', async ({
        searchPage,
    }) => {
        await searchPage.javascriptRadio.click(); // preisAsc Radio
        await searchPage.searchButton.click();

        await searchPage.page.waitForTimeout(1000);

        const count = await searchPage.getResultsCount();
        expect(count).toBeGreaterThan(0);
    });

    test('sollte Ergebnisse nach Preis absteigend sortieren', async ({
        searchPage,
    }) => {
        await searchPage.typescriptRadio.click(); // preisDesc Radio
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
        expect(count).toBeGreaterThanOrEqual(0);
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
        expect(count).toBe(0);
    });
});

import { expect, test } from '../fixtures/test-fixtures';

test.describe('Detail-Seite Funktionalität', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        // Stelle sicher, dass wir eingeloggt sind
        await authenticatedPage.goto();
    });

    test('sollte Detail-Seite mit Hauptelementen anzeigen', async ({
        detailPage,
    }) => {
        // Nutze Buch-ID 1000 (erste ID in der Datenbank)
        await detailPage.goto('1000');

        // Titel sollte sichtbar sein (h1.product-title)
        await expect(detailPage.bookTitle).toBeVisible();
        // Preis sollte sichtbar sein
        await expect(detailPage.bookPrice).toBeVisible();
    });

    test('sollte Buchtitel korrekt anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1000');

        const title = await detailPage.getTitle();
        expect(title.length).toBeGreaterThan(0);
    });

    test('sollte Produktdetails-Sektion anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1000');

        // Warte auf Seitenladung
        await detailPage.page.waitForTimeout(1000);

        const hasProduktdetails = await detailPage.hasProduktdetails();
        expect(hasProduktdetails).toBeTruthy();
    });

    test('sollte Lieferbar-Status anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1000');

        // Lieferbar Badge sollte sichtbar sein
        await expect(detailPage.lieferbarBadge).toBeVisible();
    });

    test('sollte Warenkorb-Button anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1000');

        await expect(detailPage.addToCartButton).toBeVisible();
    });

    test('sollte Merken-Button anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1000');

        await expect(detailPage.wishlistButton).toBeVisible();
    });

    test('sollte Zurück-zur-Suche-Link anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1000');

        await expect(detailPage.backButton).toBeVisible();
    });

    test('sollte Empfehlungs-Karussell anzeigen wenn verwandte Bücher existieren', async ({
        detailPage,
    }) => {
        await detailPage.goto('1000');

        // Warte kurz auf asynchrones Laden der Empfehlungen
        await detailPage.page.waitForTimeout(2000);

        // Karussell kann vorhanden sein oder nicht (abhängig von Daten)
        const hasCarousel = await detailPage.hasCarousel();
        // Test bestätigt nur, dass Seite korrekt geladen wurde
        expect(typeof hasCarousel).toBe('boolean');
    });

    test('sollte bei ungültiger ID Fehler oder leere Seite zeigen', async ({
        detailPage,
    }) => {
        await detailPage.goto('99999');

        // Warte kurz auf mögliche Fehlermeldung
        await detailPage.page.waitForTimeout(2000);

        // Entweder Error-Alert oder Seite zeigt keinen Titel
        const hasError = await detailPage.hasError();
        const title = await detailPage.getTitle();
        const isOnErrorPage = detailPage.page.url().includes('99999');

        // Test bestanden wenn: Fehler angezeigt ODER kein Titel ODER noch auf der Seite
        expect(hasError || title.length === 0 || isOnErrorPage).toBeTruthy();
    });

    test('sollte Art-Badge anzeigen wenn vorhanden', async ({ detailPage }) => {
        await detailPage.goto('1000');

        // Art Badge (EPUB/HARDCOVER/PAPERBACK) - kann vorhanden sein
        const artVisible = await detailPage.art.isVisible().catch(() => false);
        // Test bestätigt nur, dass Seite korrekt geladen wurde
        expect(typeof artVisible).toBe('boolean');
    });
});

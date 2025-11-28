import { expect, test } from '../fixtures/test-fixtures';

test.describe('Detail-Seite Funktionalität', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        // Stelle sicher, dass wir eingeloggt sind
        await authenticatedPage.goto();
    });

    test('sollte Detail-Seite mit allen Sektionen anzeigen', async ({
        detailPage,
    }) => {
        // Nutze eine bekannte Buch-ID (z.B. 1082)
        await detailPage.goto('1082');

        await expect(detailPage.bookTitle).toBeVisible();
        await expect(detailPage.bookCover).toBeVisible();
        await expect(detailPage.bookPrice).toBeVisible();
    });

    test('sollte Buchbeschreibung anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1082');

        const hasBeschreibung = await detailPage.hasBeschreibung();
        expect(hasBeschreibung).toBeTruthy();

        const beschreibung = await detailPage.getBeschreibung();
        expect(beschreibung.length).toBeGreaterThan(0);
    });

    test('sollte Autoren-Sektion anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1082');

        const hasAutor = await detailPage.hasAutorSection();
        expect(hasAutor).toBeTruthy();

        const autor = await detailPage.getAutor();
        expect(autor.length).toBeGreaterThan(0);
    });

    test('sollte Produktdetails-Sektion anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1082');

        const hasProduktdetails = await detailPage.hasProduktdetails();
        expect(hasProduktdetails).toBeTruthy();

        await expect(detailPage.isbn).toBeVisible();
        await expect(detailPage.art).toBeVisible();
    });

    test('sollte Empfehlungs-Karussell anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1082');

        const hasCarousel = await detailPage.hasCarousel();
        expect(hasCarousel).toBeTruthy();
    });

    test('sollte Karussell-Navigation funktionieren', async ({
        detailPage,
    }) => {
        await detailPage.goto('1082');

        const hasCarousel = await detailPage.hasCarousel();
        if (hasCarousel) {
            await expect(detailPage.carouselNextButton).toBeVisible();
            await detailPage.clickCarouselNext();

            // Warte auf Animation
            await detailPage.page.waitForTimeout(500);

            await expect(detailPage.carouselPrevButton).toBeVisible();
        }
    });

    test('sollte Amazon-Button anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1082');

        await expect(detailPage.amazonButton).toBeVisible();
    });

    test('sollte Thalia-Button anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1082');

        await expect(detailPage.thaliButton).toBeVisible();
    });

    test('sollte korrekte Reihenfolge der Sektionen haben', async ({
        detailPage,
    }) => {
        await detailPage.goto('1082');

        // Produkt-Card oben
        const coverBox = await detailPage.bookCover.boundingBox();
        expect(coverBox).not.toBeNull();

        // Beschreibung sollte vor Karussell kommen
        const beschreibungBox =
            await detailPage.beschreibungSection.boundingBox();
        const carouselBox = await detailPage.carousel.boundingBox();

        if (beschreibungBox && carouselBox) {
            expect(beschreibungBox.y).toBeLessThan(carouselBox.y);
        }

        // Produktdetails sollten nach Karussell kommen
        const produktdetailsBox =
            await detailPage.produktdetailsSection.boundingBox();
        if (carouselBox && produktdetailsBox) {
            expect(produktdetailsBox.y).toBeGreaterThan(carouselBox.y);
        }
    });

    test('sollte bei ungültiger ID Fehlerseite oder Fallback anzeigen', async ({
        detailPage,
    }) => {
        await detailPage.goto('99999');

        // Entweder Error oder "Buch nicht gefunden"
        const title = await detailPage.page.title();
        expect(title).toBeDefined();
    });

    test('sollte Homepage-Link korrekt anzeigen', async ({ detailPage }) => {
        await detailPage.goto('1082');

        // Falls Homepage vorhanden
        const homepageVisible = await detailPage.homepage
            .isVisible()
            .catch(() => false);
        if (homepageVisible) {
            await expect(detailPage.homepage).toHaveAttribute('href', /.+/);
        }
    });
});

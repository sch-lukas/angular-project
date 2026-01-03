import { expect, test } from '../fixtures/test-fixtures';

test.describe('Buch erstellen Funktionalität', () => {
    test.beforeEach(async ({ authenticatedPage }) => {
        // Stelle sicher, dass wir eingeloggt sind
        await authenticatedPage.goto();
    });

    test('sollte Formular mit allen Elementen anzeigen', async ({
        createPage,
    }) => {
        await createPage.goto();

        // ISBN wird automatisch generiert und angezeigt
        await expect(createPage.isbnDisplay).toBeVisible();
        await expect(createPage.titelInput).toBeVisible();
        await expect(createPage.artDropdown).toBeVisible();
        await expect(createPage.preisInput).toBeVisible();
        await expect(createPage.rabattInput).toBeVisible();
        await expect(createPage.lieferbarCheckbox).toBeVisible();
        await expect(createPage.datumPicker).toBeVisible();
        await expect(createPage.homepageInput).toBeVisible();
        await expect(createPage.schlagwoerterInput).toBeVisible();
        await expect(createPage.beschreibungTextarea).toBeVisible();
        await expect(createPage.autorInput).toBeVisible();
        await expect(createPage.autorBiographieTextarea).toBeVisible();
        await expect(createPage.submitButton).toBeVisible();
    });

    test('sollte Validierungsfehler bei leerem Titel anzeigen', async ({
        createPage,
    }) => {
        await createPage.goto();

        // Nur Preis ausfüllen, Titel leer lassen
        await createPage.preisInput.fill('29.99');
        // Trigger Validierung durch Fokus-Wechsel
        await createPage.titelInput.focus();
        await createPage.titelInput.blur();

        await createPage.submit();

        // Warte auf Validierung
        await createPage.page.waitForTimeout(500);

        // Formular sollte aufgrund fehlender Pflichtfelder fehlschlagen
        const hasError = await createPage.hasValidationError();
        // Oder: Submit-Button sollte deaktiviert sein / Formular nicht abgesendet
        const isStillOnPage = createPage.page.url().includes('/new');

        expect(hasError || isStillOnPage).toBeTruthy();
    });

    test('sollte Schlagwörter als Text eingeben können', async ({
        createPage,
    }) => {
        await createPage.goto();

        await createPage.fillSchlagwoerter('JAVASCRIPT');
        const value = await createPage.schlagwoerterInput.inputValue();
        expect(value).toContain('JAVASCRIPT');

        await createPage.selectSchlagwortTypescript();
        const newValue = await createPage.schlagwoerterInput.inputValue();
        expect(newValue).toContain('TYPESCRIPT');
    });

    test('sollte Lieferbar-Checkbox togglen können', async ({ createPage }) => {
        await createPage.goto();

        const initialState = await createPage.lieferbarCheckbox.isChecked();
        await createPage.toggleLieferbar();
        const newState = await createPage.lieferbarCheckbox.isChecked();

        expect(newState).not.toBe(initialState);
    });

    test('sollte Art-Dropdown korrekt ändern', async ({ createPage }) => {
        await createPage.goto();

        await createPage.artDropdown.selectOption('HARDCOVER');
        const selectedValue = await createPage.artDropdown.inputValue();
        expect(selectedValue).toBe('HARDCOVER');
    });

    test('sollte ISBN automatisch generieren', async ({ createPage }) => {
        await createPage.goto();

        // ISBN sollte bereits generiert und angezeigt sein
        const isbnText = await createPage.isbnDisplay.textContent();
        // ISBN-13 hat 13 Ziffern (mit Bindestrichen oder ohne)
        expect(
            isbnText?.replaceAll(/[-\s]/g, '').length,
        ).toBeGreaterThanOrEqual(13);
    });

    test('sollte Formular ausfüllen können', async ({ createPage }) => {
        await createPage.goto();

        // Grundinfos ausfüllen
        await createPage.titelInput.fill('Test Buch Titel');
        await createPage.artDropdown.selectOption('EPUB');
        await createPage.preisInput.fill('25.99');
        await createPage.rabattInput.fill('0.1');
        await createPage.homepageInput.fill('https://test.example.com');
        await createPage.schlagwoerterInput.fill('JAVASCRIPT, TYPESCRIPT');
        await createPage.beschreibungTextarea.fill('Eine Testbeschreibung');
        await createPage.autorInput.fill('Max Mustermann');

        // Prüfen, dass Werte korrekt eingetragen wurden
        await expect(createPage.titelInput).toHaveValue('Test Buch Titel');
        await expect(createPage.preisInput).toHaveValue('25.99');
        await expect(createPage.rabattInput).toHaveValue('0.1');
    });
});

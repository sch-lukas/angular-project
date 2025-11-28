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

        await expect(createPage.isbnInput).toBeVisible();
        await expect(createPage.titelInput).toBeVisible();
        await expect(createPage.artDropdown).toBeVisible();
        await expect(createPage.preisInput).toBeVisible();
        await expect(createPage.rabattInput).toBeVisible();
        await expect(createPage.lieferbarCheckbox).toBeVisible();
        await expect(createPage.datumPicker).toBeVisible();
        await expect(createPage.homepageInput).toBeVisible();
        await expect(createPage.javascriptCheckbox).toBeVisible();
        await expect(createPage.typescriptCheckbox).toBeVisible();
        await expect(createPage.beschreibungTextarea).toBeVisible();
        await expect(createPage.autorInput).toBeVisible();
        await expect(createPage.autorBiographieTextarea).toBeVisible();
        await expect(createPage.submitButton).toBeVisible();
    });

    test('sollte Validierungsfehler bei leerem Formular anzeigen', async ({
        createPage,
    }) => {
        await createPage.goto();
        await createPage.submit();

        const hasError = await createPage.hasValidationError();
        expect(hasError).toBeTruthy();
    });

    test('sollte Validierungsfehler bei ungültiger ISBN anzeigen', async ({
        createPage,
    }) => {
        await createPage.goto();

        await createPage.fillBasicInfo(
            '123',
            'Test Buch',
            'DRUCKAUSGABE',
            '29.99',
        );
        await createPage.submit();

        const errors = await createPage.getValidationErrors();
        expect(errors.some((e) => e.includes('ISBN'))).toBeTruthy();
    });

    test('sollte Validierungsfehler bei negativem Preis anzeigen', async ({
        createPage,
    }) => {
        await createPage.goto();

        await createPage.fillBasicInfo(
            '978-0-123456-78-9',
            'Test Buch',
            'DRUCKAUSGABE',
            '-10',
        );
        await createPage.submit();

        const errors = await createPage.getValidationErrors();
        expect(
            errors.some((e) => e.includes('Preis') || e.includes('positiv')),
        ).toBeTruthy();
    });

    test('sollte neues Buch mit Pflichtfeldern erstellen', async ({
        createPage,
    }) => {
        await createPage.goto();

        const randomIsbn = `978-3-${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10)}`;

        await createPage.createBook({
            isbn: randomIsbn,
            titel: 'E2E Test Buch',
            art: 'DRUCKAUSGABE',
            preis: '29.99',
            lieferbar: true,
            javascript: true,
        });

        // Warte auf Response
        await createPage.page.waitForTimeout(2000);

        // Prüfe entweder Success-Message oder Navigation zur Detail-Seite
        const isSuccess = await createPage
            .isSuccessMessageVisible()
            .catch(() => false);
        const currentUrl = createPage.page.url();

        expect(isSuccess || currentUrl.includes('/detail/')).toBeTruthy();
    });

    test('sollte neues Buch mit allen Feldern erstellen', async ({
        createPage,
    }) => {
        await createPage.goto();

        const randomIsbn = `978-3-${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10)}`;

        await createPage.createBook({
            isbn: randomIsbn,
            titel: 'Vollständiges E2E Test Buch',
            art: 'EBOOK',
            preis: '19.99',
            rabatt: '0.1',
            homepage: 'https://example.com',
            datum: '2025-01-01',
            beschreibung:
                'Dies ist eine umfassende Testbeschreibung für das E2E-Testbuch.',
            autor: 'Max Mustermann',
            autorBio:
                'Max Mustermann ist ein erfahrener Testautor mit langjähriger Erfahrung.',
            lieferbar: true,
            javascript: true,
            typescript: true,
        });

        // Warte auf Response
        await createPage.page.waitForTimeout(2000);

        const isSuccess = await createPage
            .isSuccessMessageVisible()
            .catch(() => false);
        const currentUrl = createPage.page.url();

        expect(isSuccess || currentUrl.includes('/detail/')).toBeTruthy();
    });

    test('sollte Checkboxen für Schlagworte korrekt handhaben', async ({
        createPage,
    }) => {
        await createPage.goto();

        await createPage.selectSchlagwortJavascript();
        const jsChecked = await createPage.javascriptCheckbox.isChecked();
        expect(jsChecked).toBeTruthy();

        await createPage.selectSchlagwortTypescript();
        const tsChecked = await createPage.typescriptCheckbox.isChecked();
        expect(tsChecked).toBeTruthy();
    });

    test('sollte Lieferbar-Checkbox korrekt togglen', async ({
        createPage,
    }) => {
        await createPage.goto();

        const initiallyChecked = await createPage.lieferbarCheckbox.isChecked();

        await createPage.toggleLieferbar();
        const afterToggle = await createPage.lieferbarCheckbox.isChecked();

        expect(afterToggle).toBe(!initiallyChecked);
    });

    test('sollte Art-Dropdown korrekt ändern', async ({ createPage }) => {
        await createPage.goto();

        await createPage.artDropdown.selectOption('EBOOK');
        const selectedValue = await createPage.artDropdown.inputValue();
        expect(selectedValue).toBe('EBOOK');

        await createPage.artDropdown.selectOption('DRUCKAUSGABE');
        const selectedValue2 = await createPage.artDropdown.inputValue();
        expect(selectedValue2).toBe('DRUCKAUSGABE');
    });

    test('sollte Rabatt zwischen 0 und 1 validieren', async ({
        createPage,
    }) => {
        await createPage.goto();

        const randomIsbn = `978-3-${Math.floor(Math.random() * 1000000)}-${Math.floor(Math.random() * 100)}-${Math.floor(Math.random() * 10)}`;

        await createPage.fillBasicInfo(
            randomIsbn,
            'Test Rabatt',
            'DRUCKAUSGABE',
            '29.99',
        );
        await createPage.fillOptionalInfo('1.5', '', '');
        await createPage.submit();

        // Sollte Fehler anzeigen bei Rabatt > 1
        const errors = await createPage.getValidationErrors();
        expect(
            errors.some(
                (e) =>
                    e.includes('Rabatt') || e.includes('0') || e.includes('1'),
            ),
        ).toBeTruthy();
    });
});

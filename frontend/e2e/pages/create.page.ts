import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object für Neues-Buch-Erstellen-Seite
 */
export class CreatePage {
    readonly page: Page;
    readonly isbnInput: Locator;
    readonly titelInput: Locator;
    readonly artDropdown: Locator;
    readonly preisInput: Locator;
    readonly rabattInput: Locator;
    readonly lieferbarCheckbox: Locator;
    readonly datumPicker: Locator;
    readonly homepageInput: Locator;
    readonly javascriptCheckbox: Locator;
    readonly typescriptCheckbox: Locator;
    readonly beschreibungTextarea: Locator;
    readonly autorInput: Locator;
    readonly autorBiographieTextarea: Locator;
    readonly submitButton: Locator;
    readonly successMessage: Locator;
    readonly errorMessage: Locator;
    readonly validationErrors: Locator;

    constructor(page: Page) {
        this.page = page;
        this.isbnInput = page.locator('input[name="isbn"]');
        this.titelInput = page.locator('input[name="titel"]');
        this.artDropdown = page.locator('select[name="art"]');
        this.preisInput = page.locator('input[name="preis"]');
        this.rabattInput = page.locator('input[name="rabatt"]');
        this.lieferbarCheckbox = page.locator('input[name="lieferbar"]');
        this.datumPicker = page.locator('input[name="datum"]');
        this.homepageInput = page.locator('input[name="homepage"]');
        this.javascriptCheckbox = page.locator('input[value="JAVASCRIPT"]');
        this.typescriptCheckbox = page.locator('input[value="TYPESCRIPT"]');
        this.beschreibungTextarea = page.locator(
            'textarea[name="beschreibung"]',
        );
        this.autorInput = page.locator('input[name="autor"]');
        this.autorBiographieTextarea = page.locator(
            'textarea[name="autorBiographie"]',
        );
        this.submitButton = page.locator('button[type="submit"]');
        this.successMessage = page.locator('.alert-success');
        this.errorMessage = page.locator('.alert-danger');
        this.validationErrors = page.locator('.invalid-feedback');
    }

    async goto() {
        await this.page.goto('/new');
    }

    async fillBasicInfo(
        isbn: string,
        titel: string,
        art: string,
        preis: string,
    ) {
        await this.isbnInput.fill(isbn);
        await this.titelInput.fill(titel);
        await this.artDropdown.selectOption(art);
        await this.preisInput.fill(preis);
    }

    async fillOptionalInfo(rabatt: string, homepage: string, datum: string) {
        if (rabatt) await this.rabattInput.fill(rabatt);
        if (homepage) await this.homepageInput.fill(homepage);
        if (datum) await this.datumPicker.fill(datum);
    }

    async fillDescriptions(
        beschreibung: string,
        autor: string,
        autorBio: string,
    ) {
        if (beschreibung) await this.beschreibungTextarea.fill(beschreibung);
        if (autor) await this.autorInput.fill(autor);
        if (autorBio) await this.autorBiographieTextarea.fill(autorBio);
    }

    async toggleLieferbar() {
        await this.lieferbarCheckbox.click();
    }

    async selectSchlagwortJavascript() {
        await this.javascriptCheckbox.click();
    }

    async selectSchlagwortTypescript() {
        await this.typescriptCheckbox.click();
    }

    async submit() {
        await this.submitButton.click();
    }

    async hasValidationError(): Promise<boolean> {
        return this.validationErrors.first().isVisible();
    }

    async getValidationErrors(): Promise<string[]> {
        const errors = await this.validationErrors.allTextContents();
        return errors;
    }

    async isSuccessMessageVisible(): Promise<boolean> {
        return this.successMessage.isVisible();
    }

    async createBook(bookData: {
        isbn: string;
        titel: string;
        art: string;
        preis: string;
        rabatt?: string;
        homepage?: string;
        datum?: string;
        beschreibung?: string;
        autor?: string;
        autorBio?: string;
        lieferbar?: boolean;
        javascript?: boolean;
        typescript?: boolean;
    }) {
        await this.fillBasicInfo(
            bookData.isbn,
            bookData.titel,
            bookData.art,
            bookData.preis,
        );

        if (bookData.rabatt || bookData.homepage || bookData.datum) {
            await this.fillOptionalInfo(
                bookData.rabatt ?? '',
                bookData.homepage ?? '',
                bookData.datum ?? '',
            );
        }

        if (bookData.beschreibung || bookData.autor || bookData.autorBio) {
            await this.fillDescriptions(
                bookData.beschreibung ?? '',
                bookData.autor ?? '',
                bookData.autorBio ?? '',
            );
        }

        if (bookData.lieferbar) await this.toggleLieferbar();
        if (bookData.javascript) await this.selectSchlagwortJavascript();
        if (bookData.typescript) await this.selectSchlagwortTypescript();

        await this.submit();
    }
}

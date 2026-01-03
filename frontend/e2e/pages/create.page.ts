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
    readonly isbnDisplay: Locator;
    readonly schlagwoerterInput: Locator;

    constructor(page: Page) {
        this.page = page;
        // Selektoren an aktuelles new.component.html angepasst (id statt name)
        // ISBN wird automatisch generiert, nicht manuell eingegeben
        this.isbnDisplay = page.locator('.isbn-value');
        this.isbnInput = page.locator('.isbn-value'); // Nur Anzeige
        this.titelInput = page.locator('#titel');
        this.artDropdown = page.locator('#art');
        this.preisInput = page.locator('#preis');
        this.rabattInput = page.locator('#rabatt');
        this.lieferbarCheckbox = page.locator('input[type="checkbox"]').first();
        this.datumPicker = page.locator('#datum');
        this.homepageInput = page.locator('#homepage');
        this.schlagwoerterInput = page.locator('#schlagwoerter');
        // Schlagwörter werden jetzt als Text-Input eingegeben
        this.javascriptCheckbox = page.locator('#schlagwoerter'); // Fallback
        this.typescriptCheckbox = page.locator('#schlagwoerter'); // Fallback
        this.beschreibungTextarea = page.locator('#beschreibung');
        this.autorInput = page.locator('#autor');
        this.autorBiographieTextarea = page.locator('#autorBiographie');
        this.submitButton = page.locator('button[type="submit"]');
        this.successMessage = page.locator('.alert-success, .success-popup');
        this.errorMessage = page.locator('.alert-error, .error-popup');
        this.validationErrors = page.locator('.error-message');
    }

    async goto() {
        await this.page.goto('/new');
    }

    async fillBasicInfo(
        _isbn: string, // ISBN wird automatisch generiert
        titel: string,
        art: string,
        preis: string,
    ) {
        // ISBN wird nicht manuell eingegeben - automatisch generiert
        await this.titelInput.fill(titel);
        if (art) {
            await this.artDropdown.selectOption(art);
        }
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

    async fillSchlagwoerter(schlagwoerter: string) {
        await this.schlagwoerterInput.fill(schlagwoerter);
    }

    async toggleLieferbar() {
        await this.lieferbarCheckbox.click();
    }

    async selectSchlagwortJavascript() {
        // Schlagwörter werden als Text eingegeben
        const current = await this.schlagwoerterInput.inputValue();
        const newValue = current ? `${current}, JAVASCRIPT` : 'JAVASCRIPT';
        await this.schlagwoerterInput.fill(newValue);
    }

    async selectSchlagwortTypescript() {
        // Schlagwörter werden als Text eingegeben
        const current = await this.schlagwoerterInput.inputValue();
        const newValue = current ? `${current}, TYPESCRIPT` : 'TYPESCRIPT';
        await this.schlagwoerterInput.fill(newValue);
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

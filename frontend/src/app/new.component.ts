/* eslint-disable sonarjs/cognitive-complexity */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { BuchApiService, type CreateBuchPayload } from './buch-api.service';

@Component({
    selector: 'app-new',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './templates/new.component.html',
    styleUrls: ['./templates/new.component.css'],
})
export class NewComponent implements OnInit {
    form!: FormGroup;
    submitError = '';
    successMessage = '';
    isSubmitting = false;
    generatedIsbn = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly api: BuchApiService,
        private readonly router: Router,
        private readonly cdr: ChangeDetectorRef,
    ) {}

    ngOnInit(): void {
        // Generiere automatisch eine gültige ISBN
        this.generatedIsbn = this.generateValidIsbn13();

        this.form = this.fb.group({
            titel: ['', [Validators.required, Validators.maxLength(40)]],
            untertitel: ['', [Validators.maxLength(40)]],
            // ISBN wird automatisch generiert, nicht vom Benutzer eingegeben
            rating: [
                0,
                [Validators.required, Validators.min(0), Validators.max(5)],
            ],
            art: [''],
            preis: [0, [Validators.required, Validators.min(0)]],
            rabatt: [0, [Validators.min(0), Validators.max(1)]],
            lieferbar: [false],
            datum: [''],
            homepage: ['', [Validators.pattern(/^https?:\/\/.+/)]],
            schlagwoerter: [''],
            beschreibung: ['', [Validators.maxLength(1000)]],
            autor: ['', [Validators.maxLength(100)]],
            autorBiographie: ['', [Validators.maxLength(1000)]],
        });
    }

    onSubmit(): void {
        this.form.markAllAsTouched();
        this.submitError = '';

        if (this.form.invalid) {
            // Sammle alle Validierungsfehler
            const errors: string[] = [];

            if (this.form.get('titel')?.errors) {
                if (this.form.get('titel')?.errors?.['required']) {
                    errors.push('Titel ist erforderlich');
                }
                if (this.form.get('titel')?.errors?.['maxlength']) {
                    errors.push('Titel darf maximal 40 Zeichen lang sein');
                }
            }

            if (this.form.get('rating')?.errors) {
                if (this.form.get('rating')?.errors?.['required']) {
                    errors.push('Rating ist erforderlich');
                }
                if (this.form.get('rating')?.errors?.['min']) {
                    errors.push('Rating muss mindestens 0 sein');
                }
                if (this.form.get('rating')?.errors?.['max']) {
                    errors.push('Rating darf maximal 5 sein');
                }
            }

            if (this.form.get('preis')?.errors) {
                if (this.form.get('preis')?.errors?.['required']) {
                    errors.push('Preis ist erforderlich');
                }
                if (this.form.get('preis')?.errors?.['min']) {
                    errors.push('Preis muss positiv sein (mindestens 0)');
                }
            }

            if (this.form.get('homepage')?.errors?.['pattern']) {
                errors.push(
                    'Homepage muss eine gültige URL sein (http:// oder https://)',
                );
            }

            this.submitError =
                errors.length > 0
                    ? 'Folgende Fehler müssen behoben werden:\n• ' +
                      errors.join('\n• ')
                    : 'Bitte füllen Sie alle erforderlichen Felder korrekt aus.';

            window.scrollTo({ top: 0, behavior: 'smooth' });
            this.cdr.detectChanges();
            return;
        }

        this.isSubmitting = true;
        this.submitError = '';
        this.successMessage = '';

        const payload = this.buildPayload(this.form.value);
        this.submitPayload(payload);
    }

    private buildPayload(formValue: any): CreateBuchPayload {
        const schlagwoerterArray = this.parseSchlagwoerter(
            formValue.schlagwoerter,
        );

        return {
            isbn: this.generatedIsbn, // Automatisch generierte ISBN verwenden
            rating: Number(formValue.rating),
            art: this.getOptionalValue(formValue.art) as
                | 'EPUB'
                | 'HARDCOVER'
                | 'PAPERBACK'
                | undefined,
            preis: Number(formValue.preis),
            rabatt:
                formValue.rabatt && formValue.rabatt > 0
                    ? Number(formValue.rabatt)
                    : undefined,
            lieferbar: formValue.lieferbar || false,
            datum: formValue.datum || undefined,
            homepage: this.getOptionalValue(formValue.homepage),
            schlagwoerter:
                schlagwoerterArray.length > 0 ? schlagwoerterArray : undefined,
            beschreibung: this.getOptionalValue(formValue.beschreibung),
            autor: this.getOptionalValue(formValue.autor),
            autorBiographie: this.getOptionalValue(formValue.autorBiographie),
            titel: {
                titel: formValue.titel,
                untertitel: this.getOptionalValue(formValue.untertitel),
            },
        };
    }

    private parseSchlagwoerter(schlagwoerter: string): string[] {
        if (!schlagwoerter) {
            return [];
        }
        return schlagwoerter
            .split(',')
            .map((s: string) => s.trim().toUpperCase())
            .filter((s: string) => s.length > 0);
    }

    private getOptionalValue(value: string | undefined): string | undefined {
        return value && value !== '' ? value : undefined;
    }

    private submitPayload(payload: CreateBuchPayload): void {
        this.api.create(payload).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.successMessage = 'Buch wurde erfolgreich angelegt!';
                this.cdr.detectChanges();
                setTimeout(() => {
                    this.router.navigate(['/search']);
                }, 2000);
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('Fehler beim Anlegen:', err);

                // Extrahiere Fehlermeldung
                let errorMessage =
                    'Beim Anlegen des Buches ist ein Fehler aufgetreten.';

                if (err.message) {
                    errorMessage = err.message;
                }

                // Prüfe auf ISBN-Duplikat und generiere neue ISBN
                if (
                    errorMessage.includes('existiert bereits') ||
                    errorMessage.includes('ISBN')
                ) {
                    this.generatedIsbn = this.generateValidIsbn13();
                    errorMessage +=
                        ' Eine neue ISBN wurde automatisch generiert. Bitte versuchen Sie es erneut.';
                }

                this.submitError = errorMessage;

                // Scroll nach oben, damit der Fehler sichtbar ist
                window.scrollTo({ top: 0, behavior: 'smooth' });
                this.cdr.detectChanges();
            },
        });
    }

    closeError(): void {
        this.submitError = '';
    }

    formatErrorHtml(): string {
        return this.submitError.replaceAll('\n', '<br>');
    }

    onCancel(): void {
        this.router.navigate(['/search']);
    }

    /**
     * Generiert eine neue gültige ISBN-13
     */
    regenerateIsbn(): void {
        this.generatedIsbn = this.generateValidIsbn13();
    }

    /**
     * Generiert eine gültige ISBN-13 mit korrekter Prüfziffer
     * Format: 978-X-XXXXX-XXX-C (wobei C die Prüfziffer ist)
     */
    private generateValidIsbn13(): string {
        // ISBN-13 beginnt mit 978 oder 979
        const prefix = '978';

        // Generiere 9 zufällige Ziffern
        const randomDigits = Array.from({ length: 9 }, () =>
            Math.floor(Math.random() * 10),
        ).join('');

        // Kombiniere Prefix mit zufälligen Ziffern (12 Ziffern)
        const isbnWithoutCheck = prefix + randomDigits;

        // Berechne Prüfziffer
        const checkDigit = this.calculateIsbn13CheckDigit(isbnWithoutCheck);

        // Vollständige ISBN-13 (13 Ziffern)
        return isbnWithoutCheck + checkDigit;
    }

    /**
     * Berechnet die Prüfziffer für ISBN-13
     * Die Prüfziffer wird so berechnet, dass die Summe aller Ziffern
     * (abwechselnd mit Gewicht 1 und 3 multipliziert) durch 10 teilbar ist
     */
    private calculateIsbn13CheckDigit(isbn12: string): string {
        let sum = 0;
        for (let i = 0; i < 12; i++) {
            const digit = Number.parseInt(isbn12[i], 10);
            // Ungerade Position (0, 2, 4, ...) -> Gewicht 1
            // Gerade Position (1, 3, 5, ...) -> Gewicht 3
            sum += digit * (i % 2 === 0 ? 1 : 3);
        }
        const remainder = sum % 10;
        const checkDigit = remainder === 0 ? 0 : 10 - remainder;
        return checkDigit.toString();
    }
}

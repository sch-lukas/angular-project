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
    template: `
        <div class="new-book-container">
            <h1>Neues Buch anlegen</h1>

            <!-- Fehler-Popup (Modal-Style) -->
            <div
                *ngIf="submitError"
                class="error-popup-overlay"
                (click)="closeError()"
            >
                <div class="error-popup" (click)="$event.stopPropagation()">
                    <div class="error-popup-header">
                        <span class="error-icon">⚠️</span>
                        <strong>Fehler beim Anlegen</strong>
                        <button class="close-btn" (click)="closeError()">
                            ×
                        </button>
                    </div>
                    <div
                        class="error-popup-body"
                        [innerHTML]="formatErrorHtml()"
                    ></div>
                    <div class="error-popup-footer">
                        <button class="btn btn-primary" (click)="closeError()">
                            Verstanden
                        </button>
                    </div>
                </div>
            </div>

            <!-- Erfolgs-Popup -->
            <div *ngIf="successMessage" class="success-popup-overlay">
                <div class="success-popup">
                    <div class="success-popup-header">
                        <span class="success-icon">✅</span>
                        <strong>Erfolg!</strong>
                    </div>
                    <div class="success-popup-body">
                        {{ successMessage }}
                    </div>
                </div>
            </div>

            <!-- Inline-Fehleranzeige (zusätzlich oben auf der Seite) -->
            <div *ngIf="submitError" class="alert alert-error">
                <strong>⚠️ Fehler:</strong>
                <span [innerHTML]="formatErrorHtml()"></span>
            </div>

            <!-- Erfolgs-Meldung -->
            <div *ngIf="successMessage" class="alert alert-success">
                ✅ {{ successMessage }}
            </div>

            <form [formGroup]="form" (ngSubmit)="onSubmit()" class="book-form">
                <!-- Titel -->
                <div class="form-group">
                    <label for="titel">Titel *</label>
                    <input
                        id="titel"
                        type="text"
                        formControlName="titel"
                        class="form-control"
                        [class.is-invalid]="
                            form.get('titel')?.invalid &&
                            form.get('titel')?.touched
                        "
                    />
                    <div
                        *ngIf="
                            form.get('titel')?.invalid &&
                            form.get('titel')?.touched
                        "
                        class="error-message"
                    >
                        <span *ngIf="form.get('titel')?.errors?.['required']"
                            >Titel ist erforderlich</span
                        >
                        <span *ngIf="form.get('titel')?.errors?.['maxlength']"
                            >Titel darf maximal 40 Zeichen lang sein</span
                        >
                    </div>
                </div>

                <!-- Untertitel -->
                <div class="form-group">
                    <label for="untertitel">Untertitel</label>
                    <input
                        id="untertitel"
                        type="text"
                        formControlName="untertitel"
                        class="form-control"
                        [class.is-invalid]="
                            form.get('untertitel')?.invalid &&
                            form.get('untertitel')?.touched
                        "
                    />
                    <div
                        *ngIf="
                            form.get('untertitel')?.invalid &&
                            form.get('untertitel')?.touched
                        "
                        class="error-message"
                    >
                        <span
                            *ngIf="
                                form.get('untertitel')?.errors?.['maxlength']
                            "
                            >Untertitel darf maximal 40 Zeichen lang sein</span
                        >
                    </div>
                </div>

                <!-- ISBN (automatisch generiert) -->
                <div class="form-group">
                    <label>ISBN-13 (automatisch generiert)</label>
                    <div class="isbn-display">
                        <span class="isbn-value">{{ generatedIsbn }}</span>
                        <button
                            type="button"
                            class="btn-regenerate"
                            (click)="regenerateIsbn()"
                            title="Neue ISBN generieren"
                        >
                            🔄 Neu
                        </button>
                    </div>
                    <small class="hint-text"
                        >Die ISBN wird automatisch generiert und ist
                        gültig.</small
                    >
                </div>

                <!-- Rating -->
                <div class="form-group">
                    <label for="rating">Rating (0-5)</label>
                    <input
                        id="rating"
                        type="number"
                        formControlName="rating"
                        class="form-control"
                        min="0"
                        max="5"
                        [class.is-invalid]="
                            form.get('rating')?.invalid &&
                            form.get('rating')?.touched
                        "
                    />
                    <div
                        *ngIf="
                            form.get('rating')?.invalid &&
                            form.get('rating')?.touched
                        "
                        class="error-message"
                    >
                        <span *ngIf="form.get('rating')?.errors?.['required']"
                            >Rating ist erforderlich</span
                        >
                        <span *ngIf="form.get('rating')?.errors?.['min']"
                            >Rating muss mindestens 0 sein</span
                        >
                        <span *ngIf="form.get('rating')?.errors?.['max']"
                            >Rating darf maximal 5 sein</span
                        >
                    </div>
                </div>

                <!-- Art -->
                <div class="form-group">
                    <label for="art">Buchart</label>
                    <select id="art" formControlName="art" class="form-control">
                        <option value="">-- Bitte wählen --</option>
                        <option value="EPUB">E-Book (EPUB)</option>
                        <option value="HARDCOVER">Hardcover</option>
                        <option value="PAPERBACK">Paperback</option>
                    </select>
                </div>

                <!-- Preis -->
                <div class="form-group">
                    <label for="preis">Preis (€) *</label>
                    <input
                        id="preis"
                        type="number"
                        formControlName="preis"
                        class="form-control"
                        step="0.01"
                        min="0"
                        [class.is-invalid]="
                            form.get('preis')?.invalid &&
                            form.get('preis')?.touched
                        "
                    />
                    <div
                        *ngIf="
                            form.get('preis')?.invalid &&
                            form.get('preis')?.touched
                        "
                        class="error-message"
                    >
                        <span *ngIf="form.get('preis')?.errors?.['required']"
                            >Preis ist erforderlich</span
                        >
                        <span *ngIf="form.get('preis')?.errors?.['min']"
                            >Preis muss positiv sein</span
                        >
                    </div>
                </div>

                <!-- Rabatt -->
                <div class="form-group">
                    <label for="rabatt">Rabatt (0-1)</label>
                    <input
                        id="rabatt"
                        type="number"
                        formControlName="rabatt"
                        class="form-control"
                        step="0.01"
                        min="0"
                        max="1"
                        placeholder="z.B. 0.1 für 10%"
                        [class.is-invalid]="
                            form.get('rabatt')?.invalid &&
                            form.get('rabatt')?.touched
                        "
                    />
                    <div
                        *ngIf="
                            form.get('rabatt')?.invalid &&
                            form.get('rabatt')?.touched
                        "
                        class="error-message"
                    >
                        <span *ngIf="form.get('rabatt')?.errors?.['min']"
                            >Rabatt muss mindestens 0 sein</span
                        >
                        <span *ngIf="form.get('rabatt')?.errors?.['max']"
                            >Rabatt darf maximal 1 sein</span
                        >
                    </div>
                </div>

                <!-- Lieferbar -->
                <div class="form-group form-checkbox">
                    <label>
                        <input type="checkbox" formControlName="lieferbar" />
                        Lieferbar
                    </label>
                </div>

                <!-- Datum -->
                <div class="form-group">
                    <label for="datum">Erscheinungsdatum</label>
                    <input
                        id="datum"
                        type="date"
                        formControlName="datum"
                        class="form-control"
                    />
                </div>

                <!-- Homepage -->
                <div class="form-group">
                    <label for="homepage">Homepage</label>
                    <input
                        id="homepage"
                        type="url"
                        formControlName="homepage"
                        class="form-control"
                        placeholder="https://example.com"
                        [class.is-invalid]="
                            form.get('homepage')?.invalid &&
                            form.get('homepage')?.touched
                        "
                    />
                    <div
                        *ngIf="
                            form.get('homepage')?.invalid &&
                            form.get('homepage')?.touched
                        "
                        class="error-message"
                    >
                        <span *ngIf="form.get('homepage')?.errors?.['pattern']"
                            >Ungültige URL (muss mit http:// oder https://
                            beginnen)</span
                        >
                    </div>
                </div>

                <!-- Schlagwörter -->
                <div class="form-group">
                    <label for="schlagwoerter">Schlagwörter</label>
                    <input
                        id="schlagwoerter"
                        type="text"
                        formControlName="schlagwoerter"
                        class="form-control"
                        placeholder="z.B. JAVASCRIPT, TYPESCRIPT (kommagetrennt)"
                    />
                    <small class="form-text"
                        >Mehrere Wörter mit Komma trennen</small
                    >
                </div>

                <!-- Beschreibung -->
                <div class="form-group">
                    <label for="beschreibung">Beschreibung</label>
                    <textarea
                        id="beschreibung"
                        formControlName="beschreibung"
                        class="form-control"
                        rows="4"
                        placeholder="Eine kurze Beschreibung des Buches..."
                        [class.is-invalid]="
                            form.get('beschreibung')?.invalid &&
                            form.get('beschreibung')?.touched
                        "
                    ></textarea>
                    <div
                        *ngIf="
                            form.get('beschreibung')?.invalid &&
                            form.get('beschreibung')?.touched
                        "
                        class="error-message"
                    >
                        <span
                            *ngIf="
                                form.get('beschreibung')?.errors?.['maxlength']
                            "
                            >Beschreibung darf maximal 1000 Zeichen lang
                            sein</span
                        >
                    </div>
                </div>

                <!-- Autor -->
                <div class="form-group">
                    <label for="autor">Autor</label>
                    <input
                        id="autor"
                        type="text"
                        formControlName="autor"
                        class="form-control"
                        placeholder="Name des Autors"
                        [class.is-invalid]="
                            form.get('autor')?.invalid &&
                            form.get('autor')?.touched
                        "
                    />
                    <div
                        *ngIf="
                            form.get('autor')?.invalid &&
                            form.get('autor')?.touched
                        "
                        class="error-message"
                    >
                        <span *ngIf="form.get('autor')?.errors?.['maxlength']"
                            >Autor darf maximal 100 Zeichen lang sein</span
                        >
                    </div>
                </div>

                <!-- Autor Biographie -->
                <div class="form-group">
                    <label for="autorBiographie">Autor-Biographie</label>
                    <textarea
                        id="autorBiographie"
                        formControlName="autorBiographie"
                        class="form-control"
                        rows="3"
                        placeholder="Informationen über den Autor..."
                        [class.is-invalid]="
                            form.get('autorBiographie')?.invalid &&
                            form.get('autorBiographie')?.touched
                        "
                    ></textarea>
                    <div
                        *ngIf="
                            form.get('autorBiographie')?.invalid &&
                            form.get('autorBiographie')?.touched
                        "
                        class="error-message"
                    >
                        <span
                            *ngIf="
                                form.get('autorBiographie')?.errors?.[
                                    'maxlength'
                                ]
                            "
                            >Biographie darf maximal 1000 Zeichen lang
                            sein</span
                        >
                    </div>
                </div>

                <!-- Buttons -->
                <div class="form-actions">
                    <button
                        type="submit"
                        class="btn btn-primary"
                        [disabled]="isSubmitting"
                    >
                        {{ isSubmitting ? 'Wird gespeichert...' : 'Speichern' }}
                    </button>
                    <button
                        type="button"
                        class="btn btn-secondary"
                        (click)="onCancel()"
                        [disabled]="isSubmitting"
                    >
                        Abbrechen
                    </button>
                </div>
            </form>
        </div>
    `,
    styles: [
        `
            .new-book-container {
                max-width: 800px;
                margin: 2rem auto;
                padding: 2rem;
            }

            h1 {
                margin-bottom: 2rem;
                color: #2c3e50;
            }

            :host-context(.theme-dark) h1 {
                color: #ecf0f1;
            }

            .alert {
                padding: 1rem;
                margin-bottom: 1.5rem;
                border-radius: 4px;
            }

            .alert-error {
                background: #fee;
                color: #c33;
                border: 1px solid #fcc;
            }

            :host-context(.theme-dark) .alert-error {
                background: #4a2222;
                color: #ffaaaa;
                border: 1px solid #663333;
            }

            .alert-success {
                background: #efe;
                color: #3c3;
                border: 1px solid #cfc;
            }

            :host-context(.theme-dark) .alert-success {
                background: #224422;
                color: #aaffaa;
                border: 1px solid #336633;
            }

            /* Error Popup Overlay */
            .error-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.2s ease-out;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }

            .error-popup {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
                overflow: hidden;
            }

            :host-context(.theme-dark) .error-popup {
                background: #2d3748;
            }

            @keyframes slideIn {
                from {
                    transform: translateY(-50px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }

            .error-popup-header {
                background: #e74c3c;
                color: white;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .error-icon {
                font-size: 1.5rem;
            }

            .close-btn {
                margin-left: auto;
                background: transparent;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }

            .close-btn:hover {
                opacity: 0.8;
            }

            .error-popup-body {
                padding: 1.5rem;
                color: #333;
                font-size: 1.1rem;
                line-height: 1.6;
            }

            :host-context(.theme-dark) .error-popup-body {
                color: #e2e8f0;
            }

            .error-popup-footer {
                padding: 1rem 1.5rem;
                background: #f8f9fa;
                display: flex;
                justify-content: flex-end;
            }

            :host-context(.theme-dark) .error-popup-footer {
                background: #1a202c;
            }

            /* Success Popup */
            .success-popup-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
                animation: fadeIn 0.2s ease-out;
            }

            .success-popup {
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                max-width: 400px;
                width: 90%;
                animation: slideIn 0.3s ease-out;
                overflow: hidden;
            }

            :host-context(.theme-dark) .success-popup {
                background: #2d3748;
            }

            .success-popup-header {
                background: #27ae60;
                color: white;
                padding: 1rem 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.75rem;
                font-size: 1.1rem;
            }

            .success-icon {
                font-size: 1.5rem;
            }

            .success-popup-body {
                padding: 1.5rem;
                color: #333;
                font-size: 1.1rem;
                text-align: center;
            }

            :host-context(.theme-dark) .success-popup-body {
                color: #e2e8f0;
            }

            .book-form {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            :host-context(.theme-dark) .book-form {
                background: #3a4a5c;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            }

            .form-group {
                margin-bottom: 1.5rem;
            }

            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #555;
            }

            :host-context(.theme-dark) .form-group label {
                color: #bdc3c7;
            }

            .form-control {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;
                transition: border-color 0.3s;
                background: white;
                color: #2c3e50;
            }

            textarea.form-control {
                resize: vertical;
                min-height: 100px;
                font-family: inherit;
                line-height: 1.5;
            }

            :host-context(.theme-dark) .form-control {
                background: #445566;
                border-color: #556677;
                color: #ecf0f1;
            }

            :host-context(.theme-dark) .form-control::placeholder {
                color: #7f8c8d;
            }

            .form-control:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }

            .form-control.is-invalid {
                border-color: #e74c3c;
            }

            .error-message {
                color: #e74c3c;
                font-size: 0.875rem;
                margin-top: 0.5rem;
            }

            .form-text {
                display: block;
                margin-top: 0.5rem;
                font-size: 0.875rem;
                color: #777;
            }

            :host-context(.theme-dark) .form-text {
                color: #95a5a6;
            }

            .form-checkbox label {
                display: flex;
                align-items: center;
                font-weight: normal;
            }

            :host-context(.theme-dark) .form-checkbox label {
                color: #bdc3c7;
            }

            .form-checkbox input[type='checkbox'] {
                width: auto;
                margin-right: 0.5rem;
            }

            .form-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }

            .btn {
                padding: 0.75rem 2rem;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .btn-primary {
                background: #3498db;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #2980b9;
            }

            .btn-secondary {
                background: #95a5a6;
                color: white;
            }

            .btn-secondary:hover:not(:disabled) {
                background: #7f8c8d;
            }

            /* ISBN Display Styles */
            .isbn-display {
                display: flex;
                align-items: center;
                gap: 1rem;
                padding: 0.75rem;
                background: #f8f9fa;
                border: 2px solid #3498db;
                border-radius: 4px;
                font-family: 'Courier New', monospace;
            }

            :host-context(.theme-dark) .isbn-display {
                background: #2d3238;
                border-color: #5dade2;
            }

            .isbn-value {
                font-size: 1.1rem;
                font-weight: bold;
                color: #2c3e50;
                letter-spacing: 1px;
            }

            :host-context(.theme-dark) .isbn-value {
                color: #ecf0f1;
            }

            .btn-regenerate {
                padding: 0.4rem 0.8rem;
                background: #27ae60;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.85rem;
                transition: background 0.3s;
            }

            .btn-regenerate:hover {
                background: #219a52;
            }

            .hint-text {
                display: block;
                margin-top: 0.5rem;
                color: #7f8c8d;
                font-size: 0.85rem;
            }

            :host-context(.theme-dark) .hint-text {
                color: #95a5a6;
            }
        `,
    ],
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
        return this.submitError.replace(/\n/g, '<br>');
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

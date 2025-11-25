import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BuchApiService, BuchItem } from './buch-api.service';

@Component({
    selector: 'app-search',
    standalone: true,
    imports: [CommonModule, NgFor, NgIf, FormsModule],
    template: `
        <div style="max-width: 1000px; margin: 0 auto;">
            <h1>Suche</h1>

            <!-- Suchformular -->
            <div
                style="border: 1px solid #ccc; padding: 16px; margin-bottom: 20px; border-radius: 4px;"
            >
                <h2 style="margin-top: 0;">Suchkriterien</h2>

                <div style="margin-bottom: 12px;">
                    <label
                        for="suchtext"
                        style="display: block; margin-bottom: 4px; font-weight: 600;"
                    >
                        Suchtext (Titel oder ISBN):
                    </label>
                    <input
                        id="suchtext"
                        type="text"
                        [(ngModel)]="formData.suchtext"
                        placeholder="z.B. TypeScript oder 978-3..."
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
                    />
                </div>

                <div style="margin-bottom: 12px;">
                    <label
                        for="ratingFilter"
                        style="display: block; margin-bottom: 4px; font-weight: 600;"
                    >
                        Bewertung (Rating):
                    </label>
                    <select
                        id="ratingFilter"
                        [(ngModel)]="formData.ratingFilter"
                        style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box;"
                    >
                        <option value="">– Alle –</option>
                        <option value="1">≥ 1 Stern</option>
                        <option value="3">≥ 3 Sterne</option>
                        <option value="5">≥ 5 Sterne</option>
                    </select>
                </div>

                <div style="margin-bottom: 12px;">
                    <label
                        style="display: block; margin-bottom: 4px; font-weight: 600;"
                        >Sortierung:</label
                    >
                    <div>
                        <label style="margin-right: 20px;">
                            <input
                                type="radio"
                                name="sortierung"
                                [(ngModel)]="formData.sortierung"
                                value="asc"
                            />
                            ID aufsteigend
                        </label>
                        <label>
                            <input
                                type="radio"
                                name="sortierung"
                                [(ngModel)]="formData.sortierung"
                                value="desc"
                            />
                            ID absteigend
                        </label>
                    </div>
                </div>

                <div style="margin-bottom: 16px;">
                    <label>
                        <input
                            type="checkbox"
                            [(ngModel)]="formData.nurMitRating"
                        />
                        Nur Bücher mit gesetztem Rating anzeigen
                    </label>
                </div>

                <button
                    (click)="onSearch()"
                    style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;"
                >
                    Suchen
                </button>
            </div>

            <!-- Fehleranzeige -->
            <div
                *ngIf="error"
                style="color: white; background-color: crimson; padding: 12px; margin-bottom: 12px; border-radius: 4px; font-weight: 600;"
            >
                ⚠ Fehler beim Laden der Daten: {{ error }}
            </div>

            <!-- Ladezustand -->
            <div *ngIf="isLoading" style="color: #666; font-style: italic;">
                Lädt...
            </div>

            <!-- Ergebnisse -->
            <div *ngIf="!isLoading && items !== null">
                <h2>Ergebnisse ({{ items.length || 0 }} Einträge)</h2>

                <table
                    *ngIf="items && items.length > 0"
                    style="width: 100%; border-collapse: collapse; margin-top: 12px;"
                >
                    <thead>
                        <tr
                            style="background-color: #f5f5f5; border-bottom: 2px solid #ddd;"
                        >
                            <th
                                style="text-align: left; padding: 8px; border-right: 1px solid #ddd;"
                            >
                                ID
                            </th>
                            <th style="text-align: left; padding: 8px;">
                                Titel / ISBN
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            *ngFor="let b of items; let odd = odd"
                            [style.background-color]="odd ? 'white' : '#f9f9f9'"
                        >
                            <td
                                style="padding: 8px; border-right: 1px solid #ddd; border-bottom: 1px solid #eee;"
                            >
                                {{ b.id }}
                            </td>
                            <td
                                style="padding: 8px; border-bottom: 1px solid #eee;"
                            >
                                {{ b.titel?.titel || b.isbn || '–' }}
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div
                    *ngIf="items && items.length === 0"
                    style="color: #666; padding: 12px; background-color: #f9f9f9; border-radius: 4px;"
                >
                    Keine Einträge gefunden.
                </div>
            </div>
        </div>
    `,
})
export class SearchComponent implements OnInit {
    items: BuchItem[] | null = null;
    error: string | null = null;
    isLoading = false;

    formData = {
        suchtext: '',
        ratingFilter: '',
        sortierung: 'asc',
        nurMitRating: false,
    };

    constructor(private readonly api: BuchApiService) {}

    ngOnInit(): void {
        // Initial laden - mit Fehlerbehandlung
        try {
            this.onSearch();
        } catch (err) {
            this.error = `Fehler beim Initialisieren: ${err instanceof Error ? err.message : String(err)}`;
            this.isLoading = false;
        }
    }

    onSearch(): void {
        this.isLoading = true;
        this.error = null;
        this.items = null;
        try {
            // Backend bietet keine Filter-API -> lade alle Daten und filtere clientseitig
            this.api.list().subscribe({
                next: (data) => {
                    let filtered = data;

                    // Suchtext filter (Titel oder ISBN) - case-insensitive
                    const q = (this.formData.suchtext || '')
                        .trim()
                        .toLowerCase();
                    if (q.length > 0) {
                        filtered = filtered.filter((b) => {
                            const titel = b.titel?.titel ?? '';
                            const isbn = b.isbn ?? '';
                            return (
                                titel.toLowerCase().includes(q) ||
                                isbn.toLowerCase().includes(q)
                            );
                        });
                    }

                    // nurMitRating: nur Einträge mit gesetztem Rating
                    if (this.formData.nurMitRating) {
                        filtered = filtered.filter(
                            (b) => b.rating !== undefined && b.rating !== null,
                        );
                    }

                    // ratingFilter: mindestwert
                    if (this.formData.ratingFilter) {
                        const min =
                            Number.parseInt(this.formData.ratingFilter, 10) ||
                            0;
                        filtered = filtered.filter(
                            (b) => (b.rating ?? 0) >= min,
                        );
                    }

                    // Sortierung nach ID
                    if (this.formData.sortierung === 'asc') {
                        filtered.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
                    } else {
                        filtered.sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
                    }

                    this.items = filtered;
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('API-Fehler:', err);
                    const errMsg =
                        err?.error?.message ||
                        err?.message ||
                        String(err) ||
                        'Unbekannter Fehler beim Laden der Daten';
                    this.error = errMsg;
                    this.items = [];
                    this.isLoading = false;
                },
            });
        } catch (err) {
            this.error = `Fehler bei der Suche: ${err instanceof Error ? err.message : String(err)}`;
            this.items = [];
            this.isLoading = false;
        }
    }
}

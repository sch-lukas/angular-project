import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbAlert } from '@ng-bootstrap/ng-bootstrap';
import { BuchApiService, type BuchItem } from './buch-api.service';

@Component({
    selector: 'app-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, NgbAlert],
    template: `
        <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
            <!-- Zurück-Button -->
            <div style="margin-bottom: 20px;">
                <a
                    routerLink="/search"
                    style="display: inline-flex; align-items: center; padding: 8px 16px; background-color: #6c757d; color: white; text-decoration: none; border-radius: 4px; font-weight: 600;"
                >
                    <span style="margin-right: 8px;">←</span> Zurück zur Suche
                </a>
            </div>

            <!-- Ladezustand -->
            <div
                *ngIf="isLoading"
                class="d-flex justify-content-center my-5"
                style="padding: 40px 0;"
            >
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Lädt...</span>
                </div>
            </div>

            <!-- Fehleranzeige -->
            <ngb-alert
                *ngIf="error"
                type="danger"
                [dismissible]="true"
                (closed)="error = null"
            >
                <strong>Fehler!</strong> {{ error }}
            </ngb-alert>

            <!-- Buch-Details -->
            <div *ngIf="buch && !isLoading" class="card">
                <!-- Card Header mit Titel und Rating -->
                <div
                    class="card-header"
                    style="background-color: #f8f9fa; border-bottom: 2px solid #dee2e6;"
                >
                    <div
                        style="display: flex; justify-content: space-between; align-items: start;"
                    >
                        <div>
                            <h2 style="margin: 0; color: #212529;">
                                {{ buch.titel?.titel || '–' }}
                            </h2>
                            <p
                                *ngIf="buch.titel?.untertitel"
                                style="margin: 8px 0 0 0; color: #6c757d; font-size: 1.1rem;"
                            >
                                {{ buch.titel?.untertitel }}
                            </p>
                        </div>
                        <div
                            style="display: flex; gap: 8px; align-items: center;"
                        >
                            <span
                                *ngIf="buch.rating"
                                class="badge"
                                [ngClass]="{
                                    'bg-success': buch.rating >= 4,
                                    'bg-warning': buch.rating === 3,
                                    'bg-secondary': buch.rating < 3,
                                }"
                                style="font-size: 1rem; padding: 8px 12px;"
                            >
                                ⭐ {{ buch.rating }} / 5
                            </span>
                            <span
                                *ngIf="isSchwabenpreis()"
                                class="badge bg-danger"
                                style="font-size: 0.9rem; padding: 6px 10px;"
                                title="Preis unter 20 EUR mit hohem Rabatt"
                            >
                                💰 Schwabenpreis
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Card Body mit Details -->
                <div class="card-body" style="padding: 24px;">
                    <dl class="row mb-0">
                        <dt class="col-sm-3" style="font-weight: 600;">ID</dt>
                        <dd class="col-sm-9">{{ buch.id || '–' }}</dd>

                        <dt class="col-sm-3" style="font-weight: 600;">ISBN</dt>
                        <dd class="col-sm-9">{{ buch.isbn || '–' }}</dd>

                        <dt class="col-sm-3" style="font-weight: 600;">
                            Preis
                        </dt>
                        <dd class="col-sm-9">
                            <strong style="font-size: 1.2rem; color: #28a745;">
                                {{
                                    buch.preis != null
                                        ? (buch.preis
                                          | currency
                                              : 'EUR'
                                              : 'symbol'
                                              : '1.2-2')
                                        : '–'
                                }}
                            </strong>
                            <span
                                *ngIf="buch.rabatt && buch.rabatt > 0"
                                style="margin-left: 12px; color: #dc3545; font-weight: 600;"
                            >
                                (Rabatt:
                                {{ buch.rabatt * 100 | number: '1.0-1' }}%)
                            </span>
                        </dd>

                        <dt class="col-sm-3" style="font-weight: 600;">Art</dt>
                        <dd class="col-sm-9">
                            <span
                                *ngIf="buch.art"
                                class="badge"
                                [ngClass]="{
                                    'bg-info': buch.art === 'EPUB',
                                    'bg-primary': buch.art === 'HARDCOVER',
                                    'bg-secondary': buch.art === 'PAPERBACK',
                                }"
                            >
                                {{ buch.art }}
                            </span>
                            <span *ngIf="!buch.art">–</span>
                        </dd>

                        <dt class="col-sm-3" style="font-weight: 600;">
                            Lieferbar
                        </dt>
                        <dd class="col-sm-9">
                            <span
                                class="badge"
                                [ngClass]="{
                                    'bg-success': buch.lieferbar === true,
                                    'bg-danger': buch.lieferbar === false,
                                }"
                            >
                                {{ buch.lieferbar ? '✓ Ja' : '✗ Nein' }}
                            </span>
                        </dd>

                        <dt class="col-sm-3" style="font-weight: 600;">
                            Erscheinungsdatum
                        </dt>
                        <dd class="col-sm-9">
                            {{
                                buch.datum
                                    ? (buch.datum | date: 'dd.MM.yyyy')
                                    : '–'
                            }}
                        </dd>

                        <dt class="col-sm-3" style="font-weight: 600;">
                            Homepage
                        </dt>
                        <dd class="col-sm-9">
                            <a
                                *ngIf="buch.homepage"
                                [href]="buch.homepage"
                                target="_blank"
                                rel="noopener noreferrer"
                                style="color: #007bff; text-decoration: none;"
                            >
                                {{ buch.homepage }}
                                <span style="font-size: 0.8rem;">↗</span>
                            </a>
                            <span *ngIf="!buch.homepage">–</span>
                        </dd>

                        <dt class="col-sm-3" style="font-weight: 600;">
                            Schlagwörter
                        </dt>
                        <dd class="col-sm-9">
                            <span
                                *ngIf="
                                    buch.schlagwoerter &&
                                    buch.schlagwoerter.length > 0
                                "
                            >
                                <span
                                    *ngFor="let s of buch.schlagwoerter"
                                    class="badge bg-light text-dark"
                                    style="margin-right: 6px; margin-bottom: 4px; border: 1px solid #dee2e6;"
                                >
                                    {{ s }}
                                </span>
                            </span>
                            <span
                                *ngIf="
                                    !buch.schlagwoerter ||
                                    buch.schlagwoerter.length === 0
                                "
                                >–</span
                            >
                        </dd>

                        <dt class="col-sm-3" style="font-weight: 600;">
                            Erstellt
                        </dt>
                        <dd class="col-sm-9">
                            {{
                                buch.erzeugt
                                    ? (buch.erzeugt | date: 'dd.MM.yyyy HH:mm')
                                    : '–'
                            }}
                        </dd>

                        <dt class="col-sm-3" style="font-weight: 600;">
                            Zuletzt aktualisiert
                        </dt>
                        <dd class="col-sm-9">
                            {{
                                buch.aktualisiert
                                    ? (buch.aktualisiert
                                      | date: 'dd.MM.yyyy HH:mm')
                                    : '–'
                            }}
                        </dd>

                        <dt
                            *ngIf="
                                buch.abbildungen && buch.abbildungen.length > 0
                            "
                            class="col-sm-3"
                            style="font-weight: 600;"
                        >
                            Abbildungen
                        </dt>
                        <dd
                            *ngIf="
                                buch.abbildungen && buch.abbildungen.length > 0
                            "
                            class="col-sm-9"
                        >
                            <ul style="margin: 0; padding-left: 20px;">
                                <li *ngFor="let abb of buch.abbildungen">
                                    {{
                                        abb.beschriftung || 'Ohne Beschriftung'
                                    }}
                                    <span
                                        *ngIf="abb.contentType"
                                        style="color: #6c757d; font-size: 0.9rem;"
                                    >
                                        ({{ abb.contentType }})
                                    </span>
                                </li>
                            </ul>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .card {
                border: 1px solid #dee2e6;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }

            dl.row dt {
                padding: 8px 0;
            }

            dl.row dd {
                padding: 8px 0;
                border-bottom: 1px solid #f1f1f1;
            }

            dl.row dd:last-child {
                border-bottom: none;
            }

            .spinner-border {
                width: 3rem;
                height: 3rem;
            }
        `,
    ],
})
export class DetailComponent implements OnInit {
    buch: BuchItem | null = null;
    isLoading = true;
    error: string | null = null;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly api: BuchApiService,
    ) {}

    ngOnInit(): void {
        this.route.paramMap.subscribe((params) => {
            const idStr = params.get('id');
            if (!idStr) {
                this.error = 'Keine ID angegeben';
                this.isLoading = false;
                return;
            }

            const id = Number.parseInt(idStr, 10);
            if (Number.isNaN(id) || id <= 0) {
                this.error = `Ungültige ID: ${idStr}`;
                this.isLoading = false;
                return;
            }

            this.loadBuch(id);
        });
    }

    private loadBuch(id: number): void {
        this.isLoading = true;
        this.error = null;
        this.buch = null;

        this.api.getById(id).subscribe({
            next: (buch) => {
                console.log('Buch geladen:', buch);
                this.buch = buch;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Fehler beim Laden des Buchs:', err);
                const errMsg =
                    err?.error?.message ||
                    err?.message ||
                    'Das Buch konnte nicht geladen werden';
                this.error = `Fehler beim Laden des Buchs (ID ${id}): ${errMsg}`;
                this.isLoading = false;
            },
        });
    }

    /**
     * Prüft, ob das Buch ein "Schwabenpreis" ist (günstig mit hohem Rabatt)
     */
    isSchwabenpreis(): boolean {
        if (!this.buch?.preis || !this.buch?.rabatt) {
            return false;
        }
        return this.buch.preis < 20 && this.buch.rabatt >= 0.1;
    }
}

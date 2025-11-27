import { CommonModule } from '@angular/common';
import {
    Component,
    OnInit,
    TemplateRef,
    ViewChild,
    inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
    NgbAlert,
    NgbCarouselModule,
    NgbModal,
} from '@ng-bootstrap/ng-bootstrap';
import { BuchApiService, type BuchItem } from './buch-api.service';

@Component({
    selector: 'app-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, NgbAlert, NgbCarouselModule],
    template: `
        <div class="container py-4" style="max-width: 1200px;">
            <!-- Zurück-Button -->
            <div class="mb-4">
                <a
                    routerLink="/search"
                    class="btn btn-secondary"
                    style="display: inline-flex; align-items: center; gap: 8px;"
                >
                    <span>←</span> Zurück zur Suche
                </a>
            </div>

            <!-- Ladezustand -->
            <div
                *ngIf="isLoading"
                class="d-flex justify-content-center my-5"
                style="padding: 80px 0;"
            >
                <div
                    class="spinner-border text-primary"
                    role="status"
                    style="width: 4rem; height: 4rem;"
                >
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
                <strong>⚠ Fehler!</strong> {{ error }}
            </ngb-alert>

            <!-- Produktseite (Shop-Layout) -->
            <div *ngIf="buch && !isLoading" class="product-card card shadow">
                <!-- Hero Header mit Titel und Rating -->
                <div class="card-header hero-header">
                    <div
                        class="d-flex justify-content-between align-items-start flex-wrap gap-3"
                    >
                        <div class="flex-grow-1">
                            <h1 class="product-title mb-2">
                                {{ buch.titel?.titel || '–' }}
                            </h1>
                            <p
                                *ngIf="buch.titel?.untertitel"
                                class="product-subtitle mb-0"
                            >
                                {{ buch.titel?.untertitel }}
                            </p>
                        </div>
                        <div class="d-flex gap-2 align-items-center">
                            <span
                                *ngIf="buch.rating"
                                class="badge rating-badge"
                                [ngClass]="{
                                    'bg-success': buch.rating >= 4,
                                    'bg-warning text-dark': buch.rating === 3,
                                    'bg-secondary': buch.rating < 3,
                                }"
                            >
                                ⭐ {{ buch.rating }} / 5
                            </span>
                            <span
                                *ngIf="isSchwabenpreis()"
                                class="badge bg-danger"
                                style="font-size: 0.95rem;"
                                title="Preis unter 20 EUR mit hohem Rabatt"
                            >
                                💰 Schnäppchen
                            </span>
                        </div>
                    </div>
                </div>

                <!-- Main Content: Cover + Kaufinfos -->
                <div class="card-body p-4">
                    <div class="row g-4">
                        <!-- Linke Spalte: Cover-Bild -->
                        <div class="col-md-4 col-lg-3">
                            <div class="cover-container">
                                <img
                                    [src]="
                                        getCoverUrl() ||
                                        'https://via.placeholder.com/240x340?text=Buch+Cover'
                                    "
                                    [alt]="buch.titel?.titel || 'Buch Cover'"
                                    class="img-fluid rounded shadow-sm cover-image"
                                />
                            </div>
                        </div>

                        <!-- Rechte Spalte: Kaufinfos + CTA -->
                        <div class="col-md-8 col-lg-9">
                            <!-- Preis und Rabatt prominent -->
                            <div class="price-section mb-4">
                                <div class="d-flex align-items-baseline gap-3">
                                    <span class="product-price">
                                        {{
                                            buch.preis != null
                                                ? (buch.preis
                                                  | currency
                                                      : 'EUR'
                                                      : 'symbol'
                                                      : '1.2-2')
                                                : '–'
                                        }}
                                    </span>
                                    <span
                                        *ngIf="buch.rabatt && buch.rabatt > 0"
                                        class="badge bg-danger rabatt-badge"
                                    >
                                        -{{
                                            buch.rabatt * 100 | number: '1.0-1'
                                        }}% Rabatt
                                    </span>
                                </div>
                                <p class="text-muted small mb-0 mt-1">
                                    inkl. MwSt. zzgl. Versandkosten
                                </p>
                            </div>

                            <!-- Lieferbarkeit -->
                            <div class="availability-section mb-4">
                                <span
                                    class="badge lieferbar-badge"
                                    [ngClass]="{
                                        'bg-success': buch.lieferbar === true,
                                        'bg-secondary':
                                            buch.lieferbar === false,
                                    }"
                                >
                                    {{
                                        buch.lieferbar
                                            ? '✓ Sofort lieferbar'
                                            : '⊗ Nicht lieferbar'
                                    }}
                                </span>
                                <span
                                    *ngIf="buch.art"
                                    class="badge ms-2"
                                    [ngClass]="{
                                        'bg-info text-dark':
                                            buch.art === 'EPUB',
                                        'bg-primary': buch.art === 'HARDCOVER',
                                        'bg-secondary':
                                            buch.art === 'PAPERBACK',
                                    }"
                                >
                                    {{ buch.art }}
                                </span>
                            </div>

                            <!-- Call-to-Action Buttons -->
                            <div class="cta-section mb-4">
                                <div class="d-grid gap-2 d-md-flex">
                                    <button
                                        class="btn btn-success btn-lg flex-grow-1"
                                        style="max-width: 300px;"
                                        [disabled]="!buch.lieferbar"
                                    >
                                        🛒 In den Warenkorb
                                    </button>
                                    <button
                                        class="btn btn-outline-primary btn-lg"
                                    >
                                        ❤ Merken
                                    </button>
                                </div>
                            </div>

                            <!-- Kurz-Infos -->
                            <div class="quick-info">
                                <h5 class="mb-3">Produktdetails</h5>
                                <ul class="list-unstyled">
                                    <li class="mb-2">
                                        <strong>ISBN:</strong>
                                        {{ buch.isbn || '–' }}
                                    </li>
                                    <li class="mb-2">
                                        <strong>Erschienen:</strong>
                                        {{
                                            buch.datum
                                                ? (buch.datum
                                                  | date: 'dd.MM.yyyy')
                                                : '–'
                                        }}
                                    </li>
                                    <li
                                        *ngIf="
                                            buch.schlagwoerter &&
                                            buch.schlagwoerter.length > 0
                                        "
                                        class="mb-2"
                                    >
                                        <strong>Themen:</strong>
                                        <div class="mt-1">
                                            <span
                                                *ngFor="
                                                    let s of buch.schlagwoerter
                                                "
                                                class="badge bg-light text-dark me-1 mb-1"
                                                style="border: 1px solid #dee2e6;"
                                            >
                                                {{ s }}
                                            </span>
                                        </div>
                                    </li>
                                    <li *ngIf="buch.homepage" class="mb-2">
                                        <strong>Website:</strong>
                                        <button
                                            class="btn btn-link btn-sm p-0 ms-2"
                                            (click)="openHomepageWarning()"
                                            style="vertical-align: baseline;"
                                        >
                                            {{ buch.homepage }}
                                            <span style="font-size: 0.8rem;"
                                                >↗</span
                                            >
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <!-- Zusätzliche technische Details (zweispaltig) -->
                    <hr class="my-4" />
                    <h5 class="mb-3">Weitere Informationen</h5>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <dl class="row mb-0 small">
                                <dt class="col-sm-5 text-muted">Buch-ID</dt>
                                <dd class="col-sm-7">{{ buch.id || '–' }}</dd>

                                <dt class="col-sm-5 text-muted">Version</dt>
                                <dd class="col-sm-7">
                                    {{ buch.version ?? '–' }}
                                </dd>

                                <dt class="col-sm-5 text-muted">Erstellt am</dt>
                                <dd class="col-sm-7">
                                    {{
                                        buch.erzeugt
                                            ? (buch.erzeugt
                                              | date: 'dd.MM.yyyy HH:mm')
                                            : '–'
                                    }}
                                </dd>
                            </dl>
                        </div>
                        <div class="col-md-6">
                            <dl class="row mb-0 small">
                                <dt class="col-sm-5 text-muted">
                                    Aktualisiert am
                                </dt>
                                <dd class="col-sm-7">
                                    {{
                                        buch.aktualisiert
                                            ? (buch.aktualisiert
                                              | date: 'dd.MM.yyyy HH:mm')
                                            : '–'
                                    }}
                                </dd>

                                <dt
                                    *ngIf="
                                        buch.abbildungen &&
                                        buch.abbildungen.length > 0
                                    "
                                    class="col-sm-5 text-muted"
                                >
                                    Abbildungen
                                </dt>
                                <dd
                                    *ngIf="
                                        buch.abbildungen &&
                                        buch.abbildungen.length > 0
                                    "
                                    class="col-sm-7"
                                >
                                    {{ buch.abbildungen.length }} Datei(en)
                                </dd>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Template für Homepage-Warnung -->
        <ng-template #homepageWarningModal let-modal>
            <div class="modal-header">
                <h5 class="modal-title">⚠ Externe Website</h5>
                <button
                    type="button"
                    class="btn-close"
                    aria-label="Schließen"
                    (click)="modal.dismiss()"
                ></button>
            </div>
            <div class="modal-body">
                <p class="mb-3">
                    Sie verlassen jetzt die Buch-SPA und werden auf eine externe
                    Website weitergeleitet:
                </p>
                <div
                    class="alert alert-info mb-0"
                    style="word-break: break-all;"
                >
                    <strong>{{ buch?.homepage }}</strong>
                </div>
            </div>
            <div class="modal-footer">
                <button
                    type="button"
                    class="btn btn-secondary"
                    (click)="modal.dismiss()"
                >
                    Abbrechen
                </button>
                <button
                    type="button"
                    class="btn btn-primary"
                    (click)="modal.close('confirm')"
                >
                    Trotzdem öffnen
                </button>
            </div>
        </ng-template>

        <!-- Empfehlungen / Ähnliche Bücher -->
        <div
            *ngIf="buch"
            class="container py-4"
            style="max-width: 1200px; margin-top: 40px;"
        >
            <hr class="mb-4" />
            <h3 class="mb-4">
                <span style="margin-right: 8px;">💡</span>
                Das könnte Ihnen auch gefallen
            </h3>

            <!-- Lade-Spinner -->
            <div *ngIf="relatedLoading" class="text-center py-5">
                <div
                    class="spinner-border text-primary"
                    role="status"
                    style="width: 2rem; height: 2rem;"
                >
                    <span class="visually-hidden">Lädt Empfehlungen...</span>
                </div>
                <p class="text-muted mt-2">Lädt Empfehlungen...</p>
            </div>

            <!-- Fehler -->
            <ngb-alert
                *ngIf="relatedError && !relatedLoading"
                type="warning"
                [dismissible]="true"
                (closed)="relatedError = null"
            >
                {{ relatedError }}
            </ngb-alert>

            <!-- Karussell mit Empfehlungen -->
            <div *ngIf="related.length > 0 && !relatedLoading">
                <ngb-carousel
                    [interval]="0"
                    [showNavigationArrows]="related.length > 3"
                    [showNavigationIndicators]="related.length > 3"
                >
                    <!-- Jedes Slide zeigt 3 Bücher -->
                    <ng-template
                        ngbSlide
                        *ngFor="
                            let chunk of getChunks(related, 3);
                            let i = index
                        "
                    >
                        <div class="row g-3">
                            <div *ngFor="let buch of chunk" class="col-md-4">
                                <div
                                    class="card h-100 shadow-sm recommendation-card"
                                >
                                    <div class="card-body d-flex flex-column">
                                        <!-- Mini-Cover -->
                                        <div class="text-center mb-3">
                                            <img
                                                [src]="
                                                    'https://via.placeholder.com/120x170?text=Cover'
                                                "
                                                [alt]="
                                                    buch.titel?.titel ||
                                                    'Buch Cover'
                                                "
                                                class="img-fluid rounded"
                                                style="max-height: 170px;"
                                            />
                                        </div>

                                        <!-- Titel -->
                                        <h6
                                            class="card-title mb-2"
                                            style="min-height: 2.5rem; font-weight: 600;"
                                        >
                                            {{ buch.titel?.titel || '–' }}
                                        </h6>

                                        <!-- Preis + Rating -->
                                        <div class="mb-2">
                                            <span
                                                class="fw-bold text-success"
                                                style="font-size: 1.2rem;"
                                            >
                                                {{
                                                    buch.preis != null
                                                        ? (buch.preis
                                                          | currency
                                                              : 'EUR'
                                                              : 'symbol'
                                                              : '1.2-2')
                                                        : '–'
                                                }}
                                            </span>
                                            <span
                                                *ngIf="buch.rating"
                                                class="badge bg-warning text-dark ms-2"
                                            >
                                                ⭐ {{ buch.rating }}
                                            </span>
                                        </div>

                                        <!-- Art Badge -->
                                        <div class="mb-auto">
                                            <span
                                                *ngIf="buch.art"
                                                class="badge"
                                                [ngClass]="{
                                                    'bg-info text-dark':
                                                        buch.art === 'EPUB',
                                                    'bg-primary':
                                                        buch.art ===
                                                        'HARDCOVER',
                                                    'bg-secondary':
                                                        buch.art ===
                                                        'PAPERBACK',
                                                }"
                                                style="font-size: 0.75rem;"
                                            >
                                                {{ buch.art }}
                                            </span>
                                        </div>

                                        <!-- Details Button -->
                                        <div class="mt-3">
                                            <a
                                                [routerLink]="[
                                                    '/detail',
                                                    buch.id,
                                                ]"
                                                class="btn btn-outline-primary btn-sm w-100"
                                            >
                                                Details ansehen
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ng-template>
                </ngb-carousel>
            </div>

            <!-- Keine Empfehlungen -->
            <div
                *ngIf="related.length === 0 && !relatedLoading && !relatedError"
                class="text-center py-4 text-muted"
            >
                <p class="mb-0">
                    <em>Keine weiteren Empfehlungen verfügbar.</em>
                </p>
            </div>
        </div>
    `,
    styles: [
        `
            /* Produkt-Card Styling */
            .product-card {
                border: 1px solid #dee2e6;
                border-radius: 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                overflow: hidden;
            }

            /* Hero Header */
            .hero-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 3px solid #dee2e6;
                padding: 1.5rem 1.5rem;
            }

            .product-title {
                font-size: 2rem;
                font-weight: 700;
                color: #212529;
                margin: 0;
            }

            .product-subtitle {
                font-size: 1.25rem;
                color: #6c757d;
                font-weight: 400;
            }

            .rating-badge {
                font-size: 1.1rem;
                padding: 0.5rem 0.75rem;
                font-weight: 600;
            }

            /* Cover Image */
            .cover-container {
                position: sticky;
                top: 20px;
            }

            .cover-image {
                width: 100%;
                max-width: 300px;
                height: auto;
                border: 1px solid #e9ecef;
                transition: transform 0.2s ease;
            }

            .cover-image:hover {
                transform: scale(1.02);
            }

            /* Preis-Sektion */
            .price-section {
                padding: 1rem;
                background-color: #f8f9fa;
                border-radius: 8px;
            }

            .product-price {
                font-size: 2.5rem;
                font-weight: 700;
                color: #28a745;
            }

            .rabatt-badge {
                font-size: 1rem;
                padding: 0.4rem 0.6rem;
                font-weight: 600;
            }

            /* Lieferbarkeit */
            .availability-section {
                padding: 0.75rem 0;
            }

            .lieferbar-badge {
                font-size: 1.1rem;
                padding: 0.5rem 1rem;
                font-weight: 600;
            }

            /* Call-to-Action */
            .cta-section .btn {
                font-weight: 600;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .cta-section .btn:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
            }

            /* Quick Info */
            .quick-info {
                padding: 1rem;
                background-color: #f8f9fa;
                border-radius: 8px;
            }

            .quick-info h5 {
                font-size: 1.1rem;
                font-weight: 600;
                color: #495057;
            }

            /* Responsive Anpassungen */
            @media (max-width: 768px) {
                .product-title {
                    font-size: 1.5rem;
                }

                .product-price {
                    font-size: 2rem;
                }

                .cover-container {
                    text-align: center;
                }

                .cover-image {
                    max-width: 200px;
                }
            }

            /* Details-Tabellen */
            dl.row dt {
                font-weight: 600;
            }

            dl.row dd {
                color: #495057;
            }

            /* Empfehlungen / Karussell */
            .recommendation-card {
                transition:
                    transform 0.2s ease,
                    box-shadow 0.2s ease;
                border: 1px solid #e9ecef;
            }

            .recommendation-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12) !important;
            }

            .recommendation-card .card-body {
                padding: 1.25rem;
            }

            .recommendation-card h6 {
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }

            /* Karussell Navigation */
            ::ng-deep .carousel-control-prev,
            ::ng-deep .carousel-control-next {
                width: 5%;
                opacity: 0.8;
            }

            ::ng-deep .carousel-control-prev:hover,
            ::ng-deep .carousel-control-next:hover {
                opacity: 1;
            }
        `,
    ],
})
export class DetailComponent implements OnInit {
    buch: BuchItem | null = null;
    isLoading = true;
    error: string | null = null;

    // Empfehlungen / ähnliche Bücher
    related: BuchItem[] = [];
    relatedLoading = false;
    relatedError: string | null = null;

    @ViewChild('homepageWarningModal')
    homepageWarningModal!: TemplateRef<any>;

    private readonly modalService = inject(NgbModal);

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
                // Nach erfolgreichem Laden: Empfehlungen laden
                this.loadRelated(id, buch.art);
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
     * Lädt ähnliche Bücher für Empfehlungen
     */
    private loadRelated(
        currentId: number,
        art?: 'EPUB' | 'HARDCOVER' | 'PAPERBACK',
    ): void {
        this.relatedLoading = true;
        this.relatedError = null;
        this.related = [];

        this.api.getRelated(currentId, art, 10).subscribe({
            next: (buecher) => {
                console.log('Ähnliche Bücher geladen:', buecher);
                this.related = buecher;
                this.relatedLoading = false;
            },
            error: (err) => {
                console.error('Fehler beim Laden ähnlicher Bücher:', err);
                this.relatedError =
                    'Empfehlungen konnten nicht geladen werden.';
                this.relatedLoading = false;
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

    /**
     * Gibt die Cover-URL zurück (Platzhalter für zukünftige Implementierung)
     */
    getCoverUrl(): string | null {
        // In Zukunft könnte hier eine echte Cover-URL kommen, z.B.:
        // return `/api/buch/${this.buch?.id}/cover`;
        // oder aus buch.coverUrl
        return null;
    }

    /**
     * Teilt ein Array in Chunks der angegebenen Größe auf
     * (für Carousel-Slides mit mehreren Items pro Slide)
     */
    getChunks<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }

    /**
     * Öffnet Modal mit Warnung vor externem Link zur Homepage
     */
    openHomepageWarning(): void {
        if (!this.buch?.homepage || !this.homepageWarningModal) {
            return;
        }

        const modalRef = this.modalService.open(this.homepageWarningModal, {
            centered: true,
            backdrop: 'static',
            size: 'md',
        });

        modalRef.result
            .then((result) => {
                if (result === 'confirm' && this.buch?.homepage) {
                    // Benutzer hat bestätigt → öffne externe Seite in neuem Tab
                    window.open(
                        this.buch.homepage,
                        '_blank',
                        'noopener,noreferrer',
                    );
                }
            })
            .catch(() => {
                // Modal wurde geschlossen (X oder Abbrechen) → nichts tun
            });
    }
}

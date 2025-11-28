import { CommonModule } from '@angular/common';
import {
    Component,
    ElementRef,
    OnInit,
    TemplateRef,
    ViewChild,
    inject,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BuchApiService, type BuchItem } from './buch-api.service';
import { CartService } from './cart/cart.service';
import { WishlistService } from './wishlist/wishlist.service';

@Component({
    selector: 'app-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, NgbAlert],
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
                <!-- Titel und Rating über allem -->
                <div class="card-header bg-white border-bottom">
                    <h1 class="product-title mb-2">
                        {{ buch.titel?.titel || '–' }}
                    </h1>
                    <p
                        *ngIf="buch.titel?.untertitel"
                        class="product-subtitle mb-2 text-muted"
                    >
                        {{ buch.titel?.untertitel }}
                    </p>
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

                <!-- Main Content: Cover links + Infos rechts -->
                <div class="card-body p-4">
                    <div class="row g-4">
                        <!-- Linke Spalte: Cover-Bild -->
                        <div class="col-12 col-lg-4">
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
                        <div class="col-12 col-lg-8">
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
                                <!-- Success Alert -->
                                <ngb-alert
                                    *ngIf="addToCartSuccess"
                                    type="success"
                                    [dismissible]="false"
                                    class="mb-3"
                                    style="animation: slideIn 0.3s ease-out;"
                                >
                                    ✅ Buch wurde zum Warenkorb hinzugefügt!
                                    <a
                                        routerLink="/cart"
                                        class="alert-link ms-2"
                                        >Zum Warenkorb →</a
                                    >
                                </ngb-alert>

                                <!-- Wishlist Success Alert -->
                                <ngb-alert
                                    *ngIf="addToWishlistSuccess"
                                    type="info"
                                    [dismissible]="false"
                                    class="mb-3"
                                    style="animation: slideIn 0.3s ease-out;"
                                >
                                    ✅ Zur Merkliste hinzugefügt!
                                    <a
                                        routerLink="/wishlist"
                                        class="alert-link ms-2"
                                        >Zur Merkliste →</a
                                    >
                                </ngb-alert>

                                <div class="d-grid gap-2 d-md-flex">
                                    <button
                                        class="btn btn-success btn-lg flex-grow-1"
                                        style="max-width: 300px;"
                                        [disabled]="!buch.lieferbar"
                                        (click)="addToCart()"
                                    >
                                        🛒 In den Warenkorb
                                    </button>
                                    <button
                                        type="button"
                                        class="btn btn-lg"
                                        [ngClass]="
                                            isInWishlist()
                                                ? 'btn-danger'
                                                : 'btn-outline-secondary'
                                        "
                                        (click)="onToggleWishlist()"
                                    >
                                        {{
                                            isInWishlist()
                                                ? '❤️ Gemerkt'
                                                : '🤍 Merken'
                                        }}
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

        <!-- Buchbeschreibung -->
        <div
            *ngIf="buch"
            class="container py-4"
            style="max-width: 1200px; margin-top: 40px;"
        >
            <div class="description-section" *ngIf="buch?.beschreibung">
                <div class="section-header">
                    <h4 class="section-title">📖 Über dieses Buch</h4>
                </div>
                <div class="section-content">
                    <p class="description-text">{{ buch?.beschreibung }}</p>
                </div>
            </div>

            <!-- Autorenbeschreibung -->
            <div
                class="author-section"
                *ngIf="buch?.autor || buch?.autorBiographie"
            >
                <div class="section-header">
                    <h4 class="section-title">✍️ Über den Autor</h4>
                </div>
                <div class="section-content">
                    <h5 class="author-name" *ngIf="buch?.autor">
                        {{ buch?.autor }}
                    </h5>
                    <p class="author-bio" *ngIf="buch?.autorBiographie">
                        {{ buch?.autorBiographie }}
                    </p>
                </div>
            </div>
        </div>

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

            <!-- Karussell mit Empfehlungen (Amazon-Style Horizontal Scroll) -->
            <div
                *ngIf="related.length > 0 && !relatedLoading"
                class="carousel-wrapper"
            >
                <!-- Linker Pfeil -->
                <button
                    class="carousel-arrow carousel-arrow-left"
                    (click)="scrollCarousel('left')"
                    *ngIf="related.length > 5"
                >
                    ‹
                </button>

                <!-- Scroll Container -->
                <div class="carousel-scroll-container" #carouselContainer>
                    <div class="carousel-items">
                        <div
                            *ngFor="let buch of related"
                            class="carousel-item-card"
                        >
                            <a
                                [routerLink]="['/detail', buch.id]"
                                class="item-link"
                            >
                                <!-- Cover -->
                                <div class="item-image">
                                    <img
                                        [src]="getRelatedCoverUrl(buch)"
                                        [alt]="
                                            buch.titel?.titel || 'Buch Cover'
                                        "
                                        onerror="this.src='https://via.placeholder.com/180x260?text=Kein+Cover'"
                                    />
                                </div>

                                <!-- Titel -->
                                <h6 class="item-title">
                                    {{ buch.titel?.titel || '–' }}
                                </h6>

                                <!-- Rating -->
                                <div class="item-rating" *ngIf="buch.rating">
                                    <span class="rating-stars">
                                        <span
                                            *ngFor="let star of [1, 2, 3, 4, 5]"
                                            [class.filled]="star <= buch.rating"
                                            >★</span
                                        >
                                    </span>
                                    <span class="rating-value">{{
                                        buch.rating
                                    }}</span>
                                </div>

                                <!-- Preis -->
                                <div class="item-price">
                                    <span class="price-amount">
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
                                        class="price-discount"
                                    >
                                        -{{
                                            buch.rabatt * 100 | number: '1.0-0'
                                        }}%
                                    </span>
                                </div>

                                <!-- Lieferbar -->
                                <div
                                    class="item-delivery"
                                    *ngIf="buch.lieferbar"
                                >
                                    <span class="badge bg-success"
                                        >✓ Lieferbar</span
                                    >
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                <!-- Rechter Pfeil -->
                <button
                    class="carousel-arrow carousel-arrow-right"
                    (click)="scrollCarousel('right')"
                    *ngIf="related.length > 5"
                >
                    ›
                </button>
            </div>

            <!-- Keine Empfehlungen -->
            <div
                *ngIf="related.length === 0 && !relatedLoading && !relatedError"
                class="alert alert-info text-center"
                role="alert"
            >
                <h5 class="alert-heading">
                    📚 Keine ähnlichen Bücher gefunden
                </h5>
                <p class="mb-0">
                    Leider haben wir aktuell keine weiteren Bücher in der
                    Kategorie "{{ buch?.art }}" gefunden.
                </p>
                <hr />
                <p class="mb-0 small text-muted">
                    Hinweis: Überprüfe die Browser-Console (F12) für Details
                </p>
            </div>
        </div>

        <!-- Produktdetails und weitere Informationen -->
        <div
            *ngIf="buch"
            class="container py-4"
            style="max-width: 1200px; margin-top: 20px;"
        >
            <div class="product-card shadow">
                <div class="card-body p-4">
                    <!-- Produktdetails -->
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
                                    ? (buch.datum | date: 'dd.MM.yyyy')
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
                                    *ngFor="let s of buch.schlagwoerter"
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
                                <span style="font-size: 0.8rem;">↗</span>
                            </button>
                        </li>
                    </ul>

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

            :host-context(.theme-dark) .product-card {
                border-color: #374151;
                background: #1f2937;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            /* Card Header (Titel-Bereich) */
            .card-header {
                background: white;
                border-bottom: 1px solid #dee2e6;
            }

            :host-context(.theme-dark) .card-header {
                background: #1f2937 !important;
                border-bottom-color: #4b5563;
            }

            /* Hero Header */
            .hero-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 3px solid #dee2e6;
                padding: 1.5rem 1.5rem;
            }

            :host-context(.theme-dark) .hero-header {
                background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
                border-bottom-color: #4b5563;
            }

            .product-title {
                font-size: 2rem;
                font-weight: 700;
                color: #212529;
                margin: 0;
            }

            :host-context(.theme-dark) .product-title {
                color: #f3f4f6;
            }

            .product-subtitle {
                font-size: 1.25rem;
                color: #6c757d;
                font-weight: 400;
            }

            :host-context(.theme-dark) .product-subtitle {
                color: #d1d5db;
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

            /* Success Alert Animation */
            @keyframes slideIn {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Preis-Sektion */
            .price-section {
                padding: 1rem;
                background-color: #f8f9fa;
                border-radius: 8px;
            }

            :host-context(.theme-dark) .price-section {
                background-color: #374151;
            }

            .product-price {
                font-size: 2.5rem;
                font-weight: 700;
                color: #28a745;
            }

            :host-context(.theme-dark) .product-price {
                color: #34d399;
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

            :host-context(.theme-dark) .quick-info {
                background-color: #374151;
            }

            .quick-info h5 {
                font-size: 1.1rem;
                font-weight: 600;
                color: #495057;
            }

            :host-context(.theme-dark) .quick-info h5 {
                color: #f3f4f6;
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

            :host-context(.theme-dark) dl.row dt {
                color: #f3f4f6;
            }

            dl.row dd {
                color: #495057;
            }

            :host-context(.theme-dark) dl.row dd {
                color: #d1d5db;
            }

            /* Horizontal Scroll Karussell */
            .carousel-wrapper {
                position: relative;
                padding: 20px 0;
                margin: 0 -12px;
            }

            .carousel-scroll-container {
                overflow-x: auto;
                overflow-y: hidden;
                scroll-behavior: smooth;
                scrollbar-width: thin;
                scrollbar-color: #888 #f1f1f1;
                padding: 0 50px;
            }

            .carousel-scroll-container::-webkit-scrollbar {
                height: 8px;
            }

            .carousel-scroll-container::-webkit-scrollbar-track {
                background: #f1f1f1;
                border-radius: 4px;
            }

            .carousel-scroll-container::-webkit-scrollbar-thumb {
                background: #888;
                border-radius: 4px;
            }

            .carousel-scroll-container::-webkit-scrollbar-thumb:hover {
                background: #555;
            }

            .carousel-items {
                display: flex;
                gap: 16px;
                padding: 10px 0;
            }

            .carousel-item-card {
                flex: 0 0 auto;
                width: 200px;
            }

            @media (min-width: 1400px) {
                .carousel-item-card {
                    width: 220px;
                }
            }

            .carousel-arrow {
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                z-index: 10;
                width: 45px;
                height: 100px;
                background: linear-gradient(
                    to right,
                    rgba(255, 255, 255, 0.9),
                    rgba(255, 255, 255, 0.7)
                );
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 36px;
                color: #111;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0;
            }

            .carousel-arrow:hover {
                background: rgba(255, 255, 255, 1);
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            }

            .carousel-arrow-left {
                left: 0;
            }

            .carousel-arrow-right {
                right: 0;
                background: linear-gradient(
                    to left,
                    rgba(255, 255, 255, 0.9),
                    rgba(255, 255, 255, 0.7)
                );
            }

            .item-link {
                text-decoration: none;
                color: inherit;
                display: flex;
                flex-direction: column;
                padding: 12px;
                border: 1px solid #e7e7e7;
                border-radius: 8px;
                background: #fff;
                transition: all 0.2s ease;
                height: 100%;
            }

            .item-link:hover {
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                transform: translateY(-2px);
                border-color: #ddd;
            }

            .item-image {
                width: 100%;
                margin-bottom: 12px;
                text-align: center;
            }

            .item-image img {
                width: 100%;
                max-width: 180px;
                height: auto;
                border-radius: 4px;
            }

            .item-title {
                font-size: 14px;
                font-weight: 400;
                color: #0f1111;
                margin: 0 0 8px 0;
                line-height: 1.4;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
                min-height: 40px;
            }

            .item-link:hover .item-title {
                color: #c45500;
            }

            .item-rating {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-bottom: 8px;
                font-size: 13px;
            }

            .rating-stars {
                color: #ffa41c;
                letter-spacing: 2px;
            }

            .rating-stars span {
                color: #ddd;
            }

            .rating-stars span.filled {
                color: #ffa41c;
            }

            .rating-value {
                color: #007185;
                font-size: 12px;
            }

            .item-price {
                margin-bottom: 8px;
            }

            .price-amount {
                font-size: 18px;
                font-weight: 700;
                color: #b12704;
            }

            .price-discount {
                font-size: 13px;
                color: #cc0c39;
                margin-left: 6px;
                font-weight: 600;
            }

            .item-delivery {
                margin-top: auto;
            }

            .item-delivery .badge {
                font-size: 11px;
                padding: 4px 8px;
                font-weight: 400;
            }

            /* Bootstrap Carousel Customization */
            .carousel {
                padding: 0;
            }

            .carousel-inner {
                padding: 20px 50px;
            }

            .carousel-item {
                transition: transform 0.6s ease-in-out;
            }

            .carousel-control-prev,
            .carousel-control-next {
                width: 50px;
                opacity: 0.9;
                z-index: 10;
            }

            .carousel-control-prev:hover,
            .carousel-control-next:hover {
                opacity: 1;
            }

            .carousel-control-prev-icon,
            .carousel-control-next-icon {
                background-color: rgba(0, 0, 0, 0.7);
                border-radius: 50%;
                padding: 25px;
                width: 50px;
                height: 50px;
            }

            .carousel-indicators {
                margin-bottom: -1rem;
                z-index: 10;
            }

            .carousel-indicators button {
                background-color: #6c757d;
                width: 12px;
                height: 12px;
                border-radius: 50%;
                opacity: 0.5;
            }

            .carousel-indicators button.active {
                background-color: #0d6efd;
                opacity: 1;
            }

            /* Stelle sicher dass row/col richtig funktioniert */
            .carousel-item .row {
                margin: 0;
            }

            .carousel-item .col-md-4 {
                padding: 0 10px;
            }

            /* Karussell Navigation (Legacy) */
            ::ng-deep .carousel-control-prev,
            ::ng-deep .carousel-control-next {
                width: 5%;
                opacity: 0.8;
            }

            ::ng-deep .carousel-control-prev:hover,
            ::ng-deep .carousel-control-next:hover {
                opacity: 1;
            }

            /* Beschreibungs- und Autorensektionen */
            .description-section,
            .author-section {
                background: white;
                border-radius: 12px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                margin: 2rem 0;
                overflow: hidden;
            }

            :host-context(.theme-dark) .description-section,
            :host-context(.theme-dark) .author-section {
                background: #1f2937;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }

            .section-header {
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
                border-bottom: 2px solid #dee2e6;
                padding: 1.25rem 1.5rem;
            }

            :host-context(.theme-dark) .section-header {
                background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
                border-bottom-color: #4b5563;
            }

            .section-title {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
                color: #212529;
            }

            :host-context(.theme-dark) .section-title {
                color: #f3f4f6;
            }

            .section-content {
                padding: 1.5rem;
            }

            .description-text {
                font-size: 1rem;
                line-height: 1.8;
                color: #495057;
                margin: 0;
                text-align: justify;
            }

            :host-context(.theme-dark) .description-text {
                color: #d1d5db;
            }

            .author-name {
                font-size: 1.25rem;
                font-weight: 600;
                color: #212529;
                margin-bottom: 1rem;
            }

            :host-context(.theme-dark) .author-name {
                color: #f3f4f6;
            }

            .author-bio {
                font-size: 1rem;
                line-height: 1.8;
                color: #495057;
                margin: 0;
                text-align: justify;
            }

            :host-context(.theme-dark) .author-bio {
                color: #d1d5db;
            }

            /* Responsive Anpassungen */
            @media (max-width: 768px) {
                .section-header {
                    padding: 1rem;
                }

                .section-title {
                    font-size: 1.25rem;
                }

                .section-content {
                    padding: 1rem;
                }

                .description-text,
                .author-bio {
                    font-size: 0.95rem;
                    text-align: left;
                }
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

    // Warenkorb-Status
    addToCartSuccess = false;

    // Merkliste-Status
    addToWishlistSuccess = false;

    @ViewChild('homepageWarningModal')
    homepageWarningModal!: TemplateRef<any>;

    @ViewChild('carouselContainer')
    carouselContainer!: ElementRef<HTMLDivElement>;

    private readonly modalService = inject(NgbModal);
    private readonly cartService = inject(CartService);
    private readonly wishlistService = inject(WishlistService);

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

            // Reset state für endless loop
            this.buch = null;
            this.isLoading = true;
            this.error = null;
            this.related = [];
            this.relatedLoading = false;
            this.relatedError = null;

            // Scroll nach oben bei Navigation
            window.scrollTo({ top: 0, behavior: 'smooth' });

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
        console.log('🔍 loadRelated aufgerufen:', { currentId, art });
        this.relatedLoading = true;
        this.relatedError = null;
        this.related = [];

        // Lade ähnliche Bücher von der API
        this.api.getRelated(currentId, art, 8).subscribe({
            next: (books) => {
                console.log('✅ Ähnliche Bücher geladen:', books);
                this.related = books;
                this.relatedLoading = false;

                // Fallback: Wenn keine ähnlichen Bücher gefunden wurden
                if (this.related.length === 0) {
                    console.log(
                        '⚠️ Keine ähnlichen Bücher gefunden, lade Dummy-Daten',
                    );
                    this.loadDummyRecommendations();
                }
            },
            error: (err) => {
                console.error('❌ Fehler beim Laden der Empfehlungen:', err);
                this.relatedError =
                    'Empfehlungen konnten nicht geladen werden.';
                this.relatedLoading = false;

                // Fallback: Zeige Dummy-Daten bei Fehler
                console.log('🎭 Fallback: Lade Dummy-Daten');
                this.loadDummyRecommendations();
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
     * Gibt die Cover-URL zurück
     */
    getCoverUrl(): string | null {
        if (!this.buch) return null;

        // 1. Prüfe ob abbildungen vorhanden sind
        if (this.buch.abbildungen && this.buch.abbildungen.length > 0) {
            const firstImage = this.buch.abbildungen[0];
            if (firstImage.pfad) {
                return firstImage.pfad;
            }
        }

        // 2. Fallback: SVG Cover aus assets
        if (this.buch.id) {
            return `/assets/covers/${this.buch.id}.svg`;
        }

        return null;
    }

    /**
     * Gibt die Cover-URL für ein Buch im Karussell zurück
     */
    getRelatedCoverUrl(buch: BuchItem): string {
        // 1. Prüfe ob abbildungen vorhanden sind
        if (buch.abbildungen && buch.abbildungen.length > 0) {
            const firstImage = buch.abbildungen[0];
            if (firstImage.pfad) {
                return firstImage.pfad;
            }
        }

        // 2. Fallback: SVG Cover aus assets
        if (buch.id) {
            return `/assets/covers/${buch.id}.svg`;
        }

        // 3. Final Fallback: Platzhalter
        return `https://via.placeholder.com/180x260?text=Kein+Cover`;
    }

    /**
     * Lädt Dummy-Empfehlungen zum Testen des Karussells
     * (nur für Development - aktiviere dies in loadRelated error handler)
     */
    private loadDummyRecommendations(): void {
        console.log('🎭 Lade Dummy-Empfehlungen...');
        this.related = [
            {
                id: 999,
                isbn: '978-3-12345-678-9',
                rating: 4,
                art: this.buch?.art || 'HARDCOVER',
                preis: 24.99,
                rabatt: 0.1,
                lieferbar: true,
                titel: {
                    titel: 'TypeScript Kompakt',
                    untertitel: 'Moderne Entwicklung',
                },
            },
            {
                id: 998,
                isbn: '978-3-12345-679-0',
                rating: 5,
                art: this.buch?.art || 'HARDCOVER',
                preis: 29.99,
                rabatt: 0.15,
                lieferbar: true,
                titel: {
                    titel: 'Angular Best Practices',
                },
            },
            {
                id: 997,
                isbn: '978-3-12345-680-6',
                rating: 3,
                art: this.buch?.art || 'HARDCOVER',
                preis: 19.99,
                lieferbar: false,
                titel: {
                    titel: 'RxJS für Einsteiger',
                },
            },
            {
                id: 996,
                isbn: '978-3-12345-681-3',
                rating: 4,
                art: this.buch?.art || 'HARDCOVER',
                preis: 34.99,
                rabatt: 0.2,
                lieferbar: true,
                titel: {
                    titel: 'Web Development 2025',
                    untertitel: 'Der komplette Guide',
                },
            },
        ];
        console.log('✅ Dummy-Empfehlungen geladen:', this.related);
    }

    /**
     * Scrollt das Karussell nach links oder rechts
     */
    scrollCarousel(direction: 'left' | 'right'): void {
        if (!this.carouselContainer) return;

        const container = this.carouselContainer.nativeElement;
        const scrollAmount = 220 * 2; // 2 Items pro Klick (Item width + gap)

        if (direction === 'left') {
            container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
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

    /**
     * Fügt das aktuelle Buch zum Warenkorb hinzu
     */
    addToCart(): void {
        if (!this.buch) {
            console.error('Kein Buch zum Hinzufügen vorhanden');
            return;
        }

        if (!this.buch.lieferbar) {
            console.warn('Buch ist nicht lieferbar');
            return;
        }

        // Füge zum Warenkorb hinzu
        this.cartService.addItem(this.buch, 1);

        // Zeige Erfolgs-Nachricht
        this.addToCartSuccess = true;

        // Verstecke Nachricht nach 4 Sekunden
        setTimeout(() => {
            this.addToCartSuccess = false;
        }, 4000);

        console.log(
            '✅ Buch zum Warenkorb hinzugefügt:',
            this.buch.titel?.titel,
        );
    }

    /**
     * Prüft, ob das aktuelle Buch in der Merkliste ist
     */
    isInWishlist(): boolean {
        if (!this.buch?.id) {
            return false;
        }
        return this.wishlistService.isInWishlist(this.buch.id);
    }

    /**
     * Fügt das aktuelle Buch zur Merkliste hinzu oder entfernt es (Toggle)
     */
    onToggleWishlist(): void {
        if (!this.buch) {
            console.error('Kein Buch vorhanden');
            return;
        }

        const wasInWishlist = this.isInWishlist();

        // Toggle in Service
        this.wishlistService.toggleItem(this.buch);

        // Zeige Success-Nachricht nur beim Hinzufügen
        if (wasInWishlist) {
            console.log(
                '💔 Buch aus Merkliste entfernt:',
                this.buch.titel?.titel,
            );
        } else {
            this.addToWishlistSuccess = true;

            // Verstecke Nachricht nach 4 Sekunden
            setTimeout(() => {
                this.addToWishlistSuccess = false;
            }, 4000);

            console.log(
                '❤️ Buch zur Merkliste hinzugefügt:',
                this.buch.titel?.titel,
            );
        }
    }
}

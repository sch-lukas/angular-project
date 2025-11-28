import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    ActivatedRoute,
    convertToParamMap,
    provideRouter,
} from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BuchApiService, type BuchItem } from './buch-api.service';
import { DetailComponent } from './detail.component';

describe('DetailComponent', () => {
    let component: DetailComponent;
    let fixture: ComponentFixture<DetailComponent>;
    let mockBuchApiService: any;
    let mockActivatedRoute: any;
    let mockNgbModal: any;

    // Test-Daten
    const mockBuch: BuchItem = {
        id: 1,
        isbn: '978-3-89722-345-6',
        rating: 4,
        art: 'HARDCOVER',
        preis: 29.99,
        rabatt: 0.1,
        lieferbar: true,
        datum: '2024-01-15',
        homepage: 'https://example.com',
        schlagwoerter: ['TypeScript', 'Angular'],
        titel: {
            titel: 'Angular für Profis',
            untertitel: 'Best Practices und Patterns',
        },
        version: 1,
        erzeugt: '2024-01-01T10:00:00Z',
        aktualisiert: '2024-01-10T15:30:00Z',
        abbildungen: [
            {
                id: 1,
                beschriftung: 'Cover',
                contentType: 'image/jpeg',
            },
        ],
    };

    const mockRelatedBuecher: BuchItem[] = [
        {
            id: 2,
            isbn: '978-3-89722-346-7',
            rating: 3,
            art: 'HARDCOVER',
            preis: 24.99,
            rabatt: 0.05,
            lieferbar: true,
            titel: {
                titel: 'TypeScript Grundlagen',
            },
        },
        {
            id: 3,
            isbn: '978-3-89722-347-8',
            rating: 5,
            art: 'HARDCOVER',
            preis: 34.99,
            rabatt: 0.15,
            lieferbar: true,
            titel: {
                titel: 'Angular Testing',
            },
        },
        {
            id: 4,
            isbn: '978-3-89722-348-9',
            rating: 4,
            art: 'HARDCOVER',
            preis: 27.99,
            lieferbar: false,
            titel: {
                titel: 'RxJS in der Praxis',
            },
        },
        {
            id: 5,
            isbn: '978-3-89722-349-0',
            rating: 3,
            art: 'HARDCOVER',
            preis: 22.99,
            lieferbar: true,
            titel: {
                titel: 'Web Components',
            },
        },
    ];

    beforeEach(async () => {
        // Mock Services erstellen mit Vitest
        mockBuchApiService = {
            getById: vi.fn(),
            getRelated: vi.fn(),
        };

        mockNgbModal = {
            open: vi.fn(),
        };

        // Mock ActivatedRoute mit ParamMap
        mockActivatedRoute = {
            paramMap: of(convertToParamMap({ id: '1' })),
        };

        await TestBed.configureTestingModule({
            imports: [DetailComponent],
            providers: [
                provideRouter([]),
                { provide: BuchApiService, useValue: mockBuchApiService },
                { provide: ActivatedRoute, useValue: mockActivatedRoute },
                { provide: NgbModal, useValue: mockNgbModal },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(DetailComponent);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        fixture.destroy();
    });

    describe('Initialisierung und Laden', () => {
        it('sollte die Komponente erstellen', () => {
            expect(component).toBeTruthy();
        });

        it('sollte das Buch beim Initialisieren laden', async () => {
            mockBuchApiService.getById.mockReturnValue(of(mockBuch));
            mockBuchApiService.getRelated.mockReturnValue(
                of(mockRelatedBuecher),
            );

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(mockBuchApiService.getById).toHaveBeenCalledWith(1);
            expect(component.buch).toEqual(mockBuch);
            expect(component.isLoading).toBe(false);
            expect(component.error).toBeNull();
        });

        it('sollte eine Fehlermeldung anzeigen, wenn das Laden fehlschlägt', async () => {
            const errorResponse = {
                error: { message: 'Buch nicht gefunden' },
                message: 'HTTP Error',
            };
            mockBuchApiService.getById.mockReturnValue(
                throwError(() => errorResponse),
            );

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(component.error).toContain('Buch nicht gefunden');
            expect(component.isLoading).toBe(false);
            expect(component.buch).toBeNull();
        });

        it('sollte einen Fehler anzeigen bei ungültiger ID (keine Zahl)', async () => {
            mockActivatedRoute.paramMap = of(convertToParamMap({ id: 'abc' }));

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(component.error).toContain('Ungültige ID');
            expect(component.isLoading).toBe(false);
        });

        it('sollte einen Fehler anzeigen wenn keine ID angegeben', async () => {
            mockActivatedRoute.paramMap = of(convertToParamMap({}));

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(component.error).toContain('Keine ID angegeben');
            expect(component.isLoading).toBe(false);
        });
    });

    describe('Ähnliche Bücher / Empfehlungen', () => {
        beforeEach(() => {
            mockBuchApiService.getById.mockReturnValue(of(mockBuch));
        });

        it('sollte ähnliche Bücher laden nachdem das Hauptbuch geladen wurde', async () => {
            mockBuchApiService.getRelated.mockReturnValue(
                of(mockRelatedBuecher),
            );

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            expect(mockBuchApiService.getRelated).toHaveBeenCalledWith(
                1,
                'HARDCOVER',
                10,
            );
            expect(component.related.length).toBe(4);
            expect(component.relatedLoading).toBe(false);
            expect(component.relatedError).toBeNull();
        });

        it('sollte das Karussell rendern wenn ähnliche Bücher vorhanden sind', async () => {
            mockBuchApiService.getRelated.mockReturnValue(
                of(mockRelatedBuecher),
            );

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const carouselElement =
                fixture.nativeElement.querySelector('ngb-carousel');
            expect(carouselElement).toBeTruthy();

            const recommendationCards = fixture.nativeElement.querySelectorAll(
                '.recommendation-card',
            );
            expect(recommendationCards.length).toBe(4);
        });

        it('sollte das Karussell NICHT rendern wenn keine ähnlichen Bücher vorhanden', async () => {
            mockBuchApiService.getRelated.mockReturnValue(of([]));

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const carouselElement =
                fixture.nativeElement.querySelector('ngb-carousel');
            expect(carouselElement).toBeNull();

            const noRecommendationsMessage =
                fixture.nativeElement.querySelector(
                    '.text-center.py-4.text-muted',
                );
            expect(noRecommendationsMessage).toBeTruthy();
        });

        it('sollte eine Fehlermeldung anzeigen wenn das Laden ähnlicher Bücher fehlschlägt', async () => {
            mockBuchApiService.getRelated.mockReturnValue(
                throwError(() => new Error('Netzwerkfehler')),
            );

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            expect(component.relatedError).toBeTruthy();
            expect(component.relatedLoading).toBe(false);
            expect(component.related.length).toBe(0);

            const alertElement = fixture.nativeElement.querySelector(
                'ngb-alert[type="warning"]',
            );
            expect(alertElement).toBeTruthy();
        });

        it('sollte einen Spinner anzeigen während ähnliche Bücher geladen werden', () => {
            mockBuchApiService.getRelated.and.returnValue(of([]));

            // Vor detectChanges ist relatedLoading noch false
            component.relatedLoading = true;
            fixture.detectChanges();

            const spinner = fixture.nativeElement.querySelector(
                '.spinner-border.text-primary',
            );
            expect(spinner).toBeTruthy();
        });
    });

    describe('getChunks() Hilfsfunktion', () => {
        it('sollte ein Array in Chunks von 3 aufteilen', () => {
            const testArray = [1, 2, 3, 4, 5, 6, 7, 8, 9];
            const chunks = component.getChunks(testArray, 3);

            expect(chunks.length).toBe(3);
            expect(chunks[0]).toEqual([1, 2, 3]);
            expect(chunks[1]).toEqual([4, 5, 6]);
            expect(chunks[2]).toEqual([7, 8, 9]);
        });

        it('sollte mit ungleichmäßigen Arrays umgehen', () => {
            const testArray = [1, 2, 3, 4, 5];
            const chunks = component.getChunks(testArray, 3);

            expect(chunks.length).toBe(2);
            expect(chunks[0]).toEqual([1, 2, 3]);
            expect(chunks[1]).toEqual([4, 5]);
        });

        it('sollte ein leeres Array zurückgeben bei leerem Input', () => {
            const chunks = component.getChunks([], 3);
            expect(chunks.length).toBe(0);
        });

        it('sollte bei nur einem Element ein Array mit einem Chunk zurückgeben', () => {
            const chunks = component.getChunks([1], 3);
            expect(chunks.length).toBe(1);
            expect(chunks[0]).toEqual([1]);
        });
    });

    describe('Navigation zu Buch-Details', () => {
        it('sollte RouterLink für jede Empfehlungs-Karte enthalten', async () => {
            mockBuchApiService.getById.mockReturnValue(of(mockBuch));
            mockBuchApiService.getRelated.mockReturnValue(
                of(mockRelatedBuecher),
            );

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const detailLinks = fixture.nativeElement.querySelectorAll(
                'a[routerLink^="/detail"]',
            );
            // Mindestens die 4 Empfehlungs-Bücher
            expect(detailLinks.length).toBeGreaterThanOrEqual(4);
        });
    });

    describe('Schwabenpreis-Funktion', () => {
        it('sollte true zurückgeben für günstiges Buch mit hohem Rabatt', () => {
            component.buch = {
                preis: 15.99,
                rabatt: 0.2,
            };
            expect(component.isSchwabenpreis()).toBe(true);
        });

        it('sollte false zurückgeben für teures Buch', () => {
            component.buch = {
                preis: 25,
                rabatt: 0.2,
            };
            expect(component.isSchwabenpreis()).toBe(false);
        });

        it('sollte false zurückgeben für günstiges Buch mit niedrigem Rabatt', () => {
            component.buch = {
                preis: 15,
                rabatt: 0.05,
            };
            expect(component.isSchwabenpreis()).toBe(false);
        });

        it('sollte false zurückgeben wenn Preis oder Rabatt fehlt', () => {
            component.buch = { preis: 15 };
            expect(component.isSchwabenpreis()).toBe(false);

            component.buch = { rabatt: 0.2 };
            expect(component.isSchwabenpreis()).toBe(false);

            component.buch = null;
            expect(component.isSchwabenpreis()).toBe(false);
        });
    });

    describe('getCoverUrl()', () => {
        it('sollte null zurückgeben (Platzhalter-Implementierung)', () => {
            component.buch = mockBuch;
            expect(component.getCoverUrl()).toBeNull();
        });
    });

    describe('Homepage Modal', () => {
        it('sollte Modal öffnen beim Klick auf Homepage-Link', () => {
            const mockModalRef = {
                result: Promise.resolve('confirm'),
            };
            mockNgbModal.open.mockReturnValue(mockModalRef as any);

            component.buch = mockBuch;
            component.homepageWarningModal = {} as any;

            component.openHomepageWarning();

            expect(mockNgbModal.open).toHaveBeenCalled();
        });

        it('sollte nichts tun wenn keine Homepage vorhanden', () => {
            component.buch = { ...mockBuch, homepage: undefined };
            component.openHomepageWarning();

            expect(mockNgbModal.open).not.toHaveBeenCalled();
        });

        it('sollte externe Seite öffnen nach Bestätigung', async () => {
            const mockModalRef = {
                result: Promise.resolve('confirm'),
            };
            mockNgbModal.open.mockReturnValue(mockModalRef as any);

            const openSpy = vi
                .spyOn(globalThis, 'open')
                .mockImplementation((() => null) as any);

            component.buch = mockBuch;
            component.homepageWarningModal = {} as any;
            component.openHomepageWarning();

            await mockModalRef.result;

            expect(openSpy).toHaveBeenCalledWith(
                'https://example.com',
                '_blank',
                'noopener,noreferrer',
            );
        });
    });

    describe('UI Rendering', () => {
        beforeEach(() => {
            mockBuchApiService.getById.mockReturnValue(of(mockBuch));
            mockBuchApiService.getRelated.mockReturnValue(
                of(mockRelatedBuecher),
            );
        });

        it('sollte den Buchtitel anzeigen', async () => {
            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const titleElement =
                fixture.nativeElement.querySelector('.product-title');
            expect(titleElement?.textContent).toContain('Angular für Profis');
        });

        it('sollte den Preis formatiert anzeigen', async () => {
            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const priceElement =
                fixture.nativeElement.querySelector('.product-price');
            expect(priceElement?.textContent).toContain('29,99');
        });

        it('sollte das Rating-Badge anzeigen', async () => {
            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const ratingBadge =
                fixture.nativeElement.querySelector('.rating-badge');
            expect(ratingBadge?.textContent).toContain('4');
        });

        it('sollte den Schnäppchen-Badge für Schwabenpreis anzeigen', async () => {
            const cheapBuch: BuchItem = {
                ...mockBuch,
                preis: 15,
                rabatt: 0.2,
            };
            mockBuchApiService.getById.mockReturnValue(of(cheapBuch));

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const schnaeppchenBadge =
                fixture.nativeElement.querySelector('.badge.bg-danger');
            expect(schnaeppchenBadge?.textContent).toContain('Schnäppchen');
        });

        it('sollte Schlagwörter als Badges anzeigen', async () => {
            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const badges = fixture.nativeElement.querySelectorAll(
                '.badge.bg-light.text-dark',
            );
            const badgeTexts = Array.from(badges).map((b: any) =>
                b.textContent.trim(),
            );
            expect(badgeTexts).toContain('TypeScript');
            expect(badgeTexts).toContain('Angular');
        });
    });

    describe('Responsive Verhalten', () => {
        it('sollte col-md-4 Klassen für Desktop-Layout verwenden', async () => {
            mockBuchApiService.getById.mockReturnValue(of(mockBuch));
            mockBuchApiService.getRelated.mockReturnValue(
                of(mockRelatedBuecher),
            );

            fixture.detectChanges();

            await new Promise((resolve) => setTimeout(resolve, 100));

            fixture.detectChanges();
            const cols = fixture.nativeElement.querySelectorAll('.col-md-4');
            // Sollte mindestens die Empfehlungs-Karten enthalten
            expect(cols.length).toBeGreaterThan(0);
        });
    });
});

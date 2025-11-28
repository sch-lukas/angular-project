import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BuchApiService, type BuchItem } from './buch-api.service';

describe('BuchApiService', () => {
    let service: BuchApiService;
    let httpMock: HttpTestingController;

    const mockBuch: BuchItem = {
        id: 1,
        isbn: '978-3-89722-345-6',
        rating: 4,
        art: 'HARDCOVER',
        preis: 29.99,
        rabatt: 0.1,
        lieferbar: true,
        titel: {
            titel: 'Angular für Profis',
            untertitel: 'Best Practices',
        },
    };

    const mockRelatedBuecher: BuchItem[] = [
        {
            id: 2,
            isbn: '978-3-89722-346-7',
            rating: 3,
            art: 'HARDCOVER',
            preis: 24.99,
            titel: { titel: 'TypeScript Grundlagen' },
        },
        {
            id: 3,
            isbn: '978-3-89722-347-8',
            rating: 5,
            art: 'HARDCOVER',
            preis: 34.99,
            titel: { titel: 'Angular Testing' },
        },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                BuchApiService,
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(BuchApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('sollte erstellt werden', () => {
        expect(service).toBeTruthy();
    });

    describe('getRelated()', () => {
        it('sollte ähnliche Bücher basierend auf Art laden', async () => {
            const currentId = 1;
            const art = 'HARDCOVER';

            const promise = new Promise<BuchItem[]>((resolve) => {
                service.getRelated(currentId, art, 10).subscribe((buecher) => {
                    resolve(buecher);
                });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            expect(req.request.method).toBe('POST');
            expect(req.request.body.variables.suchparameter.art).toBe(
                'HARDCOVER',
            );

            req.flush({
                data: {
                    buecher: {
                        content: [mockBuch, ...mockRelatedBuecher],
                    },
                },
            });

            const buecher = await promise;
            expect(buecher.length).toBe(2);
            expect(buecher[0].id).toBe(2);
            expect(buecher[1].id).toBe(3);
            expect(buecher.find((b) => b.id === currentId)).toBeUndefined();
        });

        it('sollte ähnliche Bücher ohne Art-Filter laden', async () => {
            const currentId = 1;

            const promise = new Promise<BuchItem[]>((resolve) => {
                service
                    .getRelated(currentId, undefined, 5)
                    .subscribe((buecher) => {
                        resolve(buecher);
                    });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            expect(req.request.method).toBe('POST');
            expect(
                req.request.body.variables.suchparameter.art,
            ).toBeUndefined();

            req.flush({
                data: {
                    buecher: {
                        content: mockRelatedBuecher,
                    },
                },
            });

            const buecher = await promise;
            expect(buecher.length).toBe(2);
        });

        it('sollte das aktuelle Buch aus den Ergebnissen filtern', async () => {
            const currentId = 2;

            const promise = new Promise<BuchItem[]>((resolve) => {
                service
                    .getRelated(currentId, 'HARDCOVER', 10)
                    .subscribe((buecher) => {
                        resolve(buecher);
                    });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            req.flush({
                data: {
                    buecher: {
                        content: mockRelatedBuecher,
                    },
                },
            });

            const buecher = await promise;
            expect(buecher.find((b) => b.id === currentId)).toBeUndefined();
            expect(buecher.length).toBe(1);
        });

        it('sollte maximal die angegebene Anzahl zurückgeben', async () => {
            const currentId = 1;
            const maxResults = 1;

            const vieleBuecher: BuchItem[] = [
                { id: 2, titel: { titel: 'Buch 2' } },
                { id: 3, titel: { titel: 'Buch 3' } },
                { id: 4, titel: { titel: 'Buch 4' } },
                { id: 5, titel: { titel: 'Buch 5' } },
            ];

            const promise = new Promise<BuchItem[]>((resolve) => {
                service
                    .getRelated(currentId, undefined, maxResults)
                    .subscribe((buecher) => {
                        resolve(buecher);
                    });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            req.flush({
                data: {
                    buecher: {
                        content: vieleBuecher,
                    },
                },
            });

            const buecher = await promise;
            expect(buecher.length).toBe(1);
        });

        it('sollte String-Rabatt in Number konvertieren', async () => {
            const buchMitStringRabatt = {
                ...mockRelatedBuecher[0],
                rabatt: '0.15 (15%)' as any,
            };

            const promise = new Promise<BuchItem[]>((resolve) => {
                service.getRelated(1, undefined, 5).subscribe((buecher) => {
                    resolve(buecher);
                });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            req.flush({
                data: {
                    buecher: {
                        content: [buchMitStringRabatt],
                    },
                },
            });

            const buecher = await promise;
            expect(typeof buecher[0].rabatt).toBe('number');
            expect(buecher[0].rabatt).toBe(0.15);
        });

        it('sollte leeres Array zurückgeben wenn keine Bücher gefunden', async () => {
            const promise = new Promise<BuchItem[]>((resolve) => {
                service.getRelated(1, 'EPUB', 10).subscribe((buecher) => {
                    resolve(buecher);
                });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            req.flush({
                data: {
                    buecher: {
                        content: [],
                    },
                },
            });

            const buecher = await promise;
            expect(buecher).toEqual([]);
        });

        it('sollte Fehler bei GraphQL-Error werfen', async () => {
            const promise = new Promise<{ success: boolean; error?: string }>(
                (resolve) => {
                    service.getRelated(1, 'HARDCOVER', 10).subscribe({
                        next: () => resolve({ success: true }),
                        error: (error) =>
                            resolve({ success: false, error: error.message }),
                    });
                },
            );

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            req.flush({
                errors: [{ message: 'Datenbank-Fehler' }],
            });

            const result = await promise;
            expect(result.success).toBe(false);
            expect(result.error).toContain('GraphQL-Fehler');
        });

        it('sollte leeres Array zurückgeben wenn data.buecher fehlt', async () => {
            const promise = new Promise<BuchItem[]>((resolve) => {
                service.getRelated(1, undefined, 10).subscribe((buecher) => {
                    resolve(buecher);
                });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            req.flush({
                data: {},
            });

            const buecher = await promise;
            expect(buecher).toEqual([]);
        });
    });

    describe('getById()', () => {
        it('sollte Rabatt von String zu Number konvertieren', async () => {
            const buchMitStringRabatt = {
                ...mockBuch,
                rabatt: '0.10 (10%)' as any,
            };

            const promise = new Promise<BuchItem>((resolve) => {
                service.getById(1).subscribe((buch) => {
                    resolve(buch);
                });
            });

            const req = httpMock.expectOne((request) => {
                return request.url.includes('/graphql');
            });

            req.flush({
                data: {
                    buch: buchMitStringRabatt,
                },
            });

            const buch = await promise;
            expect(typeof buch.rabatt).toBe('number');
            expect(buch.rabatt).toBe(0.1);
        });
    });
});

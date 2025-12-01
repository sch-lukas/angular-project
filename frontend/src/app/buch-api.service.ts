import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../environments/environment';
import { executeGraphQL } from './graphql-client';
import {
    BUCH_BY_ID_QUERY,
    BUECHER_QUERY,
    CREATE_BUCH_MUTATION,
    RELATED_BUECHER_QUERY,
} from './graphql-queries';

export type BuchArt = 'EPUB' | 'HARDCOVER' | 'PAPERBACK';

export interface BuchItem {
    id?: number;
    version?: number;
    isbn?: string;
    rating?: number;
    art?: BuchArt;
    preis?: number;
    rabatt?: number;
    lieferbar?: boolean;
    datum?: string;
    homepage?: string;
    schlagwoerter?: string[];
    beschreibung?: string;
    autor?: string;
    autorBiographie?: string;
    erzeugt?: string;
    aktualisiert?: string;
    titel?: { titel: string; untertitel?: string } | null;
    coverUrl?: string;
    abbildungen?: Array<{
        id?: number;
        beschriftung?: string;
        contentType?: string;
        pfad?: string;
    }>;
}

export interface BuchPage {
    content: BuchItem[];
    page: {
        size: number;
        number: number;
        totalElements: number;
        totalPages: number;
    };
}

export interface SearchParams {
    titel?: string;
    isbn?: string;
    rating?: number;
    page?: number;
    size?: number;
    sortierung?: 'preisAsc' | 'preisDesc';
}

export interface BuchStats {
    totalCount: number;
    bestBook: { id: number; titel: string; rating: number } | null;
    cheapestBook: { id: number; titel: string; preis: number } | null;
}

export interface CreateBuchPayload {
    isbn: string;
    rating: number;
    art?: BuchArt;
    preis: number;
    rabatt?: number;
    lieferbar?: boolean;
    datum?: string;
    homepage?: string;
    schlagwoerter?: string[];
    beschreibung?: string;
    autor?: string;
    autorBiographie?: string;
    titel: {
        titel: string;
        untertitel?: string;
    };
}

@Injectable({ providedIn: 'root' })
export class BuchApiService {
    constructor(private readonly http: HttpClient) {}

    /**
     * Liefert Bücher mit optionalen Such-Parametern via GraphQL
     * @param params Such- und Paging-Parameter
     * @returns Observable mit kompletter Page-Response inkl. Pagination-Metadaten
     */
    list(params?: SearchParams): Observable<BuchPage> {
        // GraphQL Suchparameter aufbauen
        const suchparameter: any = {};

        if (params?.titel) {
            suchparameter.titel = params.titel;
        }
        if (params?.isbn) {
            suchparameter.isbn = params.isbn;
        }
        if (params?.rating !== undefined && params.rating > 0) {
            suchparameter.rating = params.rating;
        }

        // GraphQL Query ausführen
        // Page-Parameter für GraphQL: GraphQL-Seiten sind 1-basiert in der API
        const pageVar = (params?.page ?? 0) + 1; // 1-based
        const sizeVar = params?.size ?? 10;
        // Build sort parameter for backend: "preis,asc" or "preis,desc"
        let sortVar: string | undefined;
        if (params?.sortierung) {
            sortVar =
                params.sortierung === 'preisAsc' ? 'preis,asc' : 'preis,desc';
        }

        return executeGraphQL<{ buecher: { content: BuchItem[]; page: any } }>(
            this.http,
            BUECHER_QUERY,
            { suchparameter, page: pageVar, size: sizeVar, sort: sortVar },
        ).pipe(
            map((response) => {
                // GraphQL-Fehler prüfen
                if (response.errors && response.errors.length > 0) {
                    const errorMsg = response.errors
                        .map((e) => e.message)
                        .join(', ');
                    throw new Error(`GraphQL-Fehler: ${errorMsg}`);
                }

                if (!response.data?.buecher) {
                    throw new Error('Keine Daten vom Server erhalten');
                }

                // Server-seitiges Paging: Content + Page-Metadaten
                const content = response.data.buecher.content ?? [];
                const pageInfo = response.data.buecher.page ?? {
                    size: sizeVar,
                    number: pageVar - 1,
                    totalElements: content.length,
                    totalPages: Math.ceil(content.length / sizeVar),
                };

                // Sortierung erfolgt jetzt server-seitig via sort-Parameter
                return {
                    content,
                    page: {
                        number: pageInfo.number,
                        size: pageInfo.size,
                        totalElements: pageInfo.totalElements,
                        totalPages: pageInfo.totalPages,
                    },
                };
            }),
        );
    }

    /**
     * Liefert ein einzelnes Buch per ID via GraphQL
     * @param id Buch-ID
     * @returns Observable mit dem Buch
     */
    getById(id: number): Observable<BuchItem> {
        return executeGraphQL<{ buch: BuchItem }>(this.http, BUCH_BY_ID_QUERY, {
            id: id.toString(),
        }).pipe(
            map((response) => {
                // GraphQL-Fehler prüfen
                if (response.errors && response.errors.length > 0) {
                    const errorMsg = response.errors
                        .map((e) => e.message)
                        .join(', ');
                    throw new Error(`GraphQL-Fehler: ${errorMsg}`);
                }

                if (!response.data?.buch) {
                    throw new Error(`Buch mit ID ${id} nicht gefunden`);
                }

                // rabatt von "X Prozent" String zurück zu Number konvertieren
                const buch = response.data.buch;
                const rabattValue = (buch as any).rabatt;
                if (typeof rabattValue === 'string') {
                    const m = /^([\d.]+)/.exec(rabattValue);
                    (buch as any).rabatt = m ? Number.parseFloat(m[1]) : 0;
                }

                return buch;
            }),
        );
    }

    /**
     * REST-Endpunkt für Statistiken (bleibt REST, da kein GraphQL-Äquivalent existiert)
     */
    getStats(): Observable<BuchStats> {
        const url = `${environment.apiUrl}/rest/stats`;
        return this.http.get<BuchStats>(url);
    }

    /**
     * Erstellt ein neues Buch via GraphQL Mutation
     * @param buch Buchdaten
     * @returns Observable (void bei Erfolg)
     */
    create(buch: CreateBuchPayload): Observable<void> {
        // Input-Objekt für GraphQL Mutation aufbauen
        const input: any = {
            isbn: buch.isbn.replaceAll(/[-\s]/g, ''), // Bindestriche und Leerzeichen entfernen
            rating: buch.rating,
            preis: buch.preis,
            titel: {
                titel: buch.titel.titel,
                untertitel: buch.titel.untertitel || null,
            },
        };

        // Optionale Felder nur hinzufügen, wenn gesetzt
        if (buch.art) input.art = buch.art;
        if (buch.rabatt !== undefined) input.rabatt = buch.rabatt;
        if (buch.lieferbar !== undefined) input.lieferbar = buch.lieferbar;
        if (buch.datum) input.datum = buch.datum;
        if (buch.homepage) input.homepage = buch.homepage;
        if (buch.schlagwoerter) input.schlagwoerter = buch.schlagwoerter;
        if (buch.beschreibung) input.beschreibung = buch.beschreibung;
        if (buch.autor) input.autor = buch.autor;
        if (buch.autorBiographie) input.autorBiographie = buch.autorBiographie;

        return executeGraphQL<{ create: { id: number } }>(
            this.http,
            CREATE_BUCH_MUTATION,
            { input },
        ).pipe(
            map((response) => {
                // GraphQL-Fehler prüfen
                if (response.errors && response.errors.length > 0) {
                    const errorMsg = response.errors
                        .map((e) => e.message)
                        .join(', ');
                    throw new Error(`GraphQL-Fehler: ${errorMsg}`);
                }

                if (!response.data?.create?.id) {
                    throw new Error('Buch konnte nicht erstellt werden');
                }

                // void zurückgeben (Signatur beibehalten)
                return undefined as any;
            }),
        );
    }

    /**
     * Lädt ähnliche/verwandte Bücher basierend auf Art und Schlagwörtern
     * @param currentBuchId ID des aktuellen Buchs (wird aus Ergebnissen ausgeschlossen)
     * @param art Buch-Art für Filter (optional)
     * @param maxResults Maximale Anzahl Ergebnisse (default: 10)
     * @returns Observable mit Array ähnlicher Bücher
     */
    getRelated(
        currentBuchId: number,
        art?: BuchArt,
        maxResults = 10,
    ): Observable<BuchItem[]> {
        const suchparameter: any = {};

        // Filter nach gleicher Art wenn vorhanden
        if (art) {
            suchparameter.art = art;
        }

        return executeGraphQL<{ buecher: { content: BuchItem[] } }>(
            this.http,
            RELATED_BUECHER_QUERY,
            { suchparameter, size: maxResults + 5 }, // +5 weil wir aktuelles Buch rausfiltern
        ).pipe(
            map((response) => {
                if (response.errors && response.errors.length > 0) {
                    const errorMsg = response.errors
                        .map((e) => e.message)
                        .join(', ');
                    throw new Error(`GraphQL-Fehler: ${errorMsg}`);
                }

                if (!response.data?.buecher) {
                    return [];
                }

                const buecher = response.data.buecher.content ?? [];

                // Aktuelles Buch ausschließen und auf maxResults begrenzen
                const filtered = buecher
                    .filter((b) => b.id !== currentBuchId)
                    .slice(0, maxResults);

                // Rabatt konvertieren falls vorhanden
                for (const buch of filtered) {
                    const rabattValue = (buch as any).rabatt;
                    if (typeof rabattValue === 'string') {
                        const m = /^([\d.]+)/.exec(rabattValue);
                        (buch as any).rabatt = m ? Number.parseFloat(m[1]) : 0;
                    }
                }

                return filtered;
            }),
        );
    }

    /**
     * Löscht ein Buch über REST API (nur für Admins)
     */
    delete(id: number): Observable<void> {
        const url = `${environment.apiUrl}/rest/${id}`;
        return this.http.delete<void>(url);
    }
}

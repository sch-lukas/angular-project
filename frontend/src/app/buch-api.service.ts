import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface BuchItem {
    id?: number;
    isbn?: string;
    rating?: number;
    titel?: { titel: string; untertitel?: string } | null;
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
}

export interface BuchStats {
    totalCount: number;
    bestBook: { id: number; titel: string; rating: number } | null;
    cheapestBook: { id: number; titel: string; preis: number } | null;
}

export interface CreateBuchPayload {
    isbn: string;
    rating: number;
    art?: 'EPUB' | 'HARDCOVER' | 'PAPERBACK';
    preis: number;
    rabatt?: number;
    lieferbar?: boolean;
    datum?: string;
    homepage?: string;
    schlagwoerter?: string[];
    titel: {
        titel: string;
        untertitel?: string;
    };
}

@Injectable({ providedIn: 'root' })
export class BuchApiService {
    private readonly base = environment.apiUrl;

    constructor(private readonly http: HttpClient) {}

    /**
     * Liefert Bücher mit optionalen Such-Parametern
     * @param params Such- und Paging-Parameter
     * @returns Observable mit kompletter Page-Response inkl. Pagination-Metadaten
     */
    list(params?: SearchParams): Observable<BuchPage> {
        const query = new URLSearchParams();
        if (params?.titel) query.append('titel', params.titel);
        if (params?.isbn) query.append('isbn', params.isbn);
        if (params?.rating !== undefined && params.rating > 0)
            query.append('rating', String(params.rating));

        // Backend konvertiert Query-Parameter intern von 1-basiert zu 0-basiert
        // Wir senden 1-basiert, damit die Backend-Konvertierung korrekt funktioniert
        const pageNumber = (params?.page ?? 0) + 1;
        query.append('page', String(pageNumber));
        query.append('size', String(params?.size ?? 10));

        const url = `${this.base}/rest?${query.toString()}`;
        return this.http.get<BuchPage>(url);
    }

    getById(id: number) {
        const url = `${this.base}/rest/${id}`;
        return this.http.get<BuchItem>(url);
    }

    getStats(): Observable<BuchStats> {
        const url = `${this.base}/rest/stats`;
        return this.http.get<BuchStats>(url);
    }

    create(buch: CreateBuchPayload): Observable<void> {
        const url = `${this.base}/rest`;
        return this.http.post<void>(url, buch);
    }
}

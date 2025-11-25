import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

@Injectable({ providedIn: 'root' })
export class BuchApiService {
    private readonly base = environment.apiUrl;

    constructor(private readonly http: HttpClient) {}

    /**
     * Liefert Bücher mit optionalen Such-Parametern
     */
    list(params?: SearchParams): Observable<BuchItem[]> {
        const query = new URLSearchParams();
        if (params?.titel) query.append('titel', params.titel);
        if (params?.isbn) query.append('isbn', params.isbn);
        if (params?.rating !== undefined && params.rating > 0)
            query.append('rating', String(params.rating));
        query.append('page', String(params?.page ?? 0));
        query.append('size', String(params?.size ?? 20));

        const url = `${this.base}/rest?${query.toString()}`;
        return this.http.get<BuchPage>(url).pipe(map((p) => p.content || []));
    }

    getById(id: number) {
        const url = `${this.base}/rest/${id}`;
        return this.http.get<BuchItem>(url);
    }
}

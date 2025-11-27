import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{ message: string; extensions?: any }>;
}

const GRAPHQL_ENDPOINT = `${environment.apiUrl}/graphql`;

/**
 * Führt eine GraphQL-Query oder -Mutation aus
 * @param http HttpClient-Instanz
 * @param query GraphQL-Query oder -Mutation als String
 * @param variables Optionale Variablen
 * @returns Observable mit der GraphQL-Response
 */
export function executeGraphQL<T>(
    http: HttpClient,
    query: string,
    variables?: Record<string, unknown>,
): Observable<GraphQLResponse<T>> {
    return http.post<GraphQLResponse<T>>(GRAPHQL_ENDPOINT, {
        query,
        variables,
    });
}

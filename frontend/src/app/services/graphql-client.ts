import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface GraphQLResponse<T> {
    data?: T;
    errors?: Array<{ message: string; extensions?: any }>;
}

// Relative URL - wird vom Proxy an das HTTPS-Backend weitergeleitet
const GRAPHQL_ENDPOINT = '/graphql';

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

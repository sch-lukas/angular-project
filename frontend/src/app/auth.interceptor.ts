import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * HTTP-Interceptor, der den Authorization-Header mit JWT-Token zu jedem Request hinzufügt
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    // Token nur hinzufügen, wenn vorhanden und nicht bei /auth/token selbst
    if (token && !req.url.includes('/auth/token')) {
        console.log(
            '🔐 Interceptor: Adding token to request:',
            req.method,
            req.url,
        );
        const cloned = req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`),
        });
        return next(cloned);
    }

    console.log('⚠️  Interceptor: No token for request:', req.method, req.url);
    return next(req);
};

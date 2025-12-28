import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanMatchFn = (route, segments) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        return true;
    }

    // Erstelle returnUrl aus den Segmenten
    const returnUrl = '/' + segments.map((s) => s.path).join('/');

    // Navigiere zum Login mit returnUrl als Query-Parameter
    router.navigate(['/login'], {
        queryParams: { returnUrl },
    });

    return false;
};

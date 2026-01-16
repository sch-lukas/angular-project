/**
 * Angular v21 Routes Configuration
 *
 * Best Practices:
 * - Lazy Loading mit loadComponent für bessere Performance
 * - Page Titles für Accessibility
 * - canMatch Guards statt canActivate
 * - authGuard für geschützte Routen
 */
import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/landing-page').then(
                (m) => m.LandingPageComponent,
            ),
        title: 'Startseite - Buch SPA',
    },
    {
        path: 'login',
        loadComponent: () =>
            import('./components/login').then((m) => m.LoginComponent),
        title: 'Login - Buch SPA',
    },
    {
        path: 'search',
        loadComponent: () =>
            import('./components/search').then((m) => m.SearchComponent),
        title: 'Buchsuche - Buch SPA',
    },
    {
        path: 'detail/:id',
        loadComponent: () =>
            import('./components/detail').then((m) => m.DetailComponent),
        title: 'Buchdetails - Buch SPA',
    },
    {
        path: 'cart',
        loadComponent: () =>
            import('./components/cart').then((m) => m.CartComponent),
        title: 'Warenkorb - Buch SPA',
    },
    {
        path: 'wishlist',
        loadComponent: () =>
            import('./components/wishlist').then((m) => m.WishlistComponent),
        title: 'Merkliste - Buch SPA',
    },
    {
        path: 'carousel-test',
        loadComponent: () =>
            import('./carousel-test').then((m) => m.CarouselTestComponent),
        title: 'Karussell Test - Buch SPA',
    },
    {
        path: 'new',
        loadComponent: () =>
            import('./components/new').then((m) => m.NewComponent),
        canMatch: [authGuard],
        title: 'Neues Buch anlegen - Buch SPA',
    },
    {
        path: 'kontakt',
        loadComponent: () =>
            import('./components/kontakt').then((m) => m.KontaktComponent),
        title: 'Kontakt - Buch SPA',
    },
    {
        path: 'impressum',
        loadComponent: () =>
            import('./components/impressum').then((m) => m.ImpressumComponent),
        title: 'Impressum - Buch SPA',
    },
    {
        path: 'analytics',
        loadComponent: () =>
            import('./analytics/analytics-dashboard').then(
                (m) => m.AnalyticsDashboardComponent,
            ),
        canMatch: [authGuard],
        title: 'Analytics Dashboard - Buch SPA',
    },
    { path: '**', redirectTo: '' },
];

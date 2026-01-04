import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import {
    NavigationEnd,
    Router,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    RouterOutlet,
} from '@angular/router';
import { Observable, filter, map, take } from 'rxjs';
import { AnalyticsWebSocketService } from './analytics/analytics-websocket.service';
import { AuthService } from './services/auth.service';
import { CartService } from './services/cart.service';
import { WishlistService } from './services/wishlist.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        RouterLink,
        RouterLinkActive,
        RouterOutlet,
    ],
    templateUrl: './templates/app.component.html',
    styleUrls: ['./templates/app.component.css'],
})
export class AppComponent implements OnInit {
    isDarkMode: boolean = false;
    isLoggedIn$ = this.authService.isLoggedIn$;
    cartItemCount$: Observable<number>;
    wishlistItemCount$: Observable<number>;
    isAdmin$: Observable<boolean>;

    private readonly analyticsService = inject(AnalyticsWebSocketService);

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly cartService: CartService,
        private readonly wishlistService: WishlistService,
    ) {
        this.cartItemCount$ = this.cartService.getItemCount();
        this.wishlistItemCount$ = this.wishlistService.getItemCount();
        // isAdmin$ als Observable basierend auf Login-Status
        this.isAdmin$ = this.isLoggedIn$.pipe(
            map(() => this.authService.isAdmin()),
        );
    }

    ngOnInit() {
        // Versuche, den Theme aus localStorage zu lesen
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            this.isDarkMode = savedTheme === 'dark';
        } else {
            // Fallback: Nutze Betriebssystem-Präferenz
            this.isDarkMode = globalThis.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;
        }

        // Analytics WebSocket verbinden (als normaler Besucher, nicht Admin)
        this.analyticsService.connect(false);

        // Nach erfolgreicher Verbindung initiale Cart/Wishlist-Daten senden
        this.analyticsService.connected$
            .pipe(
                filter((connected) => connected),
                take(1),
            )
            .subscribe(() => {
                // Sende aktuelle Cart-Daten
                this.cartService
                    .getItems()
                    .pipe(take(1))
                    .subscribe((items) => {
                        const analyticsItems = items.map((item) => ({
                            id: item.id,
                            titel: item.title,
                            preis: item.price,
                            quantity: item.quantity,
                        }));
                        this.analyticsService.sendCartUpdate(analyticsItems);
                    });

                // Sende aktuelle Wishlist-Daten
                this.wishlistService.items$.pipe(take(1)).subscribe((items) => {
                    const analyticsItems = items.map((item) => ({
                        id: item.id,
                        titel: item.title,
                    }));
                    this.analyticsService.sendWishlistUpdate(analyticsItems);
                });

                // Sende aktuelle Seite
                this.analyticsService.sendPageView(this.router.url);
            });

        // Bei Navigation Seitenansicht senden
        this.router.events
            .pipe(
                filter(
                    (event): event is NavigationEnd =>
                        event instanceof NavigationEnd,
                ),
            )
            .subscribe((event) => {
                this.analyticsService.sendPageView(event.urlAfterRedirects);
            });
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        const theme = this.isDarkMode ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    }

    onLogout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import {
    NavigationEnd,
    Router,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    RouterOutlet,
} from '@angular/router';
import { filter, take } from 'rxjs';
import { AnalyticsWebSocketService } from './analytics/analytics-websocket';
import { AuthService } from './services/auth';
import { CartService } from './services/cart';
import { WishlistService } from './services/wishlist';

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
    templateUrl: './templates/app.html',
    styleUrls: ['./templates/app.css'],
})
export class AppComponent implements OnInit {
    // Dependency Injection via inject() (Angular v21 Style Guide)
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly cartService = inject(CartService);
    private readonly wishlistService = inject(WishlistService);
    private readonly analyticsService = inject(AnalyticsWebSocketService);

    // State mit Signals
    protected readonly isDarkMode = signal(false);

    // Observables für async pipe (kompatibel mit bestehenden Services)
    readonly isLoggedIn$ = this.authService.isLoggedIn$;
    readonly cartItemCount$ = this.cartService.getItemCount();
    readonly wishlistItemCount$ = this.wishlistService.getItemCount();

    // Computed für Admin-Status
    protected readonly isAdmin = computed(() => this.authService.isAdmin());

    ngOnInit() {
        // Versuche, den Theme aus localStorage zu lesen
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || savedTheme === 'light') {
            this.isDarkMode.set(savedTheme === 'dark');
        } else {
            // Fallback: Nutze Betriebssystem-Präferenz
            this.isDarkMode.set(
                globalThis.matchMedia('(prefers-color-scheme: dark)').matches,
            );
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
        this.isDarkMode.set(!this.isDarkMode());
        const theme = this.isDarkMode() ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
    }

    onLogout() {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}

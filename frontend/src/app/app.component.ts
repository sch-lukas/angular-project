import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    Router,
    RouterLink,
    RouterLinkActive,
    RouterModule,
    RouterOutlet,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { CartService } from './cart/cart.service';

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
    template: `
        <div
            class="app-shell"
            [class.theme-dark]="isDarkMode"
            [class.theme-light]="!isDarkMode"
        >
            <header class="app-header">
                <div class="app-header-left">
                    <img
                        src="assets/logo-buch-spa.svg"
                        alt="Buch SPA Logo"
                        class="app-logo"
                    />
                </div>
                <div class="app-header-right">
                    <nav class="app-nav">
                        <a
                            routerLink="/"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            >Home</a
                        >
                        <a
                            routerLink="/search"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            >Suche</a
                        >
                        <!-- Zeige "Neu" nur für eingeloggte Benutzer -->
                        <a
                            *ngIf="isLoggedIn$ | async"
                            routerLink="/new"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            >Neu</a
                        >
                        <!-- Warenkorb mit Badge -->
                        <a
                            routerLink="/cart"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            class="cart-link"
                        >
                            🛒 Warenkorb
                            <span
                                *ngIf="(cartItemCount$ | async) ?? 0 > 0"
                                class="cart-badge"
                            >
                                {{ cartItemCount$ | async }}
                            </span>
                        </a>
                        <!-- Zeige Login oder Logout je nach Status -->
                        <a
                            *ngIf="!(isLoggedIn$ | async)"
                            routerLink="/login"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            >Login</a
                        >
                        <button
                            *ngIf="isLoggedIn$ | async"
                            type="button"
                            class="logout-btn"
                            (click)="onLogout()"
                        >
                            Logout
                        </button>
                    </nav>
                    <button
                        type="button"
                        class="theme-toggle"
                        (click)="toggleDarkMode()"
                    >
                        {{ isDarkMode ? 'Dark' : 'Light' }}
                    </button>
                </div>
            </header>
            <main class="app-main">
                <router-outlet></router-outlet>
            </main>
            <footer class="app-footer">
                <span>© Buch SPA</span>
                <span class="footer-links">
                    <a routerLink="/kontakt" routerLinkActive="active"
                        >Kontakt</a
                    >
                    <a routerLink="/impressum" routerLinkActive="active"
                        >Impressum</a
                    >
                </span>
            </footer>
        </div>
    `,
    styles: [
        `
            .logout-btn {
                background: none;
                border: none;
                color: inherit;
                font: inherit;
                cursor: pointer;
                padding: 0;
                text-decoration: none;
                transition: color 0.3s;
            }

            .logout-btn:hover {
                color: #3498db;
            }

            :host-context(.theme-dark) .logout-btn:hover {
                color: #5dade2;
            }

            .cart-link {
                position: relative;
                display: inline-block;
            }

            .cart-badge {
                position: absolute;
                top: -8px;
                right: -12px;
                background: #dc3545;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 0.7rem;
                font-weight: bold;
                min-width: 18px;
                height: 18px;
                display: flex;
                align-items: center;
                justify-content: center;
                animation: scaleIn 0.3s ease-out;
            }

            @keyframes scaleIn {
                0% {
                    transform: scale(0);
                }
                50% {
                    transform: scale(1.2);
                }
                100% {
                    transform: scale(1);
                }
            }
        `,
    ],
})
export class AppComponent implements OnInit {
    isDarkMode: boolean = false;
    isLoggedIn$ = this.authService.isLoggedIn$;
    cartItemCount$: Observable<number>;

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly cartService: CartService,
    ) {
        this.cartItemCount$ = this.cartService.getItemCount();
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

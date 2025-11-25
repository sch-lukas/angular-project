import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    RouterLink,
    RouterLinkActive,
    RouterModule,
    RouterOutlet,
} from '@angular/router';

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
                        <a
                            routerLink="/new"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            >Neu</a
                        >
                        <a
                            routerLink="/login"
                            routerLinkActive="active"
                            [routerLinkActiveOptions]="{ exact: true }"
                            >Login</a
                        >
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
    styles: [],
})
export class AppComponent implements OnInit {
    isDarkMode: boolean = false;

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
}

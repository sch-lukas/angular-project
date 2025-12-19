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
import { WishlistService } from './wishlist/wishlist.service';

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

    constructor(
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly cartService: CartService,
        private readonly wishlistService: WishlistService,
    ) {
        this.cartItemCount$ = this.cartService.getItemCount();
        this.wishlistItemCount$ = this.wishlistService.getItemCount();
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

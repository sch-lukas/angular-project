import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <nav style="padding:12px; background:#f5f5f5;">
            <a routerLink="/search" style="margin-right:12px;">Suche</a>
            <a routerLink="/new" style="margin-right:12px;">Neu</a>
            <a routerLink="/login" style="margin-right:12px;">Login</a>
        </nav>
        <main style="padding:16px;">
            <router-outlet></router-outlet>
        </main>
    `,
})
export class AppComponent {
    title = 'spa-frontend';
}

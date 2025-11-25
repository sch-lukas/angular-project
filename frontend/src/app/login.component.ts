import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    template: `
        <h1>Login-Seite (Dummy)</h1>
        <p>Hier kommt später der Login hin.</p>
    `,
})
export class LoginComponent {}

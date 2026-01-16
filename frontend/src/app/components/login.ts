import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: '../templates/login.html',
    styleUrls: ['../templates/login.css'],
})
export class LoginComponent implements OnInit {
    // Dependency Injection via inject() (Angular v21 Style Guide Empfehlung)
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    form!: FormGroup;
    protected readonly loginError = signal<string | null>(null);
    protected readonly isSubmitting = signal(false);
    private returnUrl = '/';

    ngOnInit(): void {
        this.form = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required],
        });

        // ReturnUrl aus Query-Parametern holen
        this.route.queryParams.subscribe((params) => {
            this.returnUrl = params['returnUrl'] || '/';
        });
    }

    onSubmit(): void {
        this.form.markAllAsTouched();

        if (this.form.invalid) {
            return;
        }

        this.isSubmitting.set(true);
        this.loginError.set(null);

        const { username, password } = this.form.value;

        this.authService.login(username, password).subscribe({
            next: (result) => {
                if (result.success) {
                    // Erfolgreich eingeloggt - zur returnUrl navigieren
                    this.router.navigate([this.returnUrl]);
                } else {
                    // Login fehlgeschlagen
                    this.loginError.set(
                        result.message || 'Login fehlgeschlagen',
                    );
                    this.isSubmitting.set(false);
                }
            },
            error: () => {
                this.loginError.set('Verbindungsfehler zum Server');
                this.isSubmitting.set(false);
            },
        });
    }
}

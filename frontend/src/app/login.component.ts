import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
        <div class="login-container">
            <div class="login-card">
                <h1>Login</h1>

                <!-- Fehlermeldung -->
                <div *ngIf="loginError" class="alert alert-error">
                    <strong>Fehler:</strong> {{ loginError }}
                </div>

                <form [formGroup]="form" (ngSubmit)="onSubmit()">
                    <!-- Benutzername -->
                    <div class="form-group">
                        <label for="username">Benutzername</label>
                        <input
                            id="username"
                            type="text"
                            formControlName="username"
                            class="form-control"
                            placeholder="admin"
                            [class.is-invalid]="
                                form.get('username')?.invalid &&
                                form.get('username')?.touched
                            "
                        />
                        <div
                            *ngIf="
                                form.get('username')?.invalid &&
                                form.get('username')?.touched
                            "
                            class="error-message"
                        >
                            Benutzername ist erforderlich
                        </div>
                    </div>

                    <!-- Passwort -->
                    <div class="form-group">
                        <label for="password">Passwort</label>
                        <input
                            id="password"
                            type="password"
                            formControlName="password"
                            class="form-control"
                            placeholder="••••••"
                            [class.is-invalid]="
                                form.get('password')?.invalid &&
                                form.get('password')?.touched
                            "
                        />
                        <div
                            *ngIf="
                                form.get('password')?.invalid &&
                                form.get('password')?.touched
                            "
                            class="error-message"
                        >
                            Passwort ist erforderlich
                        </div>
                    </div>

                    <!-- Buttons -->
                    <div class="form-actions">
                        <button
                            type="submit"
                            class="btn btn-primary"
                            [disabled]="form.invalid || isSubmitting"
                        >
                            {{
                                isSubmitting ? 'Wird angemeldet...' : 'Anmelden'
                            }}
                        </button>
                    </div>

                    <!-- Demo-Hinweis -->
                    <div class="demo-hint">
                        <small>
                            <strong>Demo-Login:</strong> Benutzername: admin,
                            Passwort: p
                        </small>
                    </div>
                </form>
            </div>
        </div>
    `,
    styles: [
        `
            .login-container {
                min-height: 80vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 2rem;
            }

            .login-card {
                max-width: 400px;
                width: 100%;
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }

            :host-context(.theme-dark) .login-card {
                background: #3a4a5c;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
            }

            h1 {
                margin-bottom: 2rem;
                text-align: center;
                color: #2c3e50;
            }

            :host-context(.theme-dark) h1 {
                color: #ecf0f1;
            }

            .alert {
                padding: 1rem;
                margin-bottom: 1.5rem;
                border-radius: 4px;
            }

            .alert-error {
                background: #fee;
                color: #c33;
                border: 1px solid #fcc;
            }

            :host-context(.theme-dark) .alert-error {
                background: #4a2222;
                color: #ffaaaa;
                border: 1px solid #663333;
            }

            .form-group {
                margin-bottom: 1.5rem;
            }

            .form-group label {
                display: block;
                margin-bottom: 0.5rem;
                font-weight: 500;
                color: #555;
            }

            :host-context(.theme-dark) .form-group label {
                color: #bdc3c7;
            }

            .form-control {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #ddd;
                border-radius: 4px;
                font-size: 1rem;
                transition: border-color 0.3s;
                background: white;
                color: #2c3e50;
            }

            :host-context(.theme-dark) .form-control {
                background: #445566;
                border-color: #556677;
                color: #ecf0f1;
            }

            .form-control:focus {
                outline: none;
                border-color: #3498db;
                box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
            }

            .form-control.is-invalid {
                border-color: #e74c3c;
            }

            .error-message {
                color: #e74c3c;
                font-size: 0.875rem;
                margin-top: 0.5rem;
            }

            .form-actions {
                margin-top: 2rem;
            }

            .btn {
                width: 100%;
                padding: 0.75rem;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.3s;
            }

            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .btn-primary {
                background: #3498db;
                color: white;
            }

            .btn-primary:hover:not(:disabled) {
                background: #2980b9;
            }

            .demo-hint {
                margin-top: 1.5rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 4px;
                text-align: center;
            }

            :host-context(.theme-dark) .demo-hint {
                background: #2c3544;
                color: #95a5a6;
            }
        `,
    ],
})
export class LoginComponent implements OnInit {
    form!: FormGroup;
    loginError: string | null = null;
    isSubmitting = false;
    private returnUrl = '/';

    constructor(
        private readonly fb: FormBuilder,
        private readonly authService: AuthService,
        private readonly router: Router,
        private readonly route: ActivatedRoute,
    ) {}

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

        this.isSubmitting = true;
        this.loginError = null;

        const { username, password } = this.form.value;
        const result = this.authService.login(username, password);

        if (result.success) {
            // Erfolgreich eingeloggt - zur returnUrl navigieren
            this.router.navigate([this.returnUrl]);
        } else {
            // Login fehlgeschlagen
            this.loginError = result.message || 'Login fehlgeschlagen';
            this.isSubmitting = false;
        }
    }
}

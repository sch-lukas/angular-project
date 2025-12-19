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
    templateUrl: './templates/login.component.html',
    styleUrls: ['./templates/login.component.css'],
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

        this.authService.login(username, password).subscribe({
            next: (result) => {
                if (result.success) {
                    // Erfolgreich eingeloggt - zur returnUrl navigieren
                    this.router.navigate([this.returnUrl]);
                } else {
                    // Login fehlgeschlagen
                    this.loginError = result.message || 'Login fehlgeschlagen';
                    this.isSubmitting = false;
                }
            },
            error: () => {
                this.loginError = 'Verbindungsfehler zum Server';
                this.isSubmitting = false;
            },
        });
    }
}

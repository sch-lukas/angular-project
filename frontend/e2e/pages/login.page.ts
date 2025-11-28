import { type Locator, type Page } from '@playwright/test';

/**
 * Page Object für Login-Seite
 */
export class LoginPage {
    readonly page: Page;
    readonly usernameInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly loginHeading: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameInput = page.locator('input[name="username"]');
        this.passwordInput = page.locator('input[name="password"]');
        this.loginButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.alert-danger');
        this.loginHeading = page.locator('h1');
    }

    async goto() {
        await this.page.goto('/login');
    }

    async login(username: string, password: string) {
        await this.usernameInput.fill(username);
        await this.passwordInput.fill(password);
        await this.loginButton.click();
    }

    async isLoggedIn(): Promise<boolean> {
        return this.page.url().includes('/search');
    }

    async getErrorMessage(): Promise<string> {
        return this.errorMessage.textContent() ?? '';
    }
}

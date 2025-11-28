import { expect, test } from '../fixtures/test-fixtures';

test.describe('Login Funktionalität', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('sollte Login-Seite korrekt anzeigen', async ({ loginPage }) => {
        await expect(loginPage.loginHeading).toBeVisible();
        await expect(loginPage.usernameInput).toBeVisible();
        await expect(loginPage.passwordInput).toBeVisible();
        await expect(loginPage.loginButton).toBeVisible();
    });

    test('sollte mit gültigen Credentials erfolgreich einloggen', async ({
        loginPage,
    }) => {
        await loginPage.login('admin', 'p');

        // Sollte zur Search-Seite weitergeleitet werden
        await expect(loginPage.page).toHaveURL(/.*search/);
        const isLoggedIn = await loginPage.isLoggedIn();
        expect(isLoggedIn).toBeTruthy();
    });

    test('sollte Fehlermeldung bei ungültigen Credentials anzeigen', async ({
        loginPage,
    }) => {
        await loginPage.login('invalid', 'wrong');

        // Sollte auf Login-Seite bleiben und Fehler anzeigen
        await expect(loginPage.errorMessage).toBeVisible();
        const errorText = await loginPage.getErrorMessage();
        expect(errorText).toContain('Login fehlgeschlagen');
    });

    test('sollte Fehlermeldung bei leerem Benutzernamen anzeigen', async ({
        loginPage,
    }) => {
        await loginPage.login('', 'password');

        await expect(loginPage.errorMessage).toBeVisible();
    });

    test('sollte Fehlermeldung bei leerem Passwort anzeigen', async ({
        loginPage,
    }) => {
        await loginPage.login('admin', '');

        await expect(loginPage.errorMessage).toBeVisible();
    });
});

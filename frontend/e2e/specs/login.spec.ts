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
        await loginPage.login('admin', 'MnPfKCid!');

        // Warte auf Navigation weg von /login (Redirect zu / oder Landing Page)
        await loginPage.page.waitForURL(
            (url) => !url.pathname.includes('/login'),
            { timeout: 10000 },
        );

        // Sollte nicht mehr auf Login sein
        expect(loginPage.page.url()).not.toContain('/login');
    });

    // HINWEIS: Dieser Test ist temporär übersprungen, da die Keycloak-Antwort
    // bei ungültigen Credentials im Dev-Modus manchmal zu lange dauert
    test.skip('sollte Fehlermeldung bei ungültigen Credentials anzeigen', async ({
        loginPage,
    }) => {
        await loginPage.login('falscheruser', 'falschespasswort');

        // Warte auf Fehleranzeige (Server-Response kann dauern)
        // Die Klasse ist "alert alert-error"
        await expect(loginPage.page.locator('.alert.alert-error')).toBeVisible({
            timeout: 10000,
        });
    });
});

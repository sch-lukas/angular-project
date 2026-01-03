import { test as base } from '@playwright/test';
import { CreatePage } from '../pages/create.page';
import { DetailPage } from '../pages/detail.page';
import { LoginPage } from '../pages/login.page';
import { SearchPage } from '../pages/search.page';

/**
 * Erweiterte Fixtures mit Page Objects und Authentication
 */
type Fixtures = {
    loginPage: LoginPage;
    searchPage: SearchPage;
    detailPage: DetailPage;
    createPage: CreatePage;
    authenticatedPage: SearchPage;
};

export const test = base.extend<Fixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    searchPage: async ({ page }, use) => {
        const searchPage = new SearchPage(page);
        await use(searchPage);
    },

    detailPage: async ({ page }, use) => {
        const detailPage = new DetailPage(page);
        await use(detailPage);
    },

    createPage: async ({ page }, use) => {
        const createPage = new CreatePage(page);
        await use(createPage);
    },

    /**
     * Authenticated Page Fixture - automatisch eingeloggt
     * Nutzt Admin-Credentials (admin/p)
     */
    authenticatedPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await loginPage.goto();

        // Warte bis Login-Seite geladen ist
        await page.waitForSelector('#username', { timeout: 10000 });

        await loginPage.login('admin', 'p');

        // Warte auf erfolgreiche Navigation weg von /login
        // Die App navigiert standardmäßig zu "/" nach dem Login
        try {
            await page.waitForURL((url) => !url.pathname.includes('/login'), {
                timeout: 15000,
            });
        } catch {
            // Falls Login fehlschlägt, prüfe ob wir noch auf Login sind
            const currentUrl = page.url();
            if (currentUrl.includes('/login')) {
                throw new Error(
                    `Login failed - still on login page. Check if backend and Keycloak are running.`,
                );
            }
        }

        const searchPage = new SearchPage(page);
        // Navigiere zu /search nach erfolgreichem Login
        await searchPage.goto();
        await use(searchPage);
    },
});

export { expect } from '@playwright/test';

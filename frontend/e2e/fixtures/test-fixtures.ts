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
        await loginPage.login('admin', 'p');

        // Warte auf erfolgreiche Navigation
        await page.waitForURL('**/search');

        const searchPage = new SearchPage(page);
        await use(searchPage);
    },
});

export { expect } from '@playwright/test';

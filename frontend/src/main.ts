/* eslint-disable unicorn/prefer-top-level-await */
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { CarouselTestComponent } from './app/carousel-test.component';
import { authGuard } from './app/core/auth.guard';
import { authInterceptor } from './app/core/auth.interceptor';
import { LoginComponent } from './app/features/auth/login.component';
import { CartComponent } from './app/features/buch/cart/cart.component';
import { DetailComponent } from './app/features/buch/pages/detail.component';
import { LandingPageComponent } from './app/features/buch/pages/landing-page.component';
import { NewComponent } from './app/features/buch/pages/new.component';
import { SearchComponent } from './app/features/buch/pages/search.component';
import { WishlistComponent } from './app/features/buch/wishlist/wishlist.component';
import { ImpressumComponent } from './app/features/static/pages/impressum.component';
import { KontaktComponent } from './app/features/static/pages/kontakt.component';

const routes: Routes = [
    { path: '', component: LandingPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'search', component: SearchComponent },
    { path: 'detail/:id', component: DetailComponent },
    { path: 'cart', component: CartComponent },
    { path: 'wishlist', component: WishlistComponent },
    { path: 'carousel-test', component: CarouselTestComponent },
    { path: 'new', component: NewComponent, canMatch: [authGuard] },
    { path: 'kontakt', component: KontaktComponent },
    { path: 'impressum', component: ImpressumComponent },
    { path: '**', redirectTo: '' },
];

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptors([authInterceptor])),
    ],
}).catch((err: Error) => {
    console.error('Bootstrap-Fehler:', err);
});

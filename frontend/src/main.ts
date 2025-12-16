/* eslint-disable unicorn/prefer-top-level-await */
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authGuard } from './app/auth.guard';
import { authInterceptor } from './app/auth.interceptor';
import { CarouselTestComponent } from './app/carousel-test.component';
import { CartComponent } from './app/cart/cart.component';
import { DetailComponent } from './app/detail.component';
import { ImpressumComponent } from './app/impressum.component';
import { KontaktComponent } from './app/kontakt.component';
import { LandingPageComponent } from './app/landing-page.component';
import { LoginComponent } from './app/login.component';
import { NewComponent } from './app/new.component';
import { SearchComponent } from './app/search.component';
import { WishlistComponent } from './app/wishlist/wishlist.component';

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

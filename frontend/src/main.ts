/* eslint-disable unicorn/prefer-top-level-await */
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authGuard } from './app/auth.guard';
import { authInterceptor } from './app/auth.interceptor';
import { CarouselTestComponent } from './app/carousel-test.component';
import { CartComponent } from './app/components/cart.component';
import { DetailComponent } from './app/components/detail.component';
import { ImpressumComponent } from './app/components/impressum.component';
import { KontaktComponent } from './app/components/kontakt.component';
import { LandingPageComponent } from './app/components/landing-page.component';
import { LoginComponent } from './app/components/login.component';
import { NewComponent } from './app/components/new.component';
import { SearchComponent } from './app/components/search.component';
import { WishlistComponent } from './app/components/wishlist.component';

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

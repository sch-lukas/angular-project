import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { DetailComponent } from './app/detail.component';
import { LoginComponent } from './app/login.component';
import { NewComponent } from './app/new.component';
import { SearchComponent } from './app/search.component';

const routes: Routes = [
    { path: '', redirectTo: 'search', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'search', component: SearchComponent },
    { path: 'detail/:id', component: DetailComponent },
    { path: 'new', component: NewComponent },
    { path: '**', redirectTo: 'search' },
];

bootstrapApplication(AppComponent, {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
    ],
}).catch((err) => {
    console.error(err);
});

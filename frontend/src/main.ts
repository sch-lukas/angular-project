/**
 * Angular v21 Application Bootstrap
 *
 * Best Practices nach Angular v21 Style Guide:
 * - provideRouter mit Routes aus separater Datei
 * - withComponentInputBinding() für automatisches Route-Parameter-Binding
 * - provideHttpClient mit Interceptors
 * - Lazy Loading in app.routes.ts für optimale Bundle-Größe
 */
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import {
    provideRouter,
    withComponentInputBinding,
    withRouterConfig,
} from '@angular/router';
import { AppComponent } from './app/app';
import { routes } from './app/app.routes';
import { authInterceptor } from './app/auth.interceptor';

bootstrapApplication(AppComponent, {
    providers: [
        // Angular v21: withComponentInputBinding ermöglicht automatisches
        // Binding von Route-Parametern zu Input-Signals in Komponenten
        provideRouter(
            routes,
            withComponentInputBinding(),
            withRouterConfig({
                // Vererbung von Route-Parametern an Kind-Routen
                paramsInheritanceStrategy: 'always',
            }),
        ),
        // HTTP Client mit Auth-Interceptor
        provideHttpClient(withInterceptors([authInterceptor])),
    ],
}).catch((err: Error) => {
    console.error('Bootstrap-Fehler:', err);
});

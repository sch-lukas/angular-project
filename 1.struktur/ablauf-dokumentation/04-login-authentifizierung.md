# 04 - Login & Authentifizierung

> **Szenario:** Ein Nutzer meldet sich an, um geschützte Funktionen wie "Buch anlegen" oder "Buch löschen" nutzen zu können.

---

## 🔄 Ablauf-Diagramm

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 1. NUTZER-AKTION: Klick auf "Anmelden" im Header                                     │
│                                                                                      │
│    app.component.ts:                                                                 │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ <nav class="app-nav">                                                        │  │
│    │     <a routerLink="/login" *ngIf="!(isLoggedIn$ | async)">                   │  │
│    │         🔐 Anmelden                                                          │  │
│    │     </a>                                                                     │  │
│    │ </nav>                                                                       │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 2. ANGULAR ROUTER: Navigation zur Login-Seite                                        │
│                                                                                      │
│    main.ts:                                                                          │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ const routes: Routes = [                                                     │  │
│    │     { path: 'login', component: LoginComponent },                            │  │
│    │     ...                                                                      │  │
│    │ ];                                                                           │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 3. LOGIN-COMPONENT: Formular initialisieren                                          │
│                                                                                      │
│    login.component.ts:                                                               │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ ngOnInit(): void {                                                           │  │
│    │     this.form = this.fb.group({                                              │  │
│    │         username: ['', Validators.required],                                 │  │
│    │         password: ['', Validators.required]                                  │  │
│    │     });                                                                      │  │
│    │                                                                              │  │
│    │     // ReturnUrl merken (wohin nach Login zurück?)                           │  │
│    │     this.route.queryParams.subscribe(params => {                             │  │
│    │         this.returnUrl = params['returnUrl'] || '/';                         │  │
│    │     });                                                                      │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 4. NUTZER: Eingabe von Benutzername und Passwort                                     │
│                                                                                      │
│    Login-Formular:                                                                   │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │  ╔═══════════════════════════════════════════════════════════════════════╗  │  │
│    │  ║                           Login                                       ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  Benutzername: [admin_______________]                                 ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║  Passwort:     [MnPfKCid!_________]                                 ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ║              [        Anmelden        ]                               ║  │  │
│    │  ║                                                                       ║  │  │
│    │  ╚═══════════════════════════════════════════════════════════════════════╝  │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    Login-Zugangsdaten:                                                               │
│    - Admin: admin / MnPfKCid!                                                        │
│    - User:  user  / MnPfKCid!                                                        │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 5. FORM SUBMIT: onSubmit() wird aufgerufen                                           │
│                                                                                      │
│    login.component.ts:                                                               │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ onSubmit(): void {                                                           │  │
│    │     this.form.markAllAsTouched();  // Validierung triggern                   │  │
│    │     if (this.form.invalid) return;                                           │  │
│    │                                                                              │  │
│    │     this.isSubmitting = true;                                                │  │
│    │     this.loginError = null;                                                  │  │
│    │                                                                              │  │
│    │     const { username, password } = this.form.value;                          │  │
│    │     this.authService.login(username, password).subscribe({...});             │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 6. AUTH-SERVICE: Login-Request senden                                                │
│                                                                                      │
│    auth.service.ts:                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ login(username: string, password: string): Observable<LoginResult> {         │  │
│    │     const url = '/auth/token';  // Relativ - Proxy leitet weiter             │  │
│    │     const body = { username, password };                                     │  │
│    │                                                                              │  │
│    │     return this.http.post<TokenResponse>(url, body).pipe(                    │  │
│    │         map(response => {                                                    │  │
│    │             // Token speichern                                               │  │
│    │             localStorage.setItem('buchspa_token', response.access_token);    │  │
│    │                                                                              │  │
│    │             // Auth-State aktualisieren                                      │  │
│    │             const newState = { isLoggedIn: true, username, token: ... };     │  │
│    │             this.authState$.next(newState);                                  │  │
│    │                                                                              │  │
│    │             return { success: true };                                        │  │
│    │         }),                                                                  │  │
│    │         catchError(error => of({ success: false, message: '...' }))          │  │
│    │     );                                                                       │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼  HTTP POST /auth/token
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 7. PROXY: Request an Backend weiterleiten                                            │
│                                                                                      │
│    proxy.conf.json:                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ {                                                                            │  │
│    │     "/auth/*": {                                                             │  │
│    │         "target": "https://localhost:3000",                                  │  │
│    │         "secure": false,   // Selbstsigniertes Zertifikat erlauben           │  │
│    │         "changeOrigin": true                                                 │  │
│    │     }                                                                        │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    http://localhost:4200/auth/token → https://localhost:3000/auth/token              │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 8. BACKEND: Token Controller empfängt Anfrage                                        │
│                                                                                      │
│    src/security/keycloak/token-controller.ts:                                        │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ @Controller('auth')                                                          │  │
│    │ export class TokenController {                                               │  │
│    │     @Post('token')                                                           │  │
│    │     @Public()                                                                │  │
│    │     async getToken(@Body() credentials: LoginDto) {                          │  │
│    │         const { username, password } = credentials;                          │  │
│    │         return this.keycloakService.getToken(username, password);            │  │
│    │     }                                                                        │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 9. KEYCLOAK SERVICE: Authentifizierung bei Keycloak                                  │
│                                                                                      │
│    src/security/keycloak/keycloak-service.ts:                                        │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ async getToken(username: string, password: string) {                         │  │
│    │     const keycloakUrl = 'http://localhost:8080/realms/master/...';           │  │
│    │                                                                              │  │
│    │     const response = await fetch(keycloakUrl, {                              │  │
│    │         method: 'POST',                                                      │  │
│    │         headers: { 'Content-Type': 'application/x-www-form-urlencoded' },    │  │
│    │         body: new URLSearchParams({                                          │  │
│    │             grant_type: 'password',                                          │  │
│    │             client_id: 'nest-client',                                        │  │
│    │             username,                                                        │  │
│    │             password                                                         │  │
│    │         })                                                                   │  │
│    │     });                                                                      │  │
│    │                                                                              │  │
│    │     return response.json();  // { access_token, refresh_token, ... }         │  │
│    │ }                                                                            │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 10. KEYCLOAK: Validierung und Token-Erstellung                                       │
│                                                                                      │
│    Keycloak (Identity Provider):                                                     │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ 1. Prüfe: Existiert User "admin"?  ✓                                         │  │
│    │ 2. Prüfe: Stimmt Passwort?         ✓                                         │  │
│    │ 3. Generiere JWT Token mit:                                                  │  │
│    │    - sub: User-ID                                                            │  │
│    │    - preferred_username: "admin"                                             │  │
│    │    - roles: ["admin", "user"]                                                │  │
│    │    - exp: Ablaufzeit (z.B. 5 Minuten)                                        │  │
│    │ 4. Signiere Token mit privatem Schlüssel                                     │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    Response:                                                                         │
│    {                                                                                 │
│        "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",                             │
│        "expires_in": 300,                                                            │
│        "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI...",                            │
│        "refresh_expires_in": 1800                                                    │
│    }                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 11. FRONTEND: Token speichern und State aktualisieren                                │
│                                                                                      │
│    auth.service.ts:                                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ // Token in localStorage speichern                                           │  │
│    │ localStorage.setItem('buchspa_token', response.access_token);                │  │
│    │                                                                              │  │
│    │ // Auth-State aktualisieren (BehaviorSubject)                                │  │
│    │ const newState: AuthState = {                                                │  │
│    │     isLoggedIn: true,                                                        │  │
│    │     username: 'admin',                                                       │  │
│    │     token: response.access_token                                             │  │
│    │ };                                                                           │  │
│    │ this.authState$.next(newState);                                              │  │
│    │                                                                              │  │
│    │ // isLoggedIn$ Observable aktualisiert sich automatisch                      │  │
│    │ // → Header zeigt "Abmelden" statt "Anmelden"                                │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 12. NAVIGATION: Zurück zur vorherigen Seite                                          │
│                                                                                      │
│    login.component.ts:                                                               │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ this.authService.login(username, password).subscribe({                       │  │
│    │     next: (result) => {                                                      │  │
│    │         if (result.success) {                                                │  │
│    │             this.router.navigate([this.returnUrl]);  // z.B. '/'             │  │
│    │         }                                                                    │  │
│    │     }                                                                        │  │
│    │ });                                                                          │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ 13. UI UPDATE: Header zeigt eingeloggten Status                                      │
│                                                                                      │
│    app.component.ts (Template):                                                      │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ <!-- Vorher: -->                                                             │  │
│    │ <a routerLink="/login">🔐 Anmelden</a>                                       │  │
│    │                                                                              │  │
│    │ <!-- Nachher: -->                                                            │  │
│    │ <span class="user-info">👤 admin</span>                                      │  │
│    │ <button (click)="logout()">🚪 Abmelden</button>                              │  │
│    │ <a routerLink="/buch/neu">➕ Neues Buch</a>  <!-- Nur für Admin sichtbar --> │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Auth-Interceptor für geschützte Requests

Nach dem Login wird der JWT Token automatisch zu allen HTTP Requests hinzugefügt:

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AUTH INTERCEPTOR: Token zu Requests hinzufügen                                       │
│                                                                                      │
│    auth.interceptor.ts:                                                              │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ export const authInterceptor: HttpInterceptorFn = (req, next) => {           │  │
│    │     const authService = inject(AuthService);                                 │  │
│    │     const token = authService.getToken();                                    │  │
│    │                                                                              │  │
│    │     if (token) {                                                             │  │
│    │         // Request klonen und Authorization Header hinzufügen                │  │
│    │         const authReq = req.clone({                                          │  │
│    │             headers: req.headers.set('Authorization', `Bearer ${token}`)     │  │
│    │         });                                                                  │  │
│    │         return next(authReq);                                                │  │
│    │     }                                                                        │  │
│    │                                                                              │  │
│    │     return next(req);                                                        │  │
│    │ };                                                                           │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    Jeder HTTP Request (nach Login):                                                  │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ POST /rest/buch                                                              │  │
│    │ Headers:                                                                     │  │
│    │   Content-Type: application/json                                             │  │
│    │   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI...                       │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Auth-Guard für geschützte Routen

```text
┌─────────────────────────────────────────────────────────────────────────────────────┐
│ AUTH GUARD: Route schützen                                                           │
│                                                                                      │
│    main.ts:                                                                          │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ const routes: Routes = [                                                     │  │
│    │     {                                                                        │  │
│    │         path: 'buch/neu',                                                    │  │
│    │         component: NewComponent,                                             │  │
│    │         canActivate: [authGuard]  // ◄── Geschützte Route                   │  │
│    │     }                                                                        │  │
│    │ ];                                                                           │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│    auth.guard.ts:                                                                    │
│    ┌─────────────────────────────────────────────────────────────────────────────┐  │
│    │ export const authGuard: CanActivateFn = (route, state) => {                  │  │
│    │     const authService = inject(AuthService);                                 │  │
│    │     const router = inject(Router);                                           │  │
│    │                                                                              │  │
│    │     if (authService.isLoggedIn()) {                                          │  │
│    │         return true;  // ✓ Zugriff erlaubt                                   │  │
│    │     }                                                                        │  │
│    │                                                                              │  │
│    │     // ✗ Nicht eingeloggt → Redirect zu Login mit returnUrl                  │  │
│    │     return router.createUrlTree(['/login'], {                                │  │
│    │         queryParams: { returnUrl: state.url }                                │  │
│    │     });                                                                      │  │
│    │ };                                                                           │  │
│    └─────────────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Beteiligte Dateien

### Frontend

| Datei                                                     | Rolle                              |
| --------------------------------------------------------- | ---------------------------------- |
| `frontend/src/app/features/auth/pages/login.component.ts` | Login-Formular (290 Zeilen)        |
| `frontend/src/app/core/services/auth.service.ts`          | Auth-State Management (175 Zeilen) |
| `frontend/src/app/core/guards/auth.guard.ts`              | Route Protection (22 Zeilen)       |
| `frontend/src/app/core/interceptors/auth.interceptor.ts`  | Token zu Requests (27 Zeilen)      |
| `frontend/proxy.conf.json`                                | Dev-Server Proxy Konfiguration     |

### Backend

| Datei                                       | Rolle                |
| ------------------------------------------- | -------------------- |
| `src/security/keycloak/token-controller.ts` | Token Endpoint       |
| `src/security/keycloak/keycloak-service.ts` | Keycloak Integration |
| `src/security/keycloak/module.ts`           | Security Module      |

---

## 🔑 Wichtige Konzepte

### 1. JWT Token Struktur

```text
Header.Payload.Signature

Header: { "alg": "RS256", "typ": "JWT" }
Payload: {
    "sub": "user-uuid",
    "preferred_username": "admin",
    "realm_access": { "roles": ["admin"] },
    "exp": 1703001600
}
Signature: RSASHA256(base64(header) + "." + base64(payload), privateKey)
```

### 2. State Management mit BehaviorSubject

```typescript
// BehaviorSubject speichert immer den letzten Wert
private authState$ = new BehaviorSubject<AuthState>({ isLoggedIn: false, ... });

// Observable für Komponenten
readonly isLoggedIn$ = this.authState$.pipe(map(s => s.isLoggedIn));

// In Template mit async Pipe
<div *ngIf="isLoggedIn$ | async">Eingeloggt!</div>
```

### 3. localStorage Persistenz

```typescript
// Token bleibt auch nach Browser-Refresh erhalten
localStorage.setItem('buchspa_token', token);

// Beim App-Start: Token wiederherstellen
const token = localStorage.getItem('buchspa_token');
```

---

_Weiter zu: [05-buch-neu-anlegen.md](05-buch-neu-anlegen.md)_

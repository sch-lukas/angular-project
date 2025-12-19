import { Component } from '@angular/core';

@Component({
    selector: 'app-kontakt',
    standalone: true,
    template: `
        <div class="kontakt-page">
            <h1>Kontakt</h1>
            <div class="kontakt-content">
                <h2>Kontaktieren Sie uns</h2>
                <p>
                    <strong>E-Mail:</strong>
                    <a href="mailto:info@buch-spa.de">info&#64;buch-spa.de</a>
                </p>
                <p>
                    <strong>Telefon:</strong>
                    <a href="tel:+49721123456">+49 (0) 721 / 123456</a>
                </p>
                <p>
                    <strong>Adresse:</strong>
                    <br />
                    Buch SPA GmbH<br />
                    Hochschule Karlsruhe<br />
                    Moltkestr. 30<br />
                    76133 Karlsruhe
                </p>
                <p>
                    <strong>Öffnungszeiten:</strong>
                    <br />
                    Mo–Fr: 08:00 – 17:00 Uhr<br />
                    Sa–So: Geschlossen
                </p>
            </div>
        </div>
    `,
    styles: [
        `
            .kontakt-page {
                max-width: 600px;
                margin: 0 auto;
            }

            h1 {
                margin-top: 0;
            }

            .kontakt-content {
                background: var(--app-surface);
                padding: 24px;
                border-radius: 8px;
            }

            .kontakt-content h2 {
                margin-top: 0;
            }

            .kontakt-content p {
                margin: 12px 0;
                line-height: 1.6;
            }

            .kontakt-content a {
                color: var(--color-accent);
                text-decoration: none;
            }

            .kontakt-content a:hover {
                text-decoration: underline;
            }
        `,
    ],
})
export class KontaktComponent {}

import { Component } from '@angular/core';

@Component({
    selector: 'app-impressum',
    standalone: true,
    template: `
        <div class="impressum-page">
            <h1>Impressum</h1>
            <div class="impressum-content">
                <h2>Angaben gemäß § 5 TMG</h2>
                <p>
                    <strong>Betreiber:</strong><br />
                    Buch SPA GmbH<br />
                    Hochschule Karlsruhe<br />
                    Moltkestr. 30<br />
                    76133 Karlsruhe
                </p>
                <p>
                    <strong>Handelsregister:</strong> HRB 123456<br />
                    <strong>Registergericht:</strong> Amtsgericht Karlsruhe<br />
                    <strong>USt.-ID:</strong> DE123456789
                </p>
                <h2>Haftung für Inhalte</h2>
                <p>
                    Die Inhalte unserer Seiten wurden mit größter Sorgfalt
                    erstellt. Für die Richtigkeit, Vollständigkeit und
                    Aktualität der Inhalte können wir jedoch keine Gewähr
                    übernehmen.
                </p>
                <h2>Haftung für Links</h2>
                <p>
                    Unser Angebot enthält Links zu externen Websites Dritter,
                    auf deren Inhalte wir keinen Einfluss haben. Deshalb können
                    wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                </p>
                <h2>Datenschutz</h2>
                <p>
                    Die Nutzung unserer Website ist in der Regel ohne Angabe
                    personenbezogener Daten möglich. Soweit auf unseren Seiten
                    personenbezogene Daten erhoben werden, erfolgt dies stets
                    auf freiwilliger Basis.
                </p>
            </div>
        </div>
    `,
    styles: [
        `
            .impressum-page {
                max-width: 800px;
                margin: 0 auto;
            }

            h1 {
                margin-top: 0;
            }

            .impressum-content {
                background: var(--app-surface);
                padding: 24px;
                border-radius: 8px;
            }

            .impressum-content h2 {
                margin-top: 24px;
                margin-bottom: 12px;
            }

            .impressum-content p {
                margin: 12px 0;
                line-height: 1.6;
            }
        `,
    ],
})
export class ImpressumComponent {}

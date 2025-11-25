import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
    selector: 'app-new',
    standalone: true,
    imports: [CommonModule],
    template: `
        <h1>Neu anlegen (Dummy)</h1>
        <p>Hier kommt später das Formular zum Anlegen neuer Einträge hin.</p>
    `,
})
export class NewComponent {}

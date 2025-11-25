import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-detail',
    standalone: true,
    imports: [CommonModule],
    template: `
        <h1>Detailansicht (Dummy)</h1>
        <p>Hier werden später die Details eines Eintrags angezeigt.</p>
        <p>ID: {{ id }}</p>
    `,
})
export class DetailComponent implements OnInit {
    id: string | null = null;
    constructor(private route: ActivatedRoute) {}
    ngOnInit(): void {
        this.id = this.route.snapshot.paramMap.get('id');
    }
}

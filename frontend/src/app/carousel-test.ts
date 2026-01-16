import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-carousel-test',
    standalone: true,
    imports: [CommonModule, NgbCarouselModule],
    templateUrl: './carousel-test.html',
})
export class CarouselTestComponent {}

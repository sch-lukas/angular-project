import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-carousel-test',
    standalone: true,
    imports: [CommonModule, NgbCarouselModule],
    template: `
        <div class="container my-5">
            <h2>🎠 Karussell-Test</h2>
            <p>
                Wenn du dieses Karussell siehst, funktioniert ng-bootstrap
                korrekt:
            </p>

            <div
                style="background: #f0f0f0; padding: 20px; border-radius: 8px;"
            >
                <ngb-carousel>
                    <ng-template ngbSlide>
                        <div
                            style="text-align: center; padding: 40px; background: #ff6b6b; color: white; border-radius: 8px;"
                        >
                            <h3>Slide 1 ✅</h3>
                            <p>Erstes Test-Slide</p>
                        </div>
                    </ng-template>
                    <ng-template ngbSlide>
                        <div
                            style="text-align: center; padding: 40px; background: #4ecdc4; color: white; border-radius: 8px;"
                        >
                            <h3>Slide 2 ✅</h3>
                            <p>Zweites Test-Slide</p>
                        </div>
                    </ng-template>
                    <ng-template ngbSlide>
                        <div
                            style="text-align: center; padding: 40px; background: #45b7d1; color: white; border-radius: 8px;"
                        >
                            <h3>Slide 3 ✅</h3>
                            <p>Drittes Test-Slide</p>
                        </div>
                    </ng-template>
                </ngb-carousel>
            </div>

            <div class="mt-4 alert alert-info">
                <strong>ℹ️ Hinweis:</strong> Nutze die Pfeile oder swipe zum
                Navigieren.
            </div>
        </div>
    `,
})
export class CarouselTestComponent {}

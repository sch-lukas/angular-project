/**
 * Admin Analytics Dashboard - Live-Besucher-Tracking
 */
import { CommonModule } from '@angular/common';
import {
    ChangeDetectorRef,
    Component,
    NgZone,
    OnDestroy,
    OnInit,
    inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth';
import {
    AnalyticsWebSocketService,
    type AnalyticsData,
} from './analytics-websocket';

@Component({
    selector: 'app-analytics-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './analytics-dashboard.html',
    styleUrls: ['./analytics-dashboard.css'],
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
    private readonly analyticsService = inject(AnalyticsWebSocketService);
    private readonly authService = inject(AuthService);
    private readonly ngZone = inject(NgZone);
    private readonly cdr = inject(ChangeDetectorRef);

    private subscription: Subscription | null = null;
    private connectionSub: Subscription | null = null;

    analyticsData: AnalyticsData | null = null;
    isConnected = false;
    isAdmin = false;

    ngOnInit(): void {
        // Prüfen ob Admin
        this.isAdmin = this.authService.isAdmin();

        if (!this.isAdmin) {
            return;
        }

        // Falls noch nicht verbunden, verbinden (ohne Admin-Flag, das wird später gesetzt)
        // NICHT disconnect() aufrufen - das würde die normale Session löschen!
        if (!this.analyticsService.isConnected()) {
            this.analyticsService.connect(false);
        }

        // Verbindungsstatus abonnieren
        this.connectionSub = this.analyticsService.connected$.subscribe(
            (connected) => {
                this.ngZone.run(() => {
                    console.log(
                        'Dashboard: Connection status changed:',
                        connected,
                    );
                    this.isConnected = connected;
                    this.cdr.detectChanges();
                    if (connected) {
                        // Admin-Room beitreten um Updates zu erhalten
                        this.analyticsService.joinAdminRoom();
                    }
                });
            },
        );

        // Analytics-Daten abonnieren - NgZone.run() für Change Detection
        this.subscription = this.analyticsService.analyticsData$.subscribe(
            (data) => {
                this.ngZone.run(() => {
                    console.log('Dashboard: Updating analyticsData', data);
                    this.analyticsData = data;
                    // Explizit Change Detection triggern
                    this.cdr.detectChanges();
                });
            },
        );
    }

    ngOnDestroy(): void {
        if (this.isAdmin) {
            this.analyticsService.leaveAdminRoom();
        }
        this.subscription?.unsubscribe();
        this.connectionSub?.unsubscribe();
    }
}

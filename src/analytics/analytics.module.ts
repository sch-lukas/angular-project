/**
 * Analytics Module - WebSocket für Live-Tracking
 */
import { Module } from '@nestjs/common';
import { AnalyticsGateway } from './analytics.gateway.js';
import { AnalyticsService } from './analytics.service.js';

@Module({
    providers: [AnalyticsGateway, AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule {}

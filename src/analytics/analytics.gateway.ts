/**
 * WebSocket Gateway für Live-Analytics
 * Empfängt Events von Frontend-Clients und broadcastet Updates an Admin-Dashboard
 */
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import type { Server, Socket } from 'socket.io';
import { getLogger } from '../logger/logger.js';
import {
    AnalyticsService,
    type CartItem,
    type WishlistItem,
} from './analytics.service.js';

const logger = getLogger(import.meta.url);

@WebSocketGateway({
    cors: {
        origin: '*',
        credentials: true,
    },
    // Kein Namespace - einfacher für Proxy-Konfiguration
})
export class AnalyticsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server!: Server;

    readonly #analyticsService: AnalyticsService;

    constructor(analyticsService: AnalyticsService) {
        this.#analyticsService = analyticsService;
    }

    handleConnection(client: Socket) {
        const sessionId = client.handshake.query['sessionId'] as string;
        const isAdmin = client.handshake.query['isAdmin'] === 'true';
        const userAgent = client.handshake.headers['user-agent'] ?? 'Unknown';

        logger.info(
            `Client connected: ${client.id}, Session: ${sessionId}, Admin: ${isAdmin}`,
        );

        // Server-Start-Zeit an den Client senden (für Cart/Wishlist Reset-Erkennung)
        client.emit('server-info', {
            serverStartTime: this.#analyticsService.serverStartTime,
        });

        if (isAdmin) {
            // Admin-Client verbindet sich - zum Admin-Room hinzufügen
            client.join('admin-room');
            // Sende aktuelle Daten
            client.emit(
                'analytics-update',
                this.#analyticsService.getAnalyticsData(),
            );
        } else if (sessionId) {
            // Normaler Besucher
            this.#analyticsService.addSession(sessionId, {
                socketId: client.id,
                userAgent,
                connectedAt: new Date(),
            });
            this.broadcastToAdmins();
        }
    }

    handleDisconnect(client: Socket) {
        const sessionId = client.handshake.query['sessionId'] as string;
        logger.info(`Client disconnected: ${client.id}, Session: ${sessionId}`);

        if (sessionId) {
            this.#analyticsService.removeSession(sessionId);
            this.broadcastToAdmins();
        }
    }

    @SubscribeMessage('cart-update')
    handleCartUpdate(
        @MessageBody() data: { sessionId: string; items: CartItem[] },
    ) {
        logger.debug(
            `Cart update from ${data.sessionId}: ${data.items.length} items`,
        );
        this.#analyticsService.updateCart(data.sessionId, data.items);
        this.broadcastToAdmins();
    }

    @SubscribeMessage('wishlist-update')
    handleWishlistUpdate(
        @MessageBody() data: { sessionId: string; items: WishlistItem[] },
    ) {
        logger.debug(
            `Wishlist update from ${data.sessionId}: ${data.items.length} items`,
        );
        this.#analyticsService.updateWishlist(data.sessionId, data.items);
        this.broadcastToAdmins();
    }

    @SubscribeMessage('book-viewed')
    handleBookViewed(
        @MessageBody()
        data: {
            sessionId: string;
            bookId: number;
            title: string;
        },
    ) {
        logger.debug(
            `Book viewed by ${data.sessionId}: ${data.bookId} - ${data.title}`,
        );
        this.#analyticsService.addViewedBook(
            data.sessionId,
            data.bookId,
            data.title,
        );
        this.broadcastToAdmins();
    }

    @SubscribeMessage('page-view')
    handlePageView(@MessageBody() data: { sessionId: string; page: string }) {
        logger.debug(`Page view by ${data.sessionId}: ${data.page}`);
        this.#analyticsService.updateCurrentPage(data.sessionId, data.page);
        this.broadcastToAdmins();
    }

    @SubscribeMessage('ping')
    handlePing(@ConnectedSocket() client: Socket) {
        logger.info(`PING received from ${client.id}`);
        client.emit('pong', { message: 'pong', timestamp: Date.now() });
        return { event: 'pong', data: { message: 'pong' } };
    }

    @SubscribeMessage('request-analytics')
    handleRequestAnalytics(@ConnectedSocket() client: Socket) {
        logger.info(`Analytics data requested by ${client.id}`);
        const data = this.#analyticsService.getAnalyticsData();
        logger.info(`Sending analytics data: ${JSON.stringify(data)}`);
        client.emit('analytics-update', data);
        return { event: 'analytics-update', data };
    }

    @SubscribeMessage('join-admin')
    handleJoinAdmin(@ConnectedSocket() client: Socket) {
        logger.info(`Client ${client.id} joining admin room`);
        client.join('admin-room');
        client.emit(
            'analytics-update',
            this.#analyticsService.getAnalyticsData(),
        );
    }

    @SubscribeMessage('leave-admin')
    handleLeaveAdmin(@ConnectedSocket() client: Socket) {
        logger.info(`Client ${client.id} leaving admin room`);
        client.leave('admin-room');
    }

    private broadcastToAdmins() {
        this.server
            .to('admin-room')
            .emit(
                'analytics-update',
                this.#analyticsService.getAnalyticsData(),
            );
    }
}

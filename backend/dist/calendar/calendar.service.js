"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const prisma_service_1 = require("../common/prisma.service");
let CalendarService = class CalendarService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.oauth2Client = new googleapis_1.google.auth.OAuth2(this.configService.get('GOOGLE_CLIENT_ID'), this.configService.get('GOOGLE_CLIENT_SECRET'), this.configService.get('GOOGLE_REDIRECT_URI'));
    }
    getAuthUrl() {
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/userinfo.email',
        ];
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent',
        });
    }
    async handleCallback(code, userId) {
        try {
            const { tokens } = await this.oauth2Client.getAccessToken(code);
            // Save tokens to database
            await this.prisma.googleToken.upsert({
                where: { userId },
                update: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || undefined,
                    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                    scope: tokens.scope,
                },
                create: {
                    userId,
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || undefined,
                    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                    scope: tokens.scope,
                },
            });
            return { success: true };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to authenticate with Google');
        }
    }
    async getCalendarClient(userId) {
        const tokenData = await this.prisma.googleToken.findUnique({
            where: { userId },
        });
        if (!tokenData) {
            throw new common_1.BadRequestException('Google Calendar not connected');
        }
        this.oauth2Client.setCredentials({
            access_token: tokenData.accessToken,
            refresh_token: tokenData.refreshToken,
        });
        return googleapis_1.google.calendar({ version: 'v3', auth: this.oauth2Client });
    }
    async createEvent(userId, eventData) {
        const calendar = await this.getCalendarClient(userId);
        try {
            const event = await calendar.events.insert({
                calendarId: 'primary',
                requestBody: eventData,
            });
            return event.data;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to create calendar event');
        }
    }
    async updateEvent(userId, eventId, eventData) {
        const calendar = await this.getCalendarClient(userId);
        try {
            const event = await calendar.events.update({
                calendarId: 'primary',
                eventId,
                requestBody: eventData,
            });
            return event.data;
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to update calendar event');
        }
    }
    async deleteEvent(userId, eventId) {
        const calendar = await this.getCalendarClient(userId);
        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId,
            });
            return { success: true };
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to delete calendar event');
        }
    }
    async getFreeBusy(userId, timeMin, timeMax) {
        const calendar = await this.getCalendarClient(userId);
        try {
            const response = await calendar.freebusy.query({
                requestBody: {
                    timeMin,
                    timeMax,
                    items: [{ id: 'primary' }],
                },
            });
            return response.data.calendars?.['primary']?.busy || [];
        }
        catch (error) {
            throw new common_1.BadRequestException('Failed to get free/busy information');
        }
    }
    async syncCalendar(userId) {
        const tokenData = await this.prisma.googleToken.findUnique({
            where: { userId },
        });
        if (!tokenData) {
            throw new common_1.BadRequestException('Google Calendar not connected');
        }
        const calendar = await this.getCalendarClient(userId);
        try {
            // Get events since last sync
            const params = {
                calendarId: 'primary',
                maxResults: 250,
            };
            if (tokenData.syncToken) {
                params.syncToken = tokenData.syncToken;
            }
            else {
                // If no sync token, get events from last 30 days
                const now = new Date();
                const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                params.timeMin = thirtyDaysAgo.toISOString();
            }
            const response = await calendar.events.list(params);
            // Update sync token
            if (response.data.nextSyncToken) {
                await this.prisma.googleToken.update({
                    where: { userId },
                    data: { syncToken: response.data.nextSyncToken },
                });
            }
            return response.data.items || [];
        }
        catch (error) {
            // If sync token is invalid, do full sync
            if (error.code === 410) {
                await this.prisma.googleToken.update({
                    where: { userId },
                    data: { syncToken: null },
                });
                return this.syncCalendar(userId);
            }
            throw new common_1.BadRequestException('Failed to sync calendar');
        }
    }
};
exports.CalendarService = CalendarService;
exports.CalendarService = CalendarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], CalendarService);
//# sourceMappingURL=calendar.service.js.map
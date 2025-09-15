import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma.service';
export declare class CalendarService {
    private configService;
    private prisma;
    private oauth2Client;
    constructor(configService: ConfigService, prisma: PrismaService);
    getAuthUrl(): any;
    handleCallback(code: string, userId: string): Promise<{
        success: boolean;
    }>;
    getCalendarClient(userId: string): Promise<import("googleapis").calendar_v3.Calendar>;
    createEvent(userId: string, eventData: any): Promise<import("googleapis").calendar_v3.Schema$Event>;
    updateEvent(userId: string, eventId: string, eventData: any): Promise<import("googleapis").calendar_v3.Schema$Event>;
    deleteEvent(userId: string, eventId: string): Promise<{
        success: boolean;
    }>;
    getFreeBusy(userId: string, timeMin: string, timeMax: string): Promise<import("googleapis").calendar_v3.Schema$TimePeriod[]>;
    syncCalendar(userId: string): Promise<any[]>;
}

import { CalendarService } from './calendar.service';
export declare class CalendarController {
    private calendarService;
    constructor(calendarService: CalendarService);
    getAuthUrl(): {
        authUrl: any;
    };
    connectCalendar(req: any, code: string): Promise<{
        success: boolean;
    }>;
    syncCalendar(req: any): Promise<any[]>;
    getFreeBusy(req: any, timeMin: string, timeMax: string): Promise<import("googleapis").calendar_v3.Schema$TimePeriod[]>;
}

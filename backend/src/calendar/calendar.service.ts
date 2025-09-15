import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class CalendarService {
  private oauth2Client: any;

  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );
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

  async handleCallback(code: string, userId: string) {
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
    } catch (error) {
      throw new BadRequestException('Failed to authenticate with Google');
    }
  }

  async getCalendarClient(userId: string) {
    const tokenData = await this.prisma.googleToken.findUnique({
      where: { userId },
    });

    if (!tokenData) {
      throw new BadRequestException('Google Calendar not connected');
    }

    this.oauth2Client.setCredentials({
      access_token: tokenData.accessToken,
      refresh_token: tokenData.refreshToken,
    });

    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async createEvent(userId: string, eventData: any) {
    const calendar = await this.getCalendarClient(userId);
    
    try {
      const event = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });

      return event.data;
    } catch (error) {
      throw new BadRequestException('Failed to create calendar event');
    }
  }

  async updateEvent(userId: string, eventId: string, eventData: any) {
    const calendar = await this.getCalendarClient(userId);
    
    try {
      const event = await calendar.events.update({
        calendarId: 'primary',
        eventId,
        requestBody: eventData,
      });

      return event.data;
    } catch (error) {
      throw new BadRequestException('Failed to update calendar event');
    }
  }

  async deleteEvent(userId: string, eventId: string) {
    const calendar = await this.getCalendarClient(userId);
    
    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      return { success: true };
    } catch (error) {
      throw new BadRequestException('Failed to delete calendar event');
    }
  }

  async getFreeBusy(userId: string, timeMin: string, timeMax: string) {
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
    } catch (error) {
      throw new BadRequestException('Failed to get free/busy information');
    }
  }

  async syncCalendar(userId: string): Promise<any[]> {
    const tokenData = await this.prisma.googleToken.findUnique({
      where: { userId },
    });

    if (!tokenData) {
      throw new BadRequestException('Google Calendar not connected');
    }

    const calendar = await this.getCalendarClient(userId);

    try {
      // Get events since last sync
      const params: any = {
        calendarId: 'primary',
        maxResults: 250,
      };

      if (tokenData.syncToken) {
        params.syncToken = tokenData.syncToken;
      } else {
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
    } catch (error: any) {
      // If sync token is invalid, do full sync
      if (error.code === 410) {
        await this.prisma.googleToken.update({
          where: { userId },
          data: { syncToken: null },
        });
        return this.syncCalendar(userId);
      }
      throw new BadRequestException('Failed to sync calendar');
    }
  }
}
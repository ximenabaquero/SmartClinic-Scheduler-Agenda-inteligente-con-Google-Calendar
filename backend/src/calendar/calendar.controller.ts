import { Controller, Get, Post, UseGuards, Req, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('calendar')
@UseGuards(JwtAuthGuard)
export class CalendarController {
  constructor(private calendarService: CalendarService) {}

  @Get('auth-url')
  getAuthUrl() {
    return {
      authUrl: this.calendarService.getAuthUrl(),
    };
  }

  @Post('connect')
  async connectCalendar(@Req() req: any, @Query('code') code: string) {
    return this.calendarService.handleCallback(code, req.user.sub);
  }

  @Post('sync')
  async syncCalendar(@Req() req: any) {
    return this.calendarService.syncCalendar(req.user.sub);
  }

  @Get('free-busy')
  async getFreeBusy(
    @Req() req: any,
    @Query('timeMin') timeMin: string,
    @Query('timeMax') timeMax: string,
  ) {
    return this.calendarService.getFreeBusy(req.user.sub, timeMin, timeMax);
  }
}
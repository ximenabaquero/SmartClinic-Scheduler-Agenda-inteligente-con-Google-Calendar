import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, ConfirmAppointmentDto } from '../common/dto/appointment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private appointmentsService: AppointmentsService) {}

  @Post()
  async createAppointmentRequest(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.createAppointmentRequest(
      createAppointmentDto,
      req.user.sub,
    );
  }

  @Put(':id/confirm')
  async confirmAppointment(
    @Param('id') id: string,
    @Body() confirmDto: ConfirmAppointmentDto,
    @Req() req: any,
  ) {
    return this.appointmentsService.confirmAppointment(id, confirmDto, req.user.sub);
  }

  @Get()
  async getAppointments(@Req() req: any, @Query('status') status?: string) {
    return this.appointmentsService.getAppointments(req.user.sub, status);
  }

  @Get(':id')
  async getAppointmentById(@Param('id') id: string, @Req() req: any) {
    return this.appointmentsService.getAppointmentById(id, req.user.sub);
  }

  @Delete(':id')
  async cancelAppointment(@Param('id') id: string, @Req() req: any) {
    return this.appointmentsService.cancelAppointment(id, req.user.sub);
  }
}
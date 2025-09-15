import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { CreateAppointmentDto, ConfirmAppointmentDto } from '../common/dto/appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private calendarService: CalendarService,
  ) {}

  async createAppointmentRequest(createAppointmentDto: CreateAppointmentDto, doctorId: string) {
    const {
      patientEmail,
      patientFirstName,
      patientLastName,
      patientPhone,
      serviceId,
      preferredTimeRanges,
      notes,
    } = createAppointmentDto;

    // Get or create patient
    let patient = await this.prisma.patient.findUnique({
      where: { email: patientEmail },
    });

    if (!patient) {
      patient = await this.prisma.patient.create({
        data: {
          email: patientEmail,
          firstName: patientFirstName,
          lastName: patientLastName,
          phone: patientPhone,
        },
      });
    }

    // Get service info
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // Generate suggested slots
    const suggestedSlots = await this.generateSuggestedSlots(
      doctorId,
      service,
      preferredTimeRanges,
    );

    // Create appointment request
    const appointment = await this.prisma.appointment.create({
      data: {
        patientId: patient.id,
        doctorId,
        serviceId,
        duration: service.duration,
        preferredTimes: preferredTimeRanges,
        suggestedSlots,
        notes,
        scheduledAt: new Date(), // Temporary, will be updated when confirmed
      },
      include: {
        patient: true,
        service: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return appointment;
  }

  async confirmAppointment(appointmentId: string, confirmDto: ConfirmAppointmentDto, doctorId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        service: true,
        doctor: true,
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new BadRequestException('Unauthorized to confirm this appointment');
    }

    const scheduledAt = new Date(confirmDto.scheduledAt);

    // Create Google Calendar event
    const eventData = {
      summary: `${appointment.service.name} - ${appointment.patient.firstName} ${appointment.patient.lastName}`,
      description: confirmDto.notes || appointment.notes || '',
      start: {
        dateTime: scheduledAt.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(scheduledAt.getTime() + appointment.duration * 60000).toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        {
          email: appointment.patient.email,
          displayName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
        },
      ],
    };

    let googleEventId: string | undefined;
    try {
      const event = await this.calendarService.createEvent(doctorId, eventData);
      googleEventId = event.id || undefined;
    } catch (error) {
      console.error('Failed to create Google Calendar event:', error);
      // Continue without Google Calendar integration if it fails
    }

    // Update appointment
    const updatedAppointment = await this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: 'CONFIRMED',
        scheduledAt,
        notes: confirmDto.notes || appointment.notes,
        googleEventId,
      },
      include: {
        patient: true,
        service: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return updatedAppointment;
  }

  async getAppointments(doctorId: string, status?: string) {
    const where: any = { doctorId };
    
    if (status) {
      where.status = status;
    }

    return this.prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        service: true,
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async getAppointmentById(appointmentId: string, doctorId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        service: true,
        doctor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new BadRequestException('Unauthorized to view this appointment');
    }

    return appointment;
  }

  async cancelAppointment(appointmentId: string, doctorId: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new BadRequestException('Unauthorized to cancel this appointment');
    }

    // Delete Google Calendar event if exists
    if (appointment.googleEventId) {
      try {
        await this.calendarService.deleteEvent(doctorId, appointment.googleEventId);
      } catch (error) {
        console.error('Failed to delete Google Calendar event:', error);
      }
    }

    // Update appointment status
    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: 'CANCELLED' },
      include: {
        patient: true,
        service: true,
      },
    });
  }

  private async generateSuggestedSlots(
    doctorId: string,
    service: any,
    preferredTimeRanges: any[],
  ) {
    // Get doctor's availability
    const availability = await this.prisma.availability.findMany({
      where: { doctorId, isActive: true },
    });

    // Get existing appointments
    const existingAppointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });

    const suggestedSlots = [];

    for (const timeRange of preferredTimeRanges) {
      const date = new Date(timeRange.date);
      const dayOfWeek = date.getDay();

      // Find availability for this day
      const dayAvailability = availability.find((a: any) => a.dayOfWeek === dayOfWeek);
      
      if (!dayAvailability) continue;

      // Parse time ranges
      const [availStartHour, availStartMin] = dayAvailability.startTime.split(':').map(Number);
      const [availEndHour, availEndMin] = dayAvailability.endTime.split(':').map(Number);
      const [prefStartHour, prefStartMin] = timeRange.start.split(':').map(Number);
      const [prefEndHour, prefEndMin] = timeRange.end.split(':').map(Number);

      // Create availability window
      const availStart = new Date(date);
      availStart.setHours(Math.max(availStartHour, prefStartHour), Math.max(availStartMin, prefStartMin), 0, 0);
      
      const availEnd = new Date(date);
      availEnd.setHours(Math.min(availEndHour, prefEndHour), Math.min(availEndMin, prefEndMin), 0, 0);

      // Generate time slots
      const slotDuration = service.duration + service.buffer;
      let currentSlot = new Date(availStart);

      while (currentSlot.getTime() + service.duration * 60000 <= availEnd.getTime()) {
        const slotEnd = new Date(currentSlot.getTime() + service.duration * 60000);

        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some((apt: any) => {
          const aptStart = new Date(apt.scheduledAt);
          const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
          
          return (
            (currentSlot >= aptStart && currentSlot < aptEnd) ||
            (slotEnd > aptStart && slotEnd <= aptEnd) ||
            (currentSlot <= aptStart && slotEnd >= aptEnd)
          );
        });

        if (!hasConflict) {
          suggestedSlots.push({
            start: currentSlot.toISOString(),
            end: slotEnd.toISOString(),
            score: this.calculateSlotScore(currentSlot, timeRange),
          });
        }

        // Move to next slot
        currentSlot = new Date(currentSlot.getTime() + slotDuration * 60000);
      }
    }

    // Sort by score (higher is better)
    return suggestedSlots
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 suggestions
  }

  private calculateSlotScore(slotStart: Date, preferredRange: any): number {
    const [prefStartHour, prefStartMin] = preferredRange.start.split(':').map(Number);
    const [prefEndHour, prefEndMin] = preferredRange.end.split(':').map(Number);
    
    const preferredStartMinutes = prefStartHour * 60 + prefStartMin;
    const preferredEndMinutes = prefEndHour * 60 + prefEndMin;
    const preferredMidpoint = (preferredStartMinutes + preferredEndMinutes) / 2;
    
    const slotMinutes = slotStart.getHours() * 60 + slotStart.getMinutes();
    
    // Score based on how close to preferred midpoint
    const distance = Math.abs(slotMinutes - preferredMidpoint);
    const maxDistance = 12 * 60; // 12 hours max distance
    
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  }
}
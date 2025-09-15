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
exports.AppointmentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
const calendar_service_1 = require("../calendar/calendar.service");
let AppointmentsService = class AppointmentsService {
    constructor(prisma, calendarService) {
        this.prisma = prisma;
        this.calendarService = calendarService;
    }
    async createAppointmentRequest(createAppointmentDto, doctorId) {
        const { patientEmail, patientFirstName, patientLastName, patientPhone, serviceId, preferredTimeRanges, notes, } = createAppointmentDto;
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
            throw new common_1.NotFoundException('Service not found');
        }
        // Generate suggested slots
        const suggestedSlots = await this.generateSuggestedSlots(doctorId, service, preferredTimeRanges);
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
    async confirmAppointment(appointmentId, confirmDto, doctorId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: {
                patient: true,
                service: true,
                doctor: true,
            },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.doctorId !== doctorId) {
            throw new common_1.BadRequestException('Unauthorized to confirm this appointment');
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
        let googleEventId;
        try {
            const event = await this.calendarService.createEvent(doctorId, eventData);
            googleEventId = event.id || undefined;
        }
        catch (error) {
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
    async getAppointments(doctorId, status) {
        const where = { doctorId };
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
    async getAppointmentById(appointmentId, doctorId) {
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
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.doctorId !== doctorId) {
            throw new common_1.BadRequestException('Unauthorized to view this appointment');
        }
        return appointment;
    }
    async cancelAppointment(appointmentId, doctorId) {
        const appointment = await this.prisma.appointment.findUnique({
            where: { id: appointmentId },
        });
        if (!appointment) {
            throw new common_1.NotFoundException('Appointment not found');
        }
        if (appointment.doctorId !== doctorId) {
            throw new common_1.BadRequestException('Unauthorized to cancel this appointment');
        }
        // Delete Google Calendar event if exists
        if (appointment.googleEventId) {
            try {
                await this.calendarService.deleteEvent(doctorId, appointment.googleEventId);
            }
            catch (error) {
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
    async generateSuggestedSlots(doctorId, service, preferredTimeRanges) {
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
            const dayAvailability = availability.find((a) => a.dayOfWeek === dayOfWeek);
            if (!dayAvailability)
                continue;
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
                const hasConflict = existingAppointments.some((apt) => {
                    const aptStart = new Date(apt.scheduledAt);
                    const aptEnd = new Date(aptStart.getTime() + apt.duration * 60000);
                    return ((currentSlot >= aptStart && currentSlot < aptEnd) ||
                        (slotEnd > aptStart && slotEnd <= aptEnd) ||
                        (currentSlot <= aptStart && slotEnd >= aptEnd));
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
    calculateSlotScore(slotStart, preferredRange) {
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
};
exports.AppointmentsService = AppointmentsService;
exports.AppointmentsService = AppointmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        calendar_service_1.CalendarService])
], AppointmentsService);
//# sourceMappingURL=appointments.service.js.map
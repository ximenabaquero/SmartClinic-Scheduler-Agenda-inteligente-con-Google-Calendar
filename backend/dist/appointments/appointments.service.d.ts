import { PrismaService } from '../common/prisma.service';
import { CalendarService } from '../calendar/calendar.service';
import { CreateAppointmentDto, ConfirmAppointmentDto } from '../common/dto/appointment.dto';
export declare class AppointmentsService {
    private prisma;
    private calendarService;
    constructor(prisma: PrismaService, calendarService: CalendarService);
    createAppointmentRequest(createAppointmentDto: CreateAppointmentDto, doctorId: string): Promise<any>;
    confirmAppointment(appointmentId: string, confirmDto: ConfirmAppointmentDto, doctorId: string): Promise<any>;
    getAppointments(doctorId: string, status?: string): Promise<any>;
    getAppointmentById(appointmentId: string, doctorId: string): Promise<any>;
    cancelAppointment(appointmentId: string, doctorId: string): Promise<any>;
    private generateSuggestedSlots;
    private calculateSlotScore;
}

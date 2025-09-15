import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto, ConfirmAppointmentDto } from '../common/dto/appointment.dto';
export declare class AppointmentsController {
    private appointmentsService;
    constructor(appointmentsService: AppointmentsService);
    createAppointmentRequest(createAppointmentDto: CreateAppointmentDto, req: any): Promise<any>;
    confirmAppointment(id: string, confirmDto: ConfirmAppointmentDto, req: any): Promise<any>;
    getAppointments(req: any, status?: string): Promise<any>;
    getAppointmentById(id: string, req: any): Promise<any>;
    cancelAppointment(id: string, req: any): Promise<any>;
}

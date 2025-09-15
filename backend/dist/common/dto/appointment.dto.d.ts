export declare class CreateAppointmentDto {
    patientEmail: string;
    patientFirstName: string;
    patientLastName: string;
    patientPhone?: string;
    serviceId: string;
    preferredTimeRanges: Array<{
        start: string;
        end: string;
        date: string;
    }>;
    notes?: string;
}
export declare class ConfirmAppointmentDto {
    scheduledAt: string;
    notes?: string;
}

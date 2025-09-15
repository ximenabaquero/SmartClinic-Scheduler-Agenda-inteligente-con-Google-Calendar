import { IsString, IsDateString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class CreateAppointmentDto {
  @IsEmail()
  patientEmail: string;

  @IsString()
  patientFirstName: string;

  @IsString()
  patientLastName: string;

  @IsOptional()
  @IsString()
  patientPhone?: string;

  @IsString()
  serviceId: string;

  @IsArray()
  preferredTimeRanges: Array<{
    start: string;
    end: string;
    date: string;
  }>;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ConfirmAppointmentDto {
  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
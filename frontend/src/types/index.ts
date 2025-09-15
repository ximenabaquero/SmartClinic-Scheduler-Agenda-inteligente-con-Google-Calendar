export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'DOCTOR' | 'STAFF';
  googleCalendarId?: string;
}

export interface Patient {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number;
  buffer: number;
  color: string;
  active: boolean;
  doctorId: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  serviceId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  scheduledAt: string;
  duration: number;
  notes?: string;
  googleEventId?: string;
  preferredTimes?: any;
  suggestedSlots?: any;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  service: Service;
  doctor?: User;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  score?: number;
}
import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import { appointmentService } from '../services/api';
import { formatDateTime, getStatusColor } from '../utils';

export const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getAppointments(filter || undefined);
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (appointment: Appointment, selectedSlot: any) => {
    try {
      await appointmentService.confirmAppointment(appointment.id, selectedSlot.start);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error confirming appointment:', error);
    }
  };

  const handleCancel = async (appointmentId: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await appointmentService.cancelAppointment(appointmentId);
        fetchAppointments(); // Refresh the list
      } catch (error) {
        console.error('Error cancelling appointment:', error);
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading appointments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Appointments</h2>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">All Appointments</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No appointments found.
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {appointment.patient.firstName} {appointment.patient.lastName}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><strong>Service:</strong> {appointment.service.name}</p>
                    <p><strong>Email:</strong> {appointment.patient.email}</p>
                    <p><strong>Duration:</strong> {appointment.duration} minutes</p>
                    <p><strong>Scheduled:</strong> {formatDateTime(appointment.scheduledAt)}</p>
                    {appointment.notes && (
                      <p><strong>Notes:</strong> {appointment.notes}</p>
                    )}
                  </div>

                  {appointment.status === 'PENDING' && appointment.suggestedSlots && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Suggested Time Slots:</h4>
                      <div className="space-y-2">
                        {appointment.suggestedSlots.slice(0, 3).map((slot: any, index: number) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-blue-800">
                              {formatDateTime(slot.start)} - {formatDateTime(slot.end)}
                              {slot.score && (
                                <span className="ml-2 text-xs text-gray-500">
                                  (Score: {Math.round(slot.score)})
                                </span>
                              )}
                            </span>
                            <button
                              onClick={() => handleConfirm(appointment, slot)}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1 rounded"
                            >
                              Confirm
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {appointment.status === 'PENDING' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  )}
                  {appointment.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="bg-gray-500 hover:bg-gray-600 text-white text-sm px-3 py-1 rounded"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
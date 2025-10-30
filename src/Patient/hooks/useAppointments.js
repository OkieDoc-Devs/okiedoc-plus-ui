/**
 * Custom React hook for appointment management
 */

import { useState, useEffect, useCallback } from 'react';
import appointmentService from '../services/appointmentService';

/**
 * Hook to manage appointments
 * @param {boolean} autoLoad - Whether to automatically load appointments on mount
 * @returns {Object} Appointment state and methods
 */
export const useAppointments = (autoLoad = true) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load all appointments
  const loadAppointments = useCallback(() => {
    setLoading(true);
    setError(null);
    
    try {
      appointmentService.initializeDummyTickets();
      const data = appointmentService.getAllAppointments();
      setAppointments(data);
    } catch (err) {
      setError(err.message || 'Failed to load appointments');
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Add new appointment
  const addAppointment = useCallback((appointmentData) => {
    try {
      const newAppointment = appointmentService.addAppointment(appointmentData);
      setAppointments((prev) => [newAppointment, ...prev]);
      return { success: true, appointment: newAppointment };
    } catch (err) {
      setError(err.message || 'Failed to add appointment');
      console.error('Error adding appointment:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Update appointment
  const updateAppointment = useCallback((id, updates) => {
    try {
      const updated = appointmentService.updateAppointment(id, updates);
      if (updated) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? updated : apt))
        );
        return { success: true, appointment: updated };
      }
      return { success: false, error: 'Appointment not found' };
    } catch (err) {
      setError(err.message || 'Failed to update appointment');
      console.error('Error updating appointment:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Delete appointment
  const deleteAppointment = useCallback((id) => {
    try {
      appointmentService.deleteAppointment(id);
      setAppointments((prev) => prev.filter((apt) => apt.id !== id));
      return { success: true };
    } catch (err) {
      setError(err.message || 'Failed to delete appointment');
      console.error('Error deleting appointment:', err);
      return { success: false, error: err.message };
    }
  }, []);

  // Get appointments by status
  const getAppointmentsByStatus = useCallback((status) => {
    return appointments.filter((apt) => apt.status === status);
  }, [appointments]);

  // Refresh appointments
  const refreshAppointments = useCallback(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadAppointments();
    }
  }, [autoLoad, loadAppointments]);

  return {
    appointments,
    loading,
    error,
    loadAppointments,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getAppointmentsByStatus,
    refreshAppointments
  };
};


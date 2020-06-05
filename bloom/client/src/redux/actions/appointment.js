export const DELETE_APPOINTMENT_SUCCESS = 'ADD_APPOINTMENT_SUCCESS'
export const GET_APPOINTMENT_SUCCESS = 'GET_APPOINTMENT_SUCCESS'
export const APPOINTMENT_FAILURE = 'APPOINTMENT_FAILURE'
export const GET_APPOINTMENTS_SUCCESS = 'GET_APPOINTMENTS_SUCCESS'

export function isDeleted(deleted) {
  return {
    type: DELETE_APPOINTMENT_SUCCESS,
    deleted: deleted
  }
}

export function getAppointmentSuccess(appointment) {
  return {
    type: GET_APPOINTMENT_SUCCESS,
    appointment: appointment
  }
}

export function getAppointmentsSuccess(appointments) {
  return {
    type: GET_APPOINTMENTS_SUCCESS,
    appointments: appointments
  }
}

export function appointmentFailure(error) {
  return {
    type: APPOINTMENT_FAILURE,
    error: error
  }
}

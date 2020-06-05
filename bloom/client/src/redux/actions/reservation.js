export const ADD_APPOINTMENT_SUCCESS = 'ADD_APPOINTMENT_SUCCESS'
export const GET_APPOINTMENT_SUCCESS = 'GET_APPOINTMENT_SUCCESS'
export const APPOINTMENT_FAILURE = 'APPOINTMENT_FAILURE'

export function addAppointmentSuccess(appointment) {
  return {
    type: ADD_APPOINTMENT_SUCCESS,
    appointment: appointment
  }
}

export function getAppointmentSuccess(appointments) {
  return {
    type: GET_APPOINTMENT_SUCCESS,
    appointments: appointments
  }
}

export function appointmentFailure(error) {
  return {
    type: APPOINTMENT_FAILURE,
    error: error
  }
}

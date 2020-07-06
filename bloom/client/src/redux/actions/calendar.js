export const DELETE_APPOINTMENT_SUCCESS = 'DELETE_APPOINTMENT_SUCCESS'
export const GET_APPOINTMENTS_SUCCESS = 'GET_APPOINTMENTS_SUCCESS'
export const CALENDAR_FAILURE = 'CALENDAR_FAILURE'
export const ADD_APPOINTMENT_SUCCESS = 'ADD_APPOINTMENT_SUCCESS'
export const UPDATE_APPOINTMENT_SUCCESS = 'UPDATE_APPOINTMENT_SUCCESS'
export const DELETE_APPOINTMENT_BY_ID_SUCCESS = 'DELETE_APPOINTMENT_BY_ID_SUCCESS'
export const GET_CLIENTS_SUCCESS = 'GET_CLIENTS_SUCCESS'

export function getAppointmentsSuccess(appointments) {
  return {
    type: GET_APPOINTMENTS_SUCCESS,
    appointments: appointments
  }
}

export function calendarFailure(error) {
  return {
    type: CALENDAR_FAILURE,
    error: error
  }
}

export function addAppointmentSuccess(appointment) {
  return {
    type: ADD_APPOINTMENT_SUCCESS,
    appointment: appointment
  }
}

export function deleteAppointmentSuccess(appointment) {
  return {
    type: DELETE_APPOINTMENT_SUCCESS,
    appointment: appointment
  }
}

export function deleteAppointmentByIdSuccess(appointment) {
  return {
    type: DELETE_APPOINTMENT_BY_ID_SUCCESS,
    appointment: appointment
  }
}

export function updateAppointmentSuccess(appointment) {
  return {
    type: UPDATE_APPOINTMENT_SUCCESS,
    appointment: appointment
  }
}

export function getClientsSuccess(clients) {
  return {
    type: GET_CLIENTS_SUCCESS,
    clients: clients
  }
}

// export const DELETE_APPOINTMENT_SUCCESS = 'ADD_APPOINTMENT_SUCCESS'
export const GET_APPOINTMENTS_SUCCESS = 'GET_APPOINTMENTS_SUCCESS'
export const CALENDAR_FAILURE = 'CALENDAR_FAILURE'
export const ADD_APPOINTMENT_SUCCESS = 'ADD_APPOINTMENT_SUCCESS'

// export function isDeleted(deleted) {
//   return {
//     type: DELETE_APPOINTMENT_SUCCESS,
//     deleted: deleted
//   }
// }

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

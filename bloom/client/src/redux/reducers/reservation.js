import { APPOINTMENT_FAILURE, ADD_APPOINTMENT_SUCCESS, GET_APPOINTMENT_SUCCESS } from "../actions/reservation"

const initialState = {
  appointment: null,
  error: null,
  appointments: null
}

function reservationReducer(state = initialState, action) {
  switch (action.type) {

    case GET_APPOINTMENT_SUCCESS:
      return Object.assign({}, state, {
        appointments: action.appointments
      })


    case APPOINTMENT_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case ADD_APPOINTMENT_SUCCESS:
      let newAppointments = state.appointments
      if(newAppointments) {
        newAppointments.push(action.appointment);
      }
      else {
        newAppointments = [action.appointment]
      }    
      return Object.assign({}, state, {
        appointment: action.appointment,
        appointments: newAppointments
      })


    default:
      return state
  }
}

export default reservationReducer;

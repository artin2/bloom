import { CALENDAR_FAILURE, GET_APPOINTMENTS_SUCCESS, ADD_APPOINTMENT_SUCCESS } from "../actions/calendar"

const initialState = {
  error: '',
  appointments: [],
}

function calendarReducer(state = initialState, action) {
  switch (action.type) {


    case GET_APPOINTMENTS_SUCCESS:
    // console.log(action.appointments)
      return Object.assign({}, state, {
        appointments: action.appointments
      })

    case CALENDAR_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    // case DELETE_APPOINTMENT_SUCCESS:
    //
    //   return Object.assign({}, state, {
    //     deleted: action.deleted
    //   })

    case ADD_APPOINTMENT_SUCCESS:
    let newAppointments = state.appointments
    if(newAppointments) {
      newAppointments.push(action.appointment);
    }
    else {
      newAppointments = [action.appointment]
    }
    return Object.assign({}, state, {
      appointments: newAppointments
    })


    default:
      return state
  }
}

export default calendarReducer;

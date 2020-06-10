import { CALENDAR_FAILURE, GET_APPOINTMENTS_SUCCESS } from "../actions/calendar"

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


    default:
      return state
  }
}

export default calendarReducer;

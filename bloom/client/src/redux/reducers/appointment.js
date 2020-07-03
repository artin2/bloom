import { APPOINTMENT_FAILURE, DELETE_APPOINTMENT_SUCCESS, GET_APPOINTMENT_SUCCESS, GET_APPOINTMENTS_SUCCESS} from "../actions/appointment"

const initialState = {
  appointment: null,
  error: null,
  appointments: null,
  deleted: false
}

function appointmentReducer(state = initialState, action) {
  switch (action.type) {

    case GET_APPOINTMENT_SUCCESS:
      return Object.assign({}, state, {
        appointment: action.appointment
      })

    case GET_APPOINTMENTS_SUCCESS:
    // console.log(action.appointments)
      return Object.assign({}, state, {
        appointments: action.appointments
      })

    case APPOINTMENT_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case DELETE_APPOINTMENT_SUCCESS:

      return Object.assign({}, state, {
        deleted: action.deleted
      })


    default:
      return state
  }
}

export default appointmentReducer;

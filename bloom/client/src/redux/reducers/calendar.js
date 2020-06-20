import { CALENDAR_FAILURE, GET_APPOINTMENTS_SUCCESS, ADD_APPOINTMENT_SUCCESS } from "../actions/calendar"

const initialState = {
  error: '',
  appointments: {
    appointments: [],
    groups: {}
  },
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

    let appointment = action.appointment.appointment
    console.log("-----", appointment)
    let date = new Date(appointment.date);
    appointment.start_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.start_time)[0], timeConvert(appointment.start_time)[1]);
    appointment.end_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.end_time)[0], timeConvert(appointment.end_time)[1]);


    let appointments = Object.assign({}, state.appointments);

    if(appointments.appointments) {
      appointments.appointments.push(appointment);
    }
    else {
      appointments = [action.appointment.appointment]
    }

    appointments.groups[action.appointment.group_id] = [{
      id: appointment.id,
      services: appointment.service_id,
      workers: appointment.worker_id,
      startDate: appointment.start_time,
      endDate: appointment.end_time,
      date: date,
      price: appointment.price
    }]
    // console.log(appointments)

    // console.log(state.appointments, newAppointments)
    return Object.assign({}, state, {
      appointments: appointments
    })


    default:
      return state
  }
}

function timeConvert(n) {

     var num = n;
     var hours = (num / 60);
     var rhours = Math.floor(hours);
     var minutes = (hours - rhours) * 60;
     var rminutes = minutes;
     return [rhours, rminutes];
}

export default calendarReducer;

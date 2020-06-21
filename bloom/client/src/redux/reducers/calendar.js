import { CALENDAR_FAILURE, GET_APPOINTMENTS_SUCCESS, ADD_APPOINTMENT_SUCCESS, DELETE_APPOINTMENT_SUCCESS, UPDATE_APPOINTMENT_SUCCESS } from "../actions/calendar"

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

    case DELETE_APPOINTMENT_SUCCESS:

      let new_appointments = Object.assign({}, state.appointments);

      new_appointments.appointments = new_appointments.appointments.filter(function(appointment) {
        return appointment.group_id.toString() !== action.appointment
      });
      delete new_appointments.groups[action.appointment]
      // console.log("_____", action.appointment, new_appointments)
      return Object.assign({}, state, {
        appointments: new_appointments
      })

    case UPDATE_APPOINTMENT_SUCCESS:

      let updated_appointments = Object.assign({}, state.appointments);

      updated_appointments.appointments = updated_appointments.appointments.filter(function(appointment) {
        return appointment.group_id !== action.appointment.group_id
      });

      delete updated_appointments.groups[action.appointment.group_id]

      let up_date = new Date(action.appointment.date);
      action.appointment.start_time = new Date(up_date.getFullYear(), up_date.getMonth(), up_date.getDate(), timeConvert(action.appointment.start_time)[0], timeConvert(action.appointment.start_time)[1]);
      action.appointment.end_time = new Date(up_date.getFullYear(), up_date.getMonth(), up_date.getDate(), timeConvert(action.appointment.end_time)[0], timeConvert(action.appointment.end_time)[1]);

      if(updated_appointments.appointments) {
        updated_appointments.appointments.push(action.appointment);
      }
      else {
        updated_appointments.appointments = [action.appointment]
      }

      updated_appointments.groups[action.appointment.group_id] = [{
        id: action.appointment.id,
        services: action.appointment.service_id,
        workers: action.appointment.worker_id,
        startDate: action.appointment.start_time,
        endDate: action.appointment.end_time,
        date: up_date,
        price: action.appointment.price
      }]


      console.log("HEEEEERE", updated_appointments)
      return Object.assign({}, state, {
        appointments: updated_appointments
      })

    case ADD_APPOINTMENT_SUCCESS:

    let appointment = action.appointment.appointment
    let appointments = Object.assign({}, state.appointments);

    let date = new Date(appointment.date);
    appointment.start_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.start_time)[0], timeConvert(appointment.start_time)[1]);
    appointment.end_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.end_time)[0], timeConvert(appointment.end_time)[1]);

    if(appointments.appointments) {
      appointments.appointments.push(appointment);
    }
    else {
      appointments.appointments = [appointment]
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

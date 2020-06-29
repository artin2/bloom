import { CALENDAR_FAILURE, GET_APPOINTMENTS_SUCCESS, ADD_APPOINTMENT_SUCCESS, DELETE_APPOINTMENT_SUCCESS, UPDATE_APPOINTMENT_SUCCESS, DELETE_APPOINTMENT_BY_ID_SUCCESS } from "../actions/calendar"

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

      return Object.assign({}, state, {
        appointments: new_appointments
      })

    case DELETE_APPOINTMENT_BY_ID_SUCCESS:

        let deleted_appointments = Object.assign({}, state.appointments);
        console.log(action.appointment)

        deleted_appointments.appointments = deleted_appointments.appointments.filter(function(appointment) {
          if(!action.appointment.deleted.includes(appointment.id)) {
            return appointment
          }
        });

        deleted_appointments.groups[action.appointment.group_id] = deleted_appointments.groups[action.appointment.group_id].filter(function(appointment) {
          if(!action.appointment.deleted.includes(appointment.id)) {
            return appointment
          }
        });

        console.log(deleted_appointments)
        return Object.assign({}, state, {
          appointments: deleted_appointments
    })

    case UPDATE_APPOINTMENT_SUCCESS:

      console.log(action.appointment.appointment)
      let updated_appointments = Object.assign({}, state.appointments);

      let all_added_ids = action.appointment.appointment.map((app) => app.id)
      updated_appointments.appointments = updated_appointments.appointments.filter(function(appointment) {
        if(!all_added_ids.includes(appointment.id)) {
          return appointment
        }
      });

      console.log(updated_appointments.groups[action.appointment.group_id])
      updated_appointments.groups[action.appointment.group_id] = updated_appointments.groups[action.appointment.group_id].filter(function(appointment) {
        if(!all_added_ids.includes(appointment.id)) {
          return appointment
        }
      })

      console.log(updated_appointments.groups[action.appointment.group_id])

      // updated_appointments.groups[action.appointment.group_id].map((appointment) => {
      //   if(appointment.id == )
      //     delete updated_appointments.groups[action.appointment.group_id][appointment.id]
      // })
      //
      action.appointment.appointment.map((appointment) => {

          let up_date = new Date(appointment.date);
          appointment.start_time = new Date(up_date.getFullYear(), up_date.getMonth(), up_date.getDate(), timeConvert(appointment.start_time)[0], timeConvert(appointment.start_time)[1]);
          appointment.end_time = new Date(up_date.getFullYear(), up_date.getMonth(), up_date.getDate(), timeConvert(appointment.end_time)[0], timeConvert(appointment.end_time)[1]);

          if(updated_appointments.appointments) {
            updated_appointments.appointments.push(appointment);
          }
          else {
            updated_appointments.appointments = [appointment]
          }

          let updated_group = {
            id: appointment.id,
            services: appointment.service_id,
            workers: appointment.worker_id,
            startDate: appointment.start_time,
            endDate: appointment.end_time,
            date: up_date,
            price: appointment.price,
            warnings: appointment.warnings
          }

          if(updated_appointments.groups[action.appointment.group_id]) {
            updated_appointments.groups[action.appointment.group_id].push(updated_group)
          }
          else {
            updated_appointments.groups[action.appointment.group_id] = [updated_group]
          }

      })

      console.log(updated_appointments)

      return Object.assign({}, state, {
        appointments: updated_appointments
      })

    case ADD_APPOINTMENT_SUCCESS:

    let added_appointments = action.appointment.appointment
    let appointments = Object.assign({}, state.appointments);

    console.log(added_appointments, appointments)

    added_appointments.map((appointment) => {

        let date = new Date(appointment.date)
        appointment.start_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.start_time)[0], timeConvert(appointment.start_time)[1]);
        appointment.end_time = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.end_time)[0], timeConvert(appointment.end_time)[1]);

        if(appointments.appointments) {
          appointments.appointments.push(appointment);
        }
        else {
          appointments.appointments = [appointment]
        }

        let new_group = {
          id: appointment.id,
          services: appointment.service_id,
          workers: appointment.worker_id,
          startDate: appointment.start_time,
          endDate: appointment.end_time,
          date: date,
          price: appointment.price,
          warnings: appointment.warnings
        }

        if(appointments.groups[action.appointment.group_id]) {
          appointments.groups[action.appointment.group_id].push(new_group)
        }
        else {
          appointments.groups[action.appointment.group_id] = [new_group]
        }

    })
    console.log(appointments)
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

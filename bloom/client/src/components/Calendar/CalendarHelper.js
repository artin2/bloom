import {calendarFailure, getAppointmentsSuccess} from '../../redux/actions/calendar';
import { toast } from 'react-toastify'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

function failureToast(message) {
  toast.error('⚠️ ' + message, {
    position: "top-right",
    autoClose: 6000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  })
}
// CALENDAR FUNCTIONS
//
// export function addNewAppointment(store_id, values){
//
//   return dispatch => {
//     fetch(fetchDomain + '/stores/' + store_id + '/appointments/new', {
//       method: "POST",
//       headers: {
//         'Content-type': 'application/json',
//         'Accept': 'application/json'
//       },
//       credentials: 'include',
//       body: JSON.stringify(values)
//     })
//     .then(function (response) {
//       if (response.status !== 200) {
//         // throw an error alert
//         dispatch(appointmentFailure(response))
//       }
//       else {
//         return response.json();
//       }
//     })
//     .then(async data => {
//       if (data) {
//
//         dispatch(addAppointmentSuccess(data))
//         return data
//       }
//     });
//   }
// }

export function getAppointments(store_id) {
  return dispatch => {

    fetch(fetchDomain + '/stores/' + store_id + '/appointments' , {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          failureToast(response.statusText)
          dispatch(calendarFailure(response))
        }
        else {
          return response.json()
        }
      })
      .then(data => {

        let parsedData = data.map(appointment => {
          let date = new Date(appointment.date);
          let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.start_time)[0], timeConvert(appointment.start_time)[1]);
          let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(appointment.end_time)[0], timeConvert(appointment.end_time)[1]);

          appointment.start_time = startDate
          appointment.end_time = endDate
          return appointment
        })

        dispatch(getAppointmentsSuccess(parsedData))
        return parsedData
      });
  }
}

function timeConvert(n) {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return [rhours, rminutes];
  }

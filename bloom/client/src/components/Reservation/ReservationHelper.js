import {addAppointmentSuccess, appointmentFailure, getAppointmentSuccess} from '../../redux/actions/reservation';
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
// RESERVATION FUNCTIONS

export function addNewAppointment(store_id, values){

  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id + '/appointments/new', {
      method: "POST",
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function (response) {
      if (response.status !== 200) {
        // throw an error alert
        failureToast(response.statusText)
        dispatch(appointmentFailure(response))
      }
      else {
        return response.json();
      }
    })
    .then(async data => {
      if (data) {
        dispatch(addAppointmentSuccess(data))
        return data
      }
    });
  }
}

export function getAppointments(store_id, month) {
  return dispatch => {

    fetch(fetchDomain + '/stores/' + store_id + '/appointments/month/' + month, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          failureToast(response.statusText)
          dispatch(appointmentFailure(response))
        }
        else {
          return response.json()
        }
      })
      .then(data => {

        let parsedData = data.map(appointment => {
          appointment.date = new Date(appointment.date)
          return appointment
        })

        dispatch(getAppointmentSuccess(parsedData))
        return parsedData
      });
  }
}

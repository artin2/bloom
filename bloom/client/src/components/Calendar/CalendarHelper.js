import {calendarFailure, getAppointmentsSuccess, addAppointmentSuccess, deleteAppointmentSuccess, updateAppointmentSuccess} from '../../redux/actions/calendar';
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
        dispatch(calendarFailure(response))
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

        dispatch(getAppointmentsSuccess(data))
        return data
      });
  }
}

export function deleteAppointment(group_id) {

  return dispatch => {

    fetch(fetchDomain + '/appointments/delete/' + group_id, {
      method: "GET",
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',

    })
    .then(function (response) {
      if (response.status !== 200) {
        // throw an error alert
        dispatch(calendarFailure(response))
      }
      else {
        return response.json();
      }
    })
    .then(async data => {
      if (data) {
        dispatch(deleteAppointmentSuccess(data))
        return data
      }
  })
  }
}

export function updateAppointment(store_id, values) {

  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id + '/appointments/update', {
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
        dispatch(calendarFailure(response))
      }
      else {
        return response.json();
      }
    })
    .then(async data => {
      if (data) {

        dispatch(updateAppointmentSuccess(data))
        return data
      }
    })
  }
}

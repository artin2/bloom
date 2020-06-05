import {getAppointmentSuccess, appointmentFailure, isDeleted, getAppointmentsSuccess} from '../../redux/actions/appointment';

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// APPOINTMENT FUNCTIONS

export function getAppointment(group_id){

  return dispatch => {
    fetch(fetchDomain + '/appointments/display/' + group_id, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          dispatch(appointmentFailure(response))
        }
        else {
          return response.json();
        }
      })
      .then(data => {
        if (data) {

          dispatch(getAppointmentSuccess(data))
          return data;
        }
      })
    }
  }


export function deleteAppointment(group_id) {
  return dispatch => {

    fetch(fetchDomain + '/appointments/delete/' + group_id, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          dispatch(appointmentFailure(response))
        }
        else {
          return response.json()
        }
      })
      .then(data => {
        dispatch(isDeleted(true))
        return data
      });
  }
}

export function getAppointments(user_id) {

  return dispatch => {

    fetch(fetchDomain + '/appointments/' + user_id, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          dispatch(appointmentFailure(response))
        }
        else {
          return response.json();
        }
      })
      .then(data => {
        if (data) {

          dispatch(getAppointmentsSuccess(data))
          return data
        }
      })
  }
}

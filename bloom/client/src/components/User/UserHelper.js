import { userLoginSuccess, userLoginFailure, userSignupSuccess, userSignupFailure, editUserSuccess, editUserFailure, deleteUserSuccess, deleteUserFailure, sendResetPasswordFailure, sendResetPasswordSuccess, updatePasswordSuccess, updatePasswordFailure } from '../../redux/actions/user';
// import {addServiceSuccess} from './actions/service';
// import {getWorkerOptionsSuccess, addWorker} from './actions/worker';
import { addAlert } from '../../redux/actions/alert'
import { toast } from 'react-toastify'
import { handleLogout } from '../../components/helperFunctions';
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

function successToast(message) {
  toast.success(message, {
    position: "top-right",
    autoClose: 6000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  })
}

// USER FUNCTIONS

export function signup(values) {
  return dispatch => {
    fetch(fetchDomain + '/signUp', {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
      .then(function (response) {
        dispatch(addAlert(response))  // seems this alert is not persisting...

        if (response.status !== 200) {
          failureToast(response.statusText)
          dispatch(userSignupFailure(response))
        }
        else {
          return response.json()
        }
      })
      .then(data => {
        if (data) {
          dispatch(userSignupSuccess(data.user));
          return data;
        }
      });
  }
}

export function login(values) {
  return dispatch => {
    fetch(fetchDomain + '/login', {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      method: "POST",
      body: JSON.stringify(values)

    })
      .then(function (response) {
        dispatch(addAlert(response))

        if (response.status !== 200) {
          failureToast(response.statusText)
          dispatch(userLoginFailure(response));
        }
        else {
          return response.json()
        }
      })
      .then(data => {
        if (data) {
          dispatch(userLoginSuccess(data.user));
          return data;
        }
      });
  }
}

export function editUser(values) {
  return dispatch => {
    fetch(fetchDomain + '/users/' + values.id, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
      .then(function (response) {
        dispatch(addAlert(response))

        if (response.status !== 200) {
          failureToast(response.statusText)
          dispatch(editUserFailure(response))
        }
        else {
          // redirect to home page signed in
          return response.json()
        }
      })
      .then(data => {
        if (data) {
          dispatch(editUserSuccess(data))
          return data
        }
      });
  }
}

export function deleteUser(user_id) {
  return dispatch => {
    fetch(fetchDomain + '/users/' + user_id, {
      method: "DELETE",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
    })
    .then(function (response) {
      // dispatch(addAlert(response))

      if (response.status !== 200) {
        console.log("response is!", response)
        failureToast(response.statusText)
        dispatch(deleteUserFailure(response))
      }
      else {
        // redirect to home page signed in
        return response.json()
      }
    })
    .then(data => {
      if (data) {
        dispatch(deleteUserSuccess(data))
        handleLogout()
        return data
      }
    });
  }
}

export function sendResetPassword(email) {
  console.log("sending request to:", '/resetPassword/' + email)
  return dispatch => {
    fetch(fetchDomain + '/resetPassword/' + email, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
    })
    .then(function (response) {
      // dispatch(addAlert(response))

      if (response.status !== 200) {
        failureToast(response.statusText)
        dispatch(sendResetPasswordFailure(response))
      }
      else {
        return response.json()
      }
    })
    .then(data => {
      if (data) {
        dispatch(sendResetPasswordSuccess(data))
        successToast("Password Reset Email Sent")
        return data
      }
    });
  }
}

export function updatePassword(values) {
  return dispatch => {
    fetch(fetchDomain + '/updatePassword/', {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function (response) {
      // dispatch(addAlert(response))

      if (response.status !== 200) {
        failureToast(response.statusText)
        dispatch(updatePasswordFailure(response))
      }
      else {
        // redirect to home page signed in
        return response.json()
      }
    })
    .then(data => {
      if (data) {
        dispatch(updatePasswordSuccess(data))
        return data
      }
    });
  }
}
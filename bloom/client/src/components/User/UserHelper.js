import {userLoginSuccess, userLoginFailure, userSignupSuccess, userSignupFailure, editUserSuccess} from '../../redux/actions/user';
// import {addServiceSuccess} from './actions/service';
// import {getWorkerOptionsSuccess, addWorker} from './actions/worker';
import {failure} from '../../redux/actions/index'
import {addAlert} from '../../redux/actions/alert';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// USER FUNCTIONS

export function signup(values){
  return dispatch => {
    fetch(fetchDomain + '/signUp' , {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function(response){
      dispatch(addAlert(response))  // seems this alert is not persisting...

      if(response.status!==200){
        dispatch(userSignupFailure(response))
      }
      else{
        return response.json()
      }
    })
    .then(data => {
      if(data){
        dispatch(userSignupSuccess(data.user));
        return data;
      }
    });
  }
}

export function login(values) {
  return dispatch => {
    fetch(fetchDomain + '/login' , {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      method: "POST",
      body: JSON.stringify(values)

    })
    .then(function(response){
      dispatch(addAlert(response))

      if(response.status!==200){
        dispatch(userLoginFailure(response));
      }
      else{
        return response.json()
      }
    })
    .then(data => {
      if(data){
        dispatch(userLoginSuccess(data.user));
        return data;
      }
    });
  }
}

export function editUser(values){
  return dispatch => {
    fetch(fetchDomain + '/users/' + values.id , {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function(response){
      dispatch(addAlert(response))

      if(response.status!==200){
        dispatch(failure(response))
      }
      else{
        // redirect to home page signed in
        return response.json()
      }
    })
    .then(data => {
      if(data){
        dispatch(editUserSuccess(data))
        return data
      }
    });
  }
}

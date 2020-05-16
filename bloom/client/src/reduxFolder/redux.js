import {userLoginSuccess, userLoginFailure, userSignupSuccess, userSignupFailure, editUserSuccess} from './actions/user';
// import {addServiceSuccess} from './actions/service';
// import {getWorkerOptionsSuccess, addWorker} from './actions/worker';
import {failure} from './actions/index'
import {addAlert} from './actions/alert';
import axios from 'axios';

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// USER FUNCTIONS

export function signup(values){
  return dispatch => {
    axios.post(fetchDomain + '/signUp', values, {
      withCredentials: true
    })
    .then(response => {
      dispatch(userSignupSuccess(response.data.user))
      return response.data
    }, (error) => {
      dispatch(userSignupFailure(error))
    }
    )
  }
}

export function login(values) {
  return dispatch => {
    axios.post(fetchDomain + '/login', values, {
      withCredentials: true
    })
    .then(response => {
      dispatch(userLoginSuccess(response.data.user))
      return response.data
    }, (error) => {
      dispatch(userLoginFailure(error))
    })
    }
}

export function editUser(values){
  return dispatch => {
    axios.post(fetchDomain + '/users/' + values.id, values, {
      withCredentials: true
    })
    .then(response => {
      dispatch(editUserSuccess(response.data))
      return response.data
    }, (error) => {
      dispatch(failure(error))
    }
    )
  }
}

// not going to refactor other code unless extra time left, too time consuming

// SERVICE FUNCTIONS

// export function addService(values, store_id){
//   return dispatch => {
//     fetch(fetchDomain + '/stores/addService/' + store_id, {
//       method: "POST",
//       headers: {
//         'Content-type': 'application/json'
//       },
//       credentials: 'include',
//       body: JSON.stringify(values)
//     })
//     .then(function(response){
//       dispatch(addAlert(response))

//       if(response.status!==200){
//         dispatch(failure(response))
//       }
//       else{
//         return response.json();
//       }
//     })
//     .then(function(data){
//       if(data){
//         dispatch(addServiceSuccess(data))
//         return data
//       }
//     })
//   }
// }

// WORKER FUNCTIONS

// export function getWorkerOptions(store_id){
//   return dispatch => {
//     fetch(fetchDomain + '/stores/' + store_id + "/workers" , {
//       method: "GET",
//       headers: {
//           'Content-type': 'application/json'
//       },
//       credentials: 'include'
//     })
//     .then(function(response){
//       if(response.status!==200){
//         // throw an error alert
//         dispatch(addAlert(response))
//       }
//       else{
//         return response.json();
//       }
//     })
//     .then(data => {
//       if(data){
//         let convertedWorkers = data.map((worker) => ({ value: worker.id, label: worker.first_name + " " + worker.last_name }));
//         dispatch(getWorkerOptionsSuccess(convertedWorkers))
//         return data
//       }
//     });
//   }
// }

// export function addWorker(values, store_id){
//   fetch(fetchDomain + '/stores/addWorker/' + store_id, {
//     method: "POST",
//     headers: {
//       'Content-type': 'application/json'
//     },
//     credentials: 'include',
//     body: JSON.stringify(values)
//   })
//   .then(function(response){
//     dispatch(addAlert(response))

//     if(response.status!==200){
//       dispatch(failure(response))
//     }
//     else{
//       return response.json();
//     }
//   })
//   .then(function(data){
//     // redirect to home page signed in
//     if(data){
//       dispatch(addWorkerSuccess(data))
//       return data
//     }
//   })
// }

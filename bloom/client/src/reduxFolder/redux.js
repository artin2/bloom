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
      axios.post(fetchDomain + '/signUp', values)
      .then(response => {
        console.log("response is: ", response)
        dispatch(userSignupSuccess(response.user))
        return response
      }, (error) => {
        console.log("about to dispatch a failure")
        dispatch(userSignupFailure(error))
      }
      )
    
    // fetch(fetchDomain + '/signUp' , {
    //   method: "POST",
    //   headers: {
    //     'Content-type': 'application/json'
    //   },
    //   credentials: 'include',
    //   body: JSON.stringify(values)
    // })
    // .then(function(response){
    //   dispatch(addAlert(response))  // seems this alert is not persisting...

    //   if(response.status!==200){
    //     dispatch(userSignupFailure(response))
    //   }
    //   else{
    //     return response.json()
    //   }
    // })
    // .then(data => {
    //   if(data){
    //     dispatch(userSignupSuccess(data.user));
    //     return data;
    //   }
    // });
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

import {getWorkerSuccess, workerFailure, workerFetching, addWorkerSuccess, editWorkerSuccess, workerSchedulesSuccess} from '../../redux/actions/worker';

import {addAlert} from '../../redux/actions/alert';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// WORKER FUNCTIONS

export function getWorkers(store_id) {
  return dispatch => {
    dispatch(workerFetching(true))

    fetch(fetchDomain + '/stores/' + store_id + '/workers', {
      method: "GET",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include'
    })
    .then(function(response){
      if(response.status!==200){
        // throw an error alert
          dispatch(workerFailure(response))
          dispatch(workerFetching(false))
      }
      else{
        return response.json();
      }
    })
    .then(async function(data) {

      let result = await Promise.all(data.map(async (worker) => ({...worker,
          workerHours: await getWorkerHours(store_id, worker.id)
      })))

        dispatch(getWorkerSuccess(result))
        dispatch(workerFetching(false))

      return data
    })

  }
}

function getWorkerHours(store_id, worker_id){

    return fetch(fetchDomain + '/stores/' + store_id + '/workers/' + worker_id + '/hours', {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
    .then(function(response){
      if(response.status!==200){
        // throw an error alert
        // store.dispatch(addAlert(response))
        //probably another action for worker hour errors
        // return response.json()
      }
      else{
        return response.json();
      }
    })
    .then(data => {
      return data;
    })
}


export function addWorker(store_id, values) {
  return dispatch => {
    // upload worker to db
    fetch(fetchDomain + '/stores/addWorker/' + store_id, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function (response) {
      if (response.status !== 200) {
        dispatch(workerFailure(response))
      }
      else {
        return response.json();
      }
    })
    .then(async function (data) {
      // upon successful worker upload, show the worker
      if (data) {

        data.workerHours = await getWorkerHours(store_id, data.id)

        dispatch(addWorkerSuccess(data))
        return values
      }
    })
  }
}


export function editWorker(store_id, worker_id, values) {

  return dispatch => {

    fetch(fetchDomain + '/stores/' + store_id + '/workers/' + worker_id, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
      .then(function (response) {
        if (response.status !== 200) {
          dispatch(workerFailure(response))
        }
        else {
          // redirect to worker page
          return response.json()
        }
      })
      .then(async data => {

        if (data) {

          data.workerHours = await getWorkerHours(store_id, data.id)
          dispatch(editWorkerSuccess(data))
          return data;
        }
      });
  }
}

export function getWorkerSchedules(store_id) {
  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id + '/workers/schedules', {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        })
        .then(function (response) {
          if (response.status !== 200) {
            dispatch(workerFailure(response))
          }
          else {
            // redirect to worker page
            return response.json()
          }
        })
        .then(async data => {

          if (data) {

            dispatch(workerSchedulesSuccess(data))
            return data;
          }
        });
  }
}

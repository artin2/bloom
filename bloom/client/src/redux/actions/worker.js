export const GET_WORKER_OPTIONS_SUCCESS = 'GET_WORKER_OPTIONS_SUCCESS'
export const ADD_WORKER_SUCCESS = 'ADD_WORKER_SUCCESS'
export const EDIT_WORKER_SUCCESS = 'EDIT_WORKER_SUCCESS'
export const GET_WORKER_SUCCESS = 'GET_WORKER_SUCCESS'
export const WORKER_FETCHING = 'WORKER_FETCHING'
export const WORKER_FAILURE = 'WORKER_FAILURE'
export const UPDATE_CURRENT_WORKER = 'UPDATE_CURRENT_WORKER'

export function getWorkerOptionsSuccess(workerOptionsPassed) {
  return {
    type: GET_WORKER_OPTIONS_SUCCESS,
    workerOptions: workerOptionsPassed
  }
}

export function addWorkerSuccess(workerPassed) {
  return {
    type: ADD_WORKER_SUCCESS,
    worker: workerPassed
  }
}

export function editWorkerSuccess(workerPassed) {
  return {
    type: EDIT_WORKER_SUCCESS,
    worker: workerPassed
  }
}

export function getWorkerSuccess(workerPassed) {
  return {
    type: GET_WORKER_SUCCESS,
    workers: workerPassed
  }
}

export function workerFailure(error) {
  return {
    type: WORKER_FAILURE,
    error: error
  }
}

export function workerFetching(fetching) {
  return {
    type: WORKER_FETCHING,
    isFetching: fetching
  }
}

export function updateCurrentWorker(workerPassed) {
  return {
    type: UPDATE_CURRENT_WORKER,
    worker: workerPassed
  }
}

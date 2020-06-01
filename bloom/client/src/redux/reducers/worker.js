import { GET_WORKER_OPTIONS_SUCCESS, WORKER_FETCHING, WORKER_FAILURE, ADD_WORKER_SUCCESS,
  EDIT_WORKER_SUCCESS, GET_WORKER_SUCCESS, STORE_HOURS_SUCCESS, UPDATE_CURRENT_WORKER } from "../actions/worker"

const initialState = {
  workers: [],
  worker: [],
  isFetching: false,
  error: '',
  storeHours: []
}

function workerReducer(state = initialState, action) {
  switch (action.type) {

    case GET_WORKER_SUCCESS:
      return Object.assign({}, state, {
        workers: action.workers
      })

    case UPDATE_CURRENT_WORKER:
        return Object.assign({}, state, {
          worker: action.worker
    })

    case WORKER_FETCHING:
      return Object.assign({}, state, {
        isFetching: action.isFetching
      })

    case WORKER_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case STORE_HOURS_SUCCESS:
      return Object.assign({}, state, {
        storeHours: action.storeHours
      })


    case ADD_WORKER_SUCCESS:
      let newWorkers = state.workers;
      newWorkers.push(action.worker);
      return Object.assign({}, state, {
        worker: action.worker,
        workers: newWorkers
      })

    case EDIT_WORKER_SUCCESS:
      let updatedWorkers = state.workers.filter(worker => worker.id != action.worker.id);
      updatedWorkers.push(action.worker);
      return Object.assign({}, state, {
        worker: action.worker,
        workers: updatedWorkers
      })


    default:
      return state
  }
}

export default workerReducer;

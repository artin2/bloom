import { GET_WORKER_OPTIONS_SUCCESS, WORKER_FETCHING, WORKER_FAILURE, ADD_WORKER_SUCCESS,
  EDIT_WORKER_SUCCESS, GET_WORKER_SUCCESS, UPDATE_CURRENT_WORKER, WORKER_SCHEDULE_SUCCESS } from "../actions/worker"

const initialState = {
  workers: null,
  worker: null,
  isFetching: false,
  error: null,
  workerSchedules: null
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

    case WORKER_SCHEDULE_SUCCESS:
        return Object.assign({}, state, {
          workerSchedules: action.schedules
    })

    case ADD_WORKER_SUCCESS:
      let newWorkers = state.workers;
      if(newWorkers !== null){
        newWorkers.push(action.worker);
      }
      else{
        newWorkers = [action.worker];
      }
  
      return Object.assign({}, state, {
        worker: action.worker,
        workers: newWorkers
      })

    case EDIT_WORKER_SUCCESS:
      let updatedWorkers = state.workers.filter(worker => worker.id != action.worker.id);
      if(updatedWorkers !== null){
        updatedWorkers.push(action.worker);
      }
      else{
        updatedWorkers = [action.worker];
      }

      return Object.assign({}, state, {
        worker: action.worker,
        workers: updatedWorkers
      })


    default:
      return state
  }
}

export default workerReducer;

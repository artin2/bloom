import { SEARCH_SUCCESS, SEARCH_FAILURE, SEARCH_FETCHING, UPDATE_SELECTED_STORE, GET_WORKERS, GET_SERVICES } from "../actions/search"

const initialState = {
  stores: {},
  error: {},
  isFetching: false,
  center: {},
  store: {},
  workers: [],
  services: []
}

function searchReducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case SEARCH_SUCCESS:
      return Object.assign({}, state, {
        stores: action.stores,
        center: action.center
      })

    case SEARCH_FETCHING:
      return Object.assign({}, state, {
        isFetching: action.isFetching
      })

    case UPDATE_SELECTED_STORE:
      return Object.assign({}, state, {
        store: action.store
      })

    case GET_WORKERS:
      return Object.assign({}, state, {
        workers: action.workers
      })

    case GET_SERVICES:
        return Object.assign({}, state, {
          services: action.services
      })


    default:
      return state
  }
}

export default searchReducer;

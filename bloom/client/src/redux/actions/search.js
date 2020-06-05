export const SEARCH_SUCCESS = 'SEARCH_SUCCESS'
export const SEARCH_FAILURE = 'SEARCH_FAILURE'
export const SEARCH_FETCHING = 'SEARCH_FETCHING'
export const UPDATE_SELECTED_STORE = 'UPDATE_SELECTED_STORE'
export const GET_SERVICES = 'GET_SERVICES'
export const GET_WORKERS = 'GET_WORKERS'

export function searchSuccess(stores, center) {
  return {
    type: SEARCH_SUCCESS,
    stores: stores,
    center: center
  }
}

export function searchFailure(error) {
  return {
    type: SEARCH_FAILURE,
    error: error
  }
}

export function searchFetching(fetching) {
  return {
    type: SEARCH_FETCHING,
    isFetching: fetching
  }
}

export function updateSelectedStore(store) {
  return {
    type: UPDATE_SELECTED_STORE,
    store: store
  }
}

export function getSearchWorkers(workers) {
  return {
    type: GET_WORKERS,
    workers: workers
  }
}

export function getSearchServices(services) {
  return {
    type: GET_SERVICES,
    services: services
  }
}

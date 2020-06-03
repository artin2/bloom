export const ADD_STORE_SUCCESS = 'ADD_STORE_SUCCESS'
export const GET_STORES_SUCCESS = 'GET_STORES_SUCCESS'
export const STORES_FAILURE = 'STORES_FAILURE'
export const STORES_FETCHING = 'STORES_FETCHING'
export const UPDATE_CURRENT_STORE = 'UPDATE_CURRENT_STORE'
export const STORE_HOURS_SUCCESS = 'STORE_HOURS_SUCCESS'
export const EDIT_STORE_SUCCESS = 'EDIT_STORE_SUCCESS'

export function editStoreSuccess(store) {
  return {
    type: EDIT_STORE_SUCCESS,
    store: store,
  }
}

export function addStoreSuccess(store) {
  return {
    type: ADD_STORE_SUCCESS,
    store: store,
  }
}

export function getStoresSuccess(stores) {
  return {
    type: GET_STORES_SUCCESS,
    stores: stores,
  }
}

export function storesFetching(fetching) {
  return {
    type: STORES_FETCHING,
    isFetching: fetching,
  }
}

export function storesFailure(error) {
  return {
    type: STORES_FAILURE,
    error: error,
  }
}

export function updateCurrentStore(store) {
  return {
    type: UPDATE_CURRENT_STORE,
    store: store,
  }
}

export function storeHoursSuccess(storeHours) {
  return {
    type: STORE_HOURS_SUCCESS,
    storeHours: storeHours
  }
}

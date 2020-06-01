export const ADD_SERVICE_SUCCESS = 'ADD_SERVICE_SUCCESS'
export const GET_CATEGORIES_SUCCESS = 'GET_CATEGORIES_SUCCESS'
export const SERVICE_FAILURE = 'SERVICE_FAILURE'
export const SERVICE_FETCHING = 'SERVICE_FETCHING'
export const SERVICE_SUCCESS = 'SERVICE_SUCCESS'
export const UPDATE_CURRENT_SERVICE = 'UPDATE_CURRENT_SERVICE'
export const EDIT_SERVICE_SUCCESS = 'EDIT_SERVICE_SUCCESS'

export function addServiceSuccess(servicePassed) {
  return {
    type: ADD_SERVICE_SUCCESS,
    service: servicePassed
  }
}

export function getCategoriesSuccess(categories) {
  return {
    type: GET_CATEGORIES_SUCCESS,
    categories: categories
  }
}

export function serviceFailure(error) {
  return {
    type: SERVICE_FAILURE,
    error: error
  }
}

export function serviceFetching(fetching) {
  return {
    type: SERVICE_FETCHING,
    isFetching: fetching
  }
}

export function getServiceSuccess(services) {
  return {
    type: SERVICE_SUCCESS,
    services: services
  }
}

export function updateCurrentService(service) {
  return {
    type: UPDATE_CURRENT_SERVICE,
    service: service
  }
}

export function editServiceSuccess(service) {
  return {
    type: EDIT_SERVICE_SUCCESS,
    service: service
  }
}

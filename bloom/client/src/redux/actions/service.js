export const ADD_SERVICE_SUCCESS = 'ADD_SERVICE_SUCCESS'

export function addServiceSuccess(servicePassed) {
  return {
    type: ADD_SERVICE_SUCCESS,
    service: servicePassed
  }
}
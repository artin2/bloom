export const ADD_ALERT = 'ADD_ALERT'
export const REMOVE_ALERT = 'REMOVE_ALERT'

export function addAlert(messagePassed) {
  return {
    type: ADD_ALERT,
    message: messagePassed
  }
}

export function removeAlert() {
  return { 
    type: REMOVE_ALERT
  }
}

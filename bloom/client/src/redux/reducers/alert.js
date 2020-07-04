import { ADD_ALERT, REMOVE_ALERT } from "../actions/alert"

const initialState = {
  alert: null
}

function alertReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_ALERT:
      return Object.assign({}, state, {
        alert: action.message
      })
    case REMOVE_ALERT:
      return Object.assign({}, state, {
        alert: {}
      })

    default:
      return state
  }
}

export default alertReducer
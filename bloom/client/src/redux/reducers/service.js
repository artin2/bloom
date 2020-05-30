import { ADD_SERVICE_SUCCESS } from "../actions/service"

const initialState = {
  service: {},
}

function serviceReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_SERVICE_SUCCESS:
      return Object.assign({}, state, {
        service: action.service
      })

    default:
      return state
  }
}

export default serviceReducer;

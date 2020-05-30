import { USER_LOGIN_SUCCESS, USER_LOGIN_FAILURE, USER_SIGNUP_SUCCESS, USER_SIGNUP_FAILURE, USER_LOGOUT, EDIT_USER_SUCCESS, UPDATE_ROLE } from "../actions/user"

const initialState = {
  user: {},
  error: {},
}

function userReducer(state = initialState, action) {
  switch (action.type) {
    case USER_LOGIN_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case USER_LOGIN_SUCCESS:
      return Object.assign({}, state, {
        user: action.user
      })

    case USER_SIGNUP_SUCCESS:
      return Object.assign({}, state, {
        user: action.user
      })
  
    case USER_SIGNUP_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case EDIT_USER_SUCCESS:
      return Object.assign({}, state, {
        user: action.user
      })

    case USER_LOGOUT:
      return Object.assign({}, state, {
        user: {}
      })

    case UPDATE_ROLE:
      let new_user = state.user
      new_user.role = action.role
      return Object.assign({}, state, {
        user: new_user
      })

    default:
      return state
  }
}

export default userReducer;

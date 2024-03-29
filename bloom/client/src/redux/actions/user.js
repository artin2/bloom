export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS'
export const USER_LOGIN_FAILURE = 'USER_LOGIN_FAILURE'
export const USER_SIGNUP_SUCCESS = 'USER_SIGNUP_SUCCESS'
export const USER_SIGNUP_FAILURE = 'USER_SIGNUP_FAILURE'
export const USER_LOGOUT = 'USER_LOGOUT'
export const EDIT_USER_SUCCESS = 'EDIT_USER_SUCCESS'
export const EDIT_USER_FAILURE = 'EDIT_USER_FAILURE'
export const DELETE_USER_SUCCESS = 'EDIT_USER_SUCCESS'
export const DELETE_USER_FAILURE = 'EDIT_USER_FAILURE'
export const SEND_RESET_PASSWORD_SUCCESS = 'SEND_RESET_PASSWORD_SUCCESS'
export const SEND_RESET_PASSWORD_FAILURE = 'SEND_RESET_PASSWORD_FAILURE'
export const UPDATE_PASSWORD_SUCCESS = 'SEND_RESET_PASSWORD_SUCCESS'
export const UPDATE_PASSWORD_FAILURE = 'SEND_RESET_PASSWORD_FAILURE'
export const UPDATE_ROLE = 'UPDATE_ROLE'


export function userLoginSuccess(userPassed) {
  return {
    type: USER_LOGIN_SUCCESS,
    user: userPassed
  }
}

export function userLoginFailure(error) {
  return {
    type: USER_LOGIN_FAILURE,
    error: error
  }
}

export function userSignupSuccess(userPassed) {
  return {
    type: USER_SIGNUP_SUCCESS,
    user: userPassed
  }
}

export function userSignupFailure(error) {
  return {
    type: USER_SIGNUP_FAILURE,
    error: error
  }
}

export function editUserSuccess(userPassed) {
  return {
    type: EDIT_USER_SUCCESS,
    user: userPassed
  }
}

export function editUserFailure(error) {
  return {
    type: EDIT_USER_FAILURE,
    error: error
  }
}

export function deleteUserSuccess(userPassed) {
  return {
    type: DELETE_USER_SUCCESS,
    user: userPassed
  }
}

export function deleteUserFailure(error) {
  return {
    type: DELETE_USER_FAILURE,
    error: error
  }
}

export function sendResetPasswordSuccess(){
  return {
    type: SEND_RESET_PASSWORD_SUCCESS
  }
}

export function sendResetPasswordFailure(error){
  return {
    type: SEND_RESET_PASSWORD_FAILURE,
    error: error
  }
}

export function updatePasswordSuccess(userPassed){
  return {
    type: UPDATE_PASSWORD_SUCCESS,
    user: userPassed
  }
}

export function updatePasswordFailure(error){
  return {
    type: UPDATE_PASSWORD_FAILURE,
    error: error
  }
}
export function userLogout() {
  return {
    type: USER_LOGOUT
  }
}

export function updateRole(role) {
  return {
    type: UPDATE_ROLE,
    role: role
  }
}

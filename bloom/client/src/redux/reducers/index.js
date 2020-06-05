import { combineReducers } from 'redux'
import userReducer from './user'
import alertReducer from './alert'
import serviceReducer from './service'
import workerReducer from './worker'
import storeReducer from './stores'
import searchReducer from './search'
import reservationReducer from './reservation'
import appointmentReducer from './appointment'

let rootReducer = combineReducers({
  userReducer,
  alertReducer,
  storeReducer,
  searchReducer,
  serviceReducer,
  workerReducer,
  reservationReducer,
  appointmentReducer
})

export default rootReducer;

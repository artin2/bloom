import { combineReducers } from 'redux'
import userReducer from './user'
import alertReducer from './alert'
import serviceReducer from './service'
import workerReducer from './worker'
import storeReducer from './stores'
import searchReducer from './search'
import reservationReducer from './reservation'
import appointmentReducer from './appointment'
import calendarReducer from './calendar'
import reviewReducer from './review'
import { USER_LOGOUT } from "../actions/user";


const rootReducer = (state, action) => {
   // Clear all data in redux store to initial.
   if(action.type === USER_LOGOUT)
      state = undefined;

   return appReducer(state, action);
};

let appReducer = combineReducers({
  userReducer,
  alertReducer,
  storeReducer,
  searchReducer,
  serviceReducer,
  workerReducer,
  reservationReducer,
  appointmentReducer,
  calendarReducer,
  reviewReducer
})

export default rootReducer;

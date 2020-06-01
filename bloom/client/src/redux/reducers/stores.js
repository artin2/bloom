import { ADD_STORE } from "../actions/stores"

const initialState = {
  stores: [],
}

function storeReducer(state = initialState, action) {
  switch (action.type) {

    case ADD_STORE:

      let new_stores = state.stores
      if(new_stores) {
        new_stores.push(action.store)
      }
      else {
        new_stores = [action.store]
      }
      return Object.assign({}, state, {
        stores: new_stores
      })

    default:
      return state
  }
}

export default storeReducer;

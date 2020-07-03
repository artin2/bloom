import { ADD_STORE_SUCCESS, GET_STORES_SUCCESS, STORES_FAILURE, STORES_FETCHING, STORE_HOURS_SUCCESS, UPDATE_CURRENT_STORE, EDIT_STORE_SUCCESS } from "../actions/stores"

const initialState = {
  stores: null,
  error: null,
  isFetching: false,
  store: null
}

function storeReducer(state = initialState, action) {
  switch (action.type) {

    case GET_STORES_SUCCESS:
    console.log(action.stores)
      return Object.assign({}, state, {
        stores: action.stores
      })

    case STORES_FAILURE:
      return Object.assign({}, state, {
          error: action.error
      })

    case UPDATE_CURRENT_STORE:
      return Object.assign({}, state, {
          store: action.store
      })

    case STORES_FETCHING:
      return Object.assign({}, state, {
        isFetching: action.isFetching
      })

    case STORE_HOURS_SUCCESS:
      console.log("action is!!!: ", action)
      let store = state.store
      store.storeHours = action.storeHours
      console.log("store is now: ", store)
      return Object.assign({}, state, {
        store: store
      })


    case ADD_STORE_SUCCESS:

      let new_stores = state.stores
      if(new_stores) {
        new_stores.push(action.store)
      }
      else {
        new_stores = [action.store]
      }
      return Object.assign({}, state, {
        stores: new_stores,
        store: action.store
      })


    case EDIT_STORE_SUCCESS:

      let updated_stores = state.stores.filter(store => store.id != action.store.id);
        if(updated_stores) {
          updated_stores.push(action.store)
        }
        else {
          updated_stores = [action.store]
        }
        return Object.assign({}, state, {
        stores: updated_stores,
        store: action.store
      })

    default:
      return state
  }
}

export default storeReducer;

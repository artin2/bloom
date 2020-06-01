import { SEARCH_SUCCESS, SEARCH_FAILURE, SEARCH_FETCHING } from "../actions/search"

const initialState = {
  stores: {},
  error: {},
  isFetching: false,
  center: {}
}

function searchReducer(state = initialState, action) {
  switch (action.type) {
    case SEARCH_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case SEARCH_SUCCESS:
      return Object.assign({}, state, {
        stores: action.stores,
        center: action.center
      })

    case SEARCH_FETCHING:
      return Object.assign({}, state, {
        isFetching: action.isFetching
      })


    default:
      return state
  }
}

export default searchReducer;

import { ADD_REVIEW_SUCCESS, ADD_REVIEW_FAILURE } from "../actions/review"

const initialState = {
  review: {},
  error: ''
}

function reviewReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_REVIEW_SUCCESS:
      return Object.assign({}, state, {
        review: action.review,
      })

    case ADD_REVIEW_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    default:
      return state
  }
}

export default reviewReducer;

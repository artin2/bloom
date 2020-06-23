export const ADD_REVIEW_SUCCESS = 'ADD_REVIEW_SUCCESS'
export const ADD_REVIEW_FAILURE = 'ADD_REVIEW_FAILURE'

export function addReviewSuccess(reviewPassed) {
  return {
    type: ADD_REVIEW_SUCCESS,
    review: reviewPassed
  }
}

export function addReviewFailure(error) {
  return {
    type: ADD_REVIEW_FAILURE,
    error: error
  }
}
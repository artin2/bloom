export const SEARCH_SUCCESS = 'SEARCH_SUCCESS'
export const SEARCH_FAILURE = 'SEARCH_FAILURE'
export const SEARCH_FETCHING = 'SEARCH_FETCHING'

export function searchSuccess(stores, center) {
  return {
    type: SEARCH_SUCCESS,
    stores: stores,
    center: center
  }
}

export function searchFailure(error) {
  return {
    type: SEARCH_FAILURE,
    error: error
  }
}

export function searchFetching(fetching) {
  return {
    type: SEARCH_FETCHING,
    isFetching: fetching
  }
}

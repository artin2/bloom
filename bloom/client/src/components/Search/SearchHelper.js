import {searchSuccess, searchFailure, searchFetching} from '../../redux/actions/search';

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// SEARCH FUNCTIONS

export function getSearchResults(query){
  return dispatch => {
    dispatch(searchFetching(true))
    fetch(fetchDomain + '/stores' + query, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          // should throw an error here
          console.log("ERROR!", response)
          dispatch(searchFailure(response))
          dispatch(searchFetching(false))
        }
        else {
          return response.json();
        }
      })
      .then(data => {
        if (data) {

          console.log(data)
          dispatch(searchSuccess(data.stores, data.center))
          dispatch(searchFetching(false))
          return data;
        }
      });

  }

}

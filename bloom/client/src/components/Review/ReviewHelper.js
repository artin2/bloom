import {addReviewSuccess, addReviewFailure} from '../../redux/actions/review';

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// REVIEW FUNCTIONS

export function addReview(store_id, values){
  return dispatch => {
    // dispatch(addServiceFetching(true))
    console.log("!!!!!!!!")
    fetch(fetchDomain + '/stores/' + store_id + '/addReview/', {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function(response){
      console.log("Added review!!!")
      if(response.status!==200){
        console.log("failure")
        dispatch(addReviewFailure(response))
      }
      else{
        console.log("success")
        return response.json();
      }
    })
    .then(async function(data){

      if(data){
        dispatch(addReviewSuccess(data))
        return data
      }
    })
  }
}
import {getCategoriesSuccess, serviceFailure, serviceFetching, addServiceSuccess, getServiceSuccess, updateCurrentService, editServiceSuccess} from '../../redux/actions/service';
import {getSearchServices, searchFailure} from '../../redux/actions/search'

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// SERVICE FUNCTIONS

export function getCategories(store_id){
  return dispatch => {
    dispatch(serviceFetching(true))
    fetch(fetchDomain + '/stores/' + store_id + "/categories" , {
      method: "GET",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include'
    })
    .then(function(response){
      if(response.status!==200){
        // throw an error alert
        dispatch(serviceFailure(response))
        dispatch(serviceFetching(false))
      }
      else{
        return response.json();
      }
    })
    .then(data => {
      if(data){
        dispatch(getCategoriesSuccess(data[0].category))
        dispatch(serviceFetching(false))
        return data
      }
    });
  }
}

export function addService(store_id, values){
  return dispatch => {
    dispatch(serviceFetching(true))
    fetch(fetchDomain + '/stores/addService/' + store_id, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function(response){
      if(response.status!==200){
        dispatch(serviceFailure(response))
        dispatch(serviceFetching(false))
      }
      else{
        return response.json();
      }
    })
    .then(async function(data){

      if(data){
        dispatch(addServiceSuccess(data))
        dispatch(serviceFetching(false))
        return data
      }
    })
  }
}

export function getService(store_id, service_id) {
  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id + '/services/' + service_id, {
      method: "GET",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include'
    })
    .then(function(response){
      if(response.status!==200){
        // throw an error alert
        dispatch(serviceFailure(response))
      }
      else{
        return response.json();
      }
    })
    .then(data => {
      if(data){

        dispatch(updateCurrentService(data))
        return data
      }
    });
  }
}

export function getServices(store_id, mode) {
  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id + "/services/", {
      method: "GET",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include'
    })
    .then(function(response){
      if(response.status!==200){
        // throw an error alert
        if(mode=="search") {
          dispatch(searchFailure(response))
        }else {
          dispatch(serviceFailure(response))
        }

      }
      else{
        return response.json();
      }
    })
    .then(function(data){

      if(data){

        if(mode=="search") {
          dispatch(getSearchServices(data))
        }
        else {
          dispatch(getServiceSuccess(data))
        }

        return data
      }
    })
  }
}


export function editService(store_id, service_id, values) {
  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id + "/services/" + service_id, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
    .then(function(response){
      if(response.status!==200){

        dispatch(serviceFailure(response))
      }
      else{
        return response.json();
      }
    })
    .then(function(data){
      // redirect to home page signed in
      if(data){
        dispatch(editServiceSuccess(data))
        return data;
      }
    })
  }
}

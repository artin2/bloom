import { getStoresSuccess, storesFailure, storesFetching, addStoreSuccess, updateCurrentStore, storeHoursSuccess, editStoreSuccess } from '../../redux/actions/stores';
import { getWorkerSuccess } from '../../redux/actions/worker';
import { getServiceSuccess, getCategoriesSuccess } from '../../redux/actions/service';
import { updateSelectedStore, searchFailure } from '../../redux/actions/search'
import { toast } from 'react-toastify'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

function failureToast(message) {
  toast.error('⚠️ ' + message, {
    position: "top-right",
    autoClose: 6000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  })
}
// SERVICE FUNCTIONS

export function getStoreHours(store_id) {
  console.log("getting store hours")
  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id + "/storeHours", {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          failureToast(response.statusText)
          dispatch(storesFailure(response))
          // return response.json()
        }
        else {
          return response.json();
        }
      })
      .then(data => {
        // on successful retrieval of store data, map worker's potential valid hours accordingly
        if (data) {
          console.log("data is: ", data)
          dispatch(storeHoursSuccess(data))
          return data;
        }
      });
  }
}


export function getStore(store_id, mode) {
  return dispatch => {
    fetch(fetchDomain + '/stores/' + store_id, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          failureToast(response.statusText)
          if (mode == "search") {
            dispatch(searchFailure(response))
          }
          else {
            dispatch(storesFailure(response))
          }
        }
        else {
          return response.json();
        }
      })
      .then(async data => {
        if (data) {
          data.storeHours = await getStoreHoursInternal(data.id)
          console.log("store hours is:", data.storeHours)

          if (mode == "search") {
            dispatch(updateSelectedStore(data))
          }
          else {
            console.log("!!!!!@#!@#!@#!@#", data)
            dispatch(updateCurrentStore(data))
          }

          return data

        }
      })
  }
}

export function getStores(user_id) {
  return dispatch => {

    fetch(fetchDomain + '/stores/users/' + user_id, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          failureToast(response.statusText)
          dispatch(storesFailure(response))

        }
        else {
          return response.json();
        }
      })
      .then(async data => {
        if (data) {

          dispatch(getStoresSuccess(data))
          // dispatch(getWorkerSuccess(data.workers))
          // dispatch(getServiceSuccess(data.services))
          // dispatch(getCategoriesSuccess(data.category))

          return data
        }
      });
  }
}

export function editStore(store_id, values) {
  return dispatch => {
    fetch(fetchDomain + '/stores/edit/' + store_id, {
      method: "POST",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
      .then(function (response) {
        if (response.status !== 200) {
          failureToast(response.statusText)
          dispatch(storesFailure(response))
        }
        else {
          // redirect to home page signed in
          return response.json()
        }
      })
      .then(async data => {
        if (data) {

          data.storeHours = await getStoreHoursInternal(store_id)
          dispatch(editStoreSuccess(data))
          return data
        }
      })
  }
}

export function addStore(store_id, values) {
  return dispatch => {
    fetch(fetchDomain + '/addStore', {
      method: "POST",
      headers: {
        'Content-type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(values)
    })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          dispatch(storesFailure(response))
        }
        else {
          return response.json();
        }
      })
      .then(async data => {
        if (data) {

          data.storeHours = await getStoreHours(data.id)
          dispatch(addStoreSuccess(data))
          return data
        }
      })
  }
}

// INTERNAL FUNCTIONS

function getStoreHoursInternal(store_id) {
    console.log("getting store hours")
    return fetch(fetchDomain + '/stores/' + store_id + "/storeHours", {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      })
        .then(function (response) {
          if (response.status !== 200) {
            // throw an error alert
            failureToast(response.statusText)
            // dispatch(storesFailure(response))
            // return response.json()
          }
          else {
            return response.json();
          }
        })
        .then(data => {
          // on successful retrieval of store data, map worker's potential valid hours accordingly
          if (data) {
            console.log("data is: ", data)
            // dispatch(storeHoursSuccess(data))
            return data;
          }
        });
  }

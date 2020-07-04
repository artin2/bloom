import { ADD_SERVICE_SUCCESS, SERVICE_FAILURE, SERVICE_FETCHING, GET_CATEGORIES_SUCCESS, SERVICE_SUCCESS, UPDATE_CURRENT_SERVICE, EDIT_SERVICE_SUCCESS } from "../actions/service"

const initialState = {
  services: null,
  service: null,
  categories: null,
  isFetching: false,
  error: null
}

function serviceReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_SERVICE_SUCCESS:
      let newServices = state.services;
      if(newServices){
        newServices.push(action.service);
      }
      else{
        newServices = [action.service];
      }

      return Object.assign({}, state, {
        service: action.service,
        services: newServices
      })

    case GET_CATEGORIES_SUCCESS:
      return Object.assign({}, state, {
        categories: action.categories
      })

    case SERVICE_FAILURE:
      return Object.assign({}, state, {
        error: action.error
      })

    case SERVICE_FETCHING:
      return Object.assign({}, state, {
        isFetching: action.fetching
      })

    case SERVICE_SUCCESS:
      return Object.assign({}, state, {
        services: action.services
      })

    case UPDATE_CURRENT_SERVICE:
      return Object.assign({}, state, {
        service: action.service
      })

    case EDIT_SERVICE_SUCCESS:
        let updatedServices= state.services.filter(service => service.id != action.service.id);
        if(updatedServices){
          updatedServices.push(action.service);
        }
        else{
          updatedServices = [action.service];
        }

        return Object.assign({}, state, {
          service: action.service,
          services: updatedServices
        })
    default:
      return state
  }
}

export default serviceReducer;

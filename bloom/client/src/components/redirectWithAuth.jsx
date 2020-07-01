import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import store from '../redux/store';
import { handleLogout } from './helperFunctions';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

export default function redirectWithAuth(ComponentToProtect, addAlert) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        redirect: false,
      };
    }
    componentDidMount() {
      fetch(fetchDomain + '/checkToken' , {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      }).then(res => {
          if (res.status === 200) {
            console.log("here!")
            this.setState({ loading: false, redirect: true });
          } else {
            let user = store.getState().userReducer.user
            if(!(Object.keys(user).length === 0 && user.constructor === Object)){
              console.log("here", store.getState())
              handleLogout(false, false);
            }
            this.setState({ loading: false, redirect: false });
          }
        })
    }
    render() {
      const { loading, redirect } = this.state;
      if (loading) {
        return null;
      }
      if (redirect) {
        return <Redirect to="/"/>;
      }
      else {
        return <ComponentToProtect addAlertPassed={addAlert} {...this.props}/>;
      }
    }
  }
}
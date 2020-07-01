import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import store from '../redux/store';
import { handleLogout } from './helperFunctions';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

export default function redirectWithPreviousReviewOrNoAppt(ComponentToProtect, addAlert) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        redirect: false,
      };
    }
    componentDidMount() {
      if(Cookies.get('token')){
        fetch(fetchDomain + '/checkTokenPrevReviewAndAppt', {
          method: "POST",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({store_id: this.props.match.params.store_id, email: JSON.parse(Cookies.get('user').substring(2)).email})
        }).then(res => {
          if (res.status === 200) {
            this.setState({
              loading:false,
              redirect: false
            })
          } else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch(err => {
          console.log("error", err)
          this.setState({ loading: false, redirect: true });
        });
      }
      else{
        let user = store.getState().userReducer.user
        if(!(Object.keys(user).length === 0 && user.constructor === Object)){
          console.log("here", store.getState())
          handleLogout(false, false);
        }

        this.setState({ loading: false, redirect: true})
      }
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
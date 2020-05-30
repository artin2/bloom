//CITATION: https://medium.com/@faizanv/authentication-for-your-react-and-express-application-w-json-web-tokens-923515826e0
import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import store from '../redux/store';

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

export default function redirectWithoutAuth(ComponentToProtect) {
  return class extends Component {
    constructor(props) {
      super(props);
      this.state = {
        loading: true,
        redirect: false,
      };
    }
    componentDidMount() {
      // note, should you be allowed to edit serivces if you are a worker and not the owner?
      if(this.props.match.params.store_id){
        if(Cookies.get('token')){
          fetch(fetchDomain + '/checkTokenAndPermissions' , {
            method: "POST",
            headers: {
              'Content-type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({store_id: this.props.match.params.store_id, worker_id: this.props.match.params.worker_id, user_id: JSON.parse(Cookies.get('user').substring(2)).id})
          }).then(res => {
            if (res.status === 200) {
              this.setState({ loading: false });
            } else {
              const error = new Error(res.error);
              throw error;
            }
          })
          .catch(err => {
            this.setState({ loading: false, redirect: true });
          });
        }
        else{
          this.setState({ loading: false, redirect: true})
        }
      }
      else {
        fetch(fetchDomain + '/checkToken' , {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(res => {
          if (res.status === 200) {
            // verified user is logged in and has a valid token
            // if they are trying to access private data, make sure it is the correct user
            if(this.props.match.params.user_id){
              let user = store.getState().userReducer.user

              if (user.id === Number(this.props.match.params.user_id)) {
                // if they are trying to access stores when they don't own any
                if(typeof user.role === 'string' )
                if(window.location.href.split("/users/" + this.props.match.params.user_id + '/stores').length > 1 && ((typeof user.role === 'string' && user.role !== '1') || (typeof user.role === 'number' && user.role !== 1))){
                  this.setState({
                    loading:false,
                    redirect: true
                  })
                }
                else{
                  this.setState({
                    loading: false,
                  })
                }
              }
              else{
                this.setState({
                  loading: false,
                  redirect: true
                })
              }
            }
            this.setState({ loading: false });
          } else {
            const error = new Error(res.error);
            throw error;
          }
        })
        .catch(err => {
          this.setState({ loading: false, redirect: true });
        });
      }
    }

    render() {
      const { loading, redirect } = this.state;
      if (loading) {
        return null;
      }
      if (redirect) {
        return <Redirect to="/login" />;
      }
      else {
        return <ComponentToProtect {...this.props} />;
      }
    }
  }
}

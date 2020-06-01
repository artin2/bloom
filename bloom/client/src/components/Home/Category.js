import React from 'react';
import './Homepage.css';
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { Image } from 'react-bootstrap';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getSearchResults } from '../Search/SearchHelper.js'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const helper = require('../Search/helper.js');

class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores : [],
      address: '',
      distance: 10,
      redirect: false,
      center: {
        lat: '',
        lng: ''
      },
      nails: false,
      hair: false,
      facials: false,
      barber: false,
      spa: false,
      makeup: false,
    };

    this.getStores = this.getStores.bind(this);
    this.getCurrentLocation = this.getCurrentLocation.bind(this);
  }

  async getCurrentLocation() {

    const google = window.google;
    if (navigator.geolocation) {
      this._displayLocation = (latitude, longitude) => {
        const geocoder = new google.maps.Geocoder();
        const latlng = new google.maps.LatLng(latitude, longitude);
        this.geocodeAddress(geocoder, latlng);
      };

      this.geoSuccess = (position) => {
          this._displayLocation(position.coords.latitude, position.coords.longitude);
        };

      this.geoError = (error) => {
        switch (error.code) {
          case error.TIMEOUT:
          console.log("Browser geolocation error !\n\nTimeout.");
          break;
          case error.PERMISSION_DENIED:
          console.log("Only secure origins are allowed");
          break;
          case error.POSITION_UNAVAILABLE:
          console.log("Browser geolocation error !\n\nPosition unavailable.");
          break;
          default:
          console.log(error.code);
          break;
        }
      };
      await navigator.geolocation.getCurrentPosition(this.geoSuccess, this.geoError);
    }
    else {
      console.log("Geolocation is not supported for this Browser/OS.");
    }

    this.geoCodeCallback = (results, status, event) => {
      const google = window.google; // eslint-disable-line
      if (status === google.maps.GeocoderStatus.OK) {
        if (results[0]) {
          const add = results[0].formatted_address;
          console.log("My Current Location:", add)
          this.setState({
            address: add
          })
          // here we can dispatch action to search by city name and autofill the autocomplete
        } else {
          console.log("address not found");
        }
      } else {
        console.log(status);
      }
    }

    this.geocodeAddress = (geocoder, latlng) => {
      this.setState({
        center: {
          lat: latlng.lat(),
          lng: latlng.lng()
        },
      })
      geocoder.geocode({ location: latlng }, this.geoCodeCallback);
    }
  }

  async componentDidUpdate(prevProps, prevState) {
    if(prevState.address !== this.state.address){
      await this.setState({
        [this.props.id]: true
      })

      let query = helper.queryString(this.state)
      this.props.getSearchResults(query)

      this.props.history.push({
        pathname: '/search',
        search: query,
      })

    }
  }

  async getStores() {
    this.getCurrentLocation()
  }

  render() {
    return (
      <div onClick={() => this.getStores()} className="image-container" style={this.props.style}>
      <Image fluid src={this.props.img} alt="paint" className="images"/>
      <p className="text"> {this.props.text} </p>
      </div>
    );
  }
}


const mapDispatchToProps = dispatch => bindActionCreators({
  getSearchResults: (query) => getSearchResults(query)
}, dispatch)


export default connect(null, mapDispatchToProps)(Category);

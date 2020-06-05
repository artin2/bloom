import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Map, InfoWindow, Marker } from 'google-maps-react';
import blueCompass from '../../assets/blue-compass-icon.png'
import {Button} from 'react-bootstrap'
import Card from 'react-bootstrap/Card'
import { FaPhone } from 'react-icons/fa';

class MapContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showingInfoWindow: false,  //Hides or the shows the infoWindow
      activeMarker: {},          //Shows the active marker upon click
      selectedPlace: {},          //Shows the infoWindow to the selected place upon a marker
      activeMarkerIndex: 0
    };

    this.onMarkerClick = this.onMarkerClick.bind(this);
    this.onClose = this.onClose.bind(this);
  }

  displayMarkers() {
    if(this.props.stores && this.props.stores.length > 0) {
      return this.props.stores.map((store, index) => {
        return <Marker key={"store-" + index} id={index} position={{
                       lat: store.lat,
                       lng: store.lng }}
                       onClick={this.onMarkerClick}
                       name={store.name} />
      })
    } else {
      return null
    }
  }

  displayCurrentLocation() {
    if(this.props.center) {
      const google = window.google;
      return <Marker key={"current-location"}
                     id={"cur-loc"}
                     position={{
                       lat: this.props.center.lat,
                       lng: this.props.center.lng }}
                     icon={{
                        url: blueCompass,
                        scaledSize: new google.maps.Size(24,24)
                      }}/>
    } else {
      return null
    }
  }

  onMarkerClick = (props, marker, e) =>
  this.setState({
    selectedPlace: props,
    activeMarker: marker,
    showingInfoWindow: true,
    activeMarkerIndex: marker.id
  });

  onClose = props => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      });
    }
  };

  onInfoWindowOpen(props, e) {
    const button = (<Button style={{backgroundColor: '#8CAFCA', border: 0}} onClick={() => this.props.onClickFunctionBook(this.props.stores[this.state.activeMarkerIndex])}>Book Now</Button>);
    ReactDOM.render(React.Children.only(button), document.getElementById("iwc"));

    const title = (<h5 className="m-2" style={{cursor: 'pointer'}} onClick={() => this.props.onClickFunctionStore(this.props.stores[this.state.activeMarkerIndex])}>{this.props.stores[this.state.activeMarkerIndex].name}</h5>)
    ReactDOM.render(React.Children.only(title), document.getElementById("iwt"));
  }

  render() {
    const DisplayInfoWindowContents = (props) => {
      if(this.props.stores) {
        return <div>
                  <div id="iwt"/>
                  <Card.Text className="mb-3">{this.props.stores[this.state.activeMarkerIndex].address.split(",").splice(0, 4).join(", ")}</Card.Text>
                  <Card.Text className="mb-3">
                    <FaPhone size={12}/> {this.props.stores[this.state.activeMarkerIndex].phone}
                  </Card.Text>
                  <div id="iwc"/>
                </div>
      } else {
        return null
      }
    }

    return (
      <Map
        google={this.props.google}
        zoom={this.props.zoom}
        style={this.props.mapStyles}
        initialCenter={this.props.center}
      >
        {this.displayCurrentLocation()}
        {this.displayMarkers()}
        <InfoWindow
          marker={this.state.activeMarker}
          visible={this.state.showingInfoWindow}
          onClose={this.onClose}
          onOpen={e => {
            this.onInfoWindowOpen(this.props, e);
          }}
        >
          <DisplayInfoWindowContents/>
        </InfoWindow>
      </Map>
    );
  }
}

export default MapContainer;

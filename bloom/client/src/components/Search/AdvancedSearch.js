import React from 'react';
import './AdvancedSearch.css'
import { Form, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import { withRouter } from "react-router-dom";
import { Multiselect } from 'multiselect-react-dropdown';
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getSearchResults } from './SearchHelper.js'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const helper = require('./helper.js');

class AdvancedSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      selected: [],
      address: '',
      distance: 1,
      redirect: false,
      center: {
        lat: '',
        lng: ''
      },
      category: helper.getCategories(),
      nails: false,
      hair: false,
      facials: false,
      barber: false,
      spa: false,
      makeup: false,
    };
    this.autocomplete = null
    this.redirect = false

    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onSelect(selectedList, selectedItem) {

    this.setState({
      selected: selectedList
    })

    selectedItem = selectedItem.name;

    if(selectedItem === "Nail Salon"){
      this.setState({
        nails: true
      })
    }
    else if(selectedItem === "Hair Salon"){
      this.setState({
        hair: true
      })
    }
    else if(selectedItem === "Facials"){
      this.setState({
        facials: true
      })
    }
    else if(selectedItem === "Spa & Wellness"){
      this.setState({
        spa: true
      })
    }
    else if(selectedItem === "Makeup"){
      this.setState({
        makeup: true
      })
    }
    else{
      if(selectedItem === "Barbershops"){
        this.setState({
          barber: true
        })
      }
    }
  }

  onRemove(selectedList, removedItem, event) {

    this.setState({
      selected: selectedList
    })

    removedItem = removedItem.name;

    if(removedItem === "Nail Salon"){
      this.setState({
        nails: false
      })
    }
    else if(removedItem === "Hair Salon"){
      this.setState({
        hair: false
      })
    }
    else if(removedItem === "Facials"){
      this.setState({
        facials: false
      })
    }
    else if(removedItem === "Spa & Wellness"){
      this.setState({
        spa: false
      })
    }
    else if(removedItem === "Makeup"){
      this.setState({
        makeup: false
      })
    }
    else if(removedItem === "Barbershops"){
      this.setState({
        barber: false
      })
    }
  }

  componentDidMount() {
    const google = window.google;
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), { })

    this.autocomplete.addListener("place_changed", this.handlePlaceSelect)
  }


  handlePlaceSelect() {
    let addressObject = this.autocomplete.getPlace()

    let address = addressObject.address_components.map(function(elem){
                      return elem.long_name;
                  }).join(", ");

    this.setState({
      address: address,
      center: {
        lat: addressObject.geometry.location.lat(),
        lng: addressObject.geometry.location.lng()
      }
    })
  }

  handleChange(event) {
    this.setState({
      distance: parseInt(event.target.value.split(" ")[0])
    })
  }

  async handleSubmit(event) {
    // for some reason doesn't work without this..
    event.preventDefault();

    if(!this.state.address) {
      return;
    }

    let queryString = helper.queryString;
    let query = queryString(this.state)

    this.props.getSearchResults(query);

    this.props.history.push({
      pathname: '/search',
      search: helper.queryString(this.state),
    })

  }

  render() {
    return (
      <Form className="formBody rounded p-5" onSubmit={this.handleSubmit}>
        <h3>Book Now</h3>
        <Form.Group controlId="autocomplete">
        <Row>
          <Form.Label>Address</Form.Label>
          <Form.Control
            type="text"
            placeholder="Try 'New Haven, CT'"
            autoComplete="new-password"
          />
        </Row>
        </Form.Group>

        <Form.Group>
          <Row>
          <Form.Label>Distance</Form.Label>
          <Form.Control as="select" id="distance" onChange={this.handleChange}>
            <option>1 mile</option>
            <option>5 miles</option>
            <option>10 miles</option>
            <option>25 miles</option>
            <option>50 miles</option>
          </Form.Control>
          </Row>
        </Form.Group>

        <Form.Group controlId="category">
          <Row>
          <Form.Label>Category</Form.Label>


          <Multiselect
            options={this.state.category}
            onSelect={this.onSelect}
            onRemove={this.onRemove}
            placeholder="Pick a Category"
            closeIcon="cancel"
            displayValue="name"
            avoidHighlightFirstOption={true}
            style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 50, maxWidth: 50}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
            />

          </Row>
        </Form.Group>
          <Button disabled={!(this.state.address)} style={{backgroundColor: '#8CAFCB', border: 'none'}} type="submit">Submit</Button>
      </Form>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  getSearchResults: (query) => getSearchResults(query)
}, dispatch)


export default withRouter(connect(null, mapDispatchToProps)(AdvancedSearch));

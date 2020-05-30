import React from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import Col from 'react-bootstrap/Col'
import './SearchBar.css'
import {withRouter} from 'react-router'
import { FiSearch } from 'react-icons/fi';
import Select from 'react-select'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getSearchResults } from './SearchHelper.js'

const helper = require('./helper.js');

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      center: {
        lat: '',
        lng: ''
      },
      categories: helper.getCategoriesAsPairs(),
      selectedCategory: "",
      address: '',
      distanceSelect: "",
      distance: 15,
      nails: false,
      hair: false,
      facials: false,
      barber: false,
      spa: false,
      makeup: false,
      searchRadiusList: [{value: 1, label: '1 mile'}, {value: 5, label: '5 miles'}, {value: 10, label: '10 miles'}, {value: 25, label: '25 miles'}, {value: 50, label: '50 miles'}]
    }

    this.autocomplete = null
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSelectChange = (selectedCategory) => {
    // there must be a better way to do this

    if(selectedCategory.value === "Nails") {
      this.setState({
        nails: true,
        hair: false,
        facials: false,
        barber: false,
        spa: false,
        makeup: false,
      })
    } else if (selectedCategory.value === "Hair") {
      this.setState({
        nails: false,
        hair: true,
        facials: false,
        barber: false,
        spa: false,
        makeup: false,
      })
    } else if (selectedCategory.value === "Facials") {
      this.setState({
        nails: false,
        hair: false,
        facials: true,
        barber: false,
        spa: false,
        makeup: false,
      })
    } else if (selectedCategory.value === "Barbershops") {
      this.setState({
        nails: false,
        hair: false,
        facials: false,
        barber: true,
        spa: false,
        makeup: false,
      })
    } else if (selectedCategory.value === "Spa") {
      this.setState({
        nails: false,
        hair: false,
        facials: false,
        barber: false,
        spa: true,
        makeup: false,
      })
    } else if (selectedCategory.value === "Makeup") {
      this.setState({
        nails: false,
        hair: false,
        facials: false,
        barber: false,
        spa: false,
        makeup: true,
      })
    } else {
      this.setState({
        nails: true,
        hair: true,
        facials: true,
        barber: true,
        spa: true,
        makeup: true,
      })
    }
    this.setState({ selectedCategory });
  }

  handleSearchRadiusChange = (distanceSelect) => {
    this.setState({
      distanceSelect: distanceSelect,
      distance: distanceSelect.value
    });
  }

  handleSubmit() {
    let queryString = require('./helper.js').queryString;
    const formState = (({ address, distance, nails, hair, spa, facials, barber, makeup }) => ({ address, distance, nails, hair, spa, facials, barber, makeup }))(this.state);
    let query = queryString(formState)

    this.props.getSearchResults(query)

    this.props.history.push({
      pathname: "/search",
      search: query,
      // state: {
      //   address: this.state.address
      // }
    });
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

  componentDidMount () {
    const google = window.google;
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), { })

    this.autocomplete.addListener("place_changed", this.handlePlaceSelect)
    if(this.props.location.state && this.props.location.state.address) {
      this.setState({
        address: this.props.location.state.address
      })
    }
  }

  render() {
    return (
        <Form inline className="full-width">
          <Form.Row className="px-1 full-width justify-content-center">
            <Col xs={12} lg={5} xl={4} className="form-horizontal">
              <Form.Group className="full-width" controlId="autocomplete">
                <InputGroup className="not-auto">
                  <Form.Control
                    className="full-width"
                    type="text"
                    placeholder="Try 'New Haven, CT'"
                    autoComplete="new-password"
                    defaultValue={this.state.address}
                  />
                  <InputGroup.Append>
                    <Button variant="secondary" onClick={this.handleSubmit} disabled={!this.state.address}>
                      <FiSearch />
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col xs={12} lg={3} xl={2}>
              <Form.Group className="full-width">
              <Select
                className="full-width"
                placeholder="Category"
                value={this.state.selectedCategory}
                onChange={this.handleSelectChange}
                options={this.state.categories}
              />
              </Form.Group>
            </Col>
            <Col xs={12} lg={3} xl={2}>
              <Form.Group className="full-width">
              <Select
                className="full-width"
                placeholder="Distance"
                value={this.state.distanceSelect}
                onChange={this.handleSearchRadiusChange}
                options={this.state.searchRadiusList}
              />
              </Form.Group>
            </Col>
          </Form.Row>
        </Form>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  getSearchResults: (query) => getSearchResults(query)
}, dispatch)


export default withRouter(connect(null, mapDispatchToProps)(SearchBar));

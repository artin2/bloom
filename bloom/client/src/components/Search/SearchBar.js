import React from 'react';
import { Form, InputGroup, Button, Collapse, Row, Col } from 'react-bootstrap';
import './SearchBar.css'
import {withRouter} from 'react-router'
import { FiSearch } from 'react-icons/fi';
import Select from 'react-select'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getSearchResults } from './SearchHelper.js'
import DatePicker from "react-datepicker";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io"

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
      date: '',
      dayOfWeek: '',
      from: 'Any',
      to: 'Any',
      fromFinal: 0,
      toFinal: 1440,
      fromTime: -1,
      open: false,
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

  convertHoursToMin(time, fromFlag){
    if(time != 'Any'){
      let timeSplit = time.split(":00")
      let finalTime
  
      if(timeSplit[1] === ' am'){
        if(timeSplit[0] === '12'){
          finalTime = 0
        }
        else{
          finalTime = parseInt(timeSplit[0]) * 60
        }
      }
      else{
        if(timeSplit[0] === '12'){
          finalTime = 720
        }
        else{
          finalTime = (parseInt(timeSplit[0]) + 12) * 60
        }
      }
  
      return finalTime
    }
    else{
      if(fromFlag === true){
        return 0
      }
      else{
        return 1440
      }
    }
  }

  getNextHour(time){
    let timeSplit = time.split(":00")
    let nextHour

    if(timeSplit[0] === '12'){
      nextHour = "1:00" + timeSplit[1]
    }
    else if(timeSplit[0] === '11'){
      if(timeSplit[1] === ' am'){
        nextHour = "12:00 pm"
      }
      else{
        nextHour = "12:00 am"
      }
    }
    else{
      nextHour = (parseInt(timeSplit[0]) + 1).toString() + ":00" + timeSplit[1]
    }

    return nextHour
  }

  handleDateChange = dateSelected => {
    if(dateSelected === null){
      this.setState({
        date: '',
        dayOfWeek: ''
      });
    }
    else{
      this.setState({
        date: dateSelected,
        dayOfWeek: dateSelected.getDay()
      });
    }
  };

  handleChange = event => {
    if(this.state.date === ''){
      this.setState({
        date: new Date()
      })
    }

    if(event.target.id === 'from'){
      let curFrom = this.convertHoursToMin(event.target.value, true)/60
      let curTo = this.convertHoursToMin(this.state.to, false)/60

      if(event.target.value === 'Any'){
        this.setState({
          from: event.target.value,
          fromTime: -1,
          to: 'Any'
        })
      }
      else if(curFrom >= curTo || this.state.to === 'Any'){
        let nextTo = this.getNextHour(event.target.value)
        this.setState({
          from: event.target.value,
          fromTime: curFrom,
          to: nextTo
        })
      }
      else{
        this.setState({
          from: event.target.value,
          fromTime: curFrom
        })
      }
    }
    else{
      this.setState({
        to: event.target.value
      })
    }
  }

  async handleSubmit() {
    let queryString = require('./helper.js').queryString;

    let from = this.convertHoursToMin(this.state.from, true)
    let to = this.convertHoursToMin(this.state.to, false)
    let dateWithoutTimezone = ''

    if(this.state.date !== ''){
      dateWithoutTimezone = this.state.date.toUTCString()
    }

    await this.setState({
      fromFinal: from,
      toFinal: to,
      dateWithoutTimezone: dateWithoutTimezone
    })

    const formState = (({ address, distance, nails, hair, spa, facials, barber, makeup, toFinal, fromFinal, dateWithoutTimezone, dayOfWeek }) => ({ address, distance, nails, hair, spa, facials, barber, makeup, toFinal, fromFinal, dateWithoutTimezone, dayOfWeek }))(this.state);
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
    let arrow
    if(this.state.open){
      arrow = <IoIosArrowUp style={{cursor: 'pointer'}} onClick={() => this.setState({ open: !this.state.open})}/>
    }
    else{
      arrow = <IoIosArrowDown style={{cursor: 'pointer'}} onClick={() => this.setState({ open: !this.state.open})}/>
    }

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
            <Col xs={1} className="mt-1 mb-1">
              {arrow}
            </Col>
          </Form.Row>
          <Collapse id="additionalFilters" style={{paddingTop:5}} in={this.state.open} className="full-width">
            <div>
              <Form.Row className="full-width mt-3 justify-content-start">
                  <Col xs={2} xl={1}>
                    <Form.Label>Date</Form.Label>
                  </Col>
                  <Col xs={10} xl={3} className='justify-content-center' className="mb-3">
                    <div className="customDatePickerWidth">
                      <DatePicker
                        className="form-control"
                        selected={this.state.date}
                        onChange={dateSelected => this.handleDateChange(dateSelected)}
                        minDate={new Date()}
                        popperModifiers={{
                          flip: {
                              behavior: ["bottom"] // don't allow it to flip to be above
                          }
                        }}
                      />
                    </div>
                  </Col>
                  <Col xs={3} xl={1}>
                    <Form.Label>Arriving</Form.Label>
                  </Col>
                  <Col xs={4} xl={2} className="p-0">
                    <Form.Control as="select" id="from" onChange={event => this.handleChange(event)} value={this.state.from}>
                      <option>Any</option>
                      <option>1:00 am</option>
                      <option>2:00 am</option>
                      <option>3:00 am</option>
                      <option>4:00 am</option>
                      <option>5:00 am</option>
                      <option>6:00 am</option>
                      <option>7:00 am</option>
                      <option>8:00 am</option>
                      <option>9:00 am</option>
                      <option>10:00 am</option>
                      <option>11:00 am</option>
                      <option>12:00 pm</option>
                      <option>1:00 pm</option>
                      <option>2:00 pm</option>
                      <option>3:00 pm</option>
                      <option>4:00 pm</option>
                      <option>5:00 pm</option>
                      <option>6:00 pm</option>
                      <option>7:00 pm</option>
                      <option>8:00 pm</option>
                      <option>9:00 pm</option>
                      <option>10:00 pm</option>
                      <option>11:00 pm</option>
                      <option>12:00 am</option>
                    </Form.Control>
                  </Col>
                  <Col xs={1} className="p-0" style={{marginTop: 5}}>
                    <p> - </p>
                  </Col>
                  <Col xs={4} xl={2} className="p-0">
                    <Form.Control as="select" id="to" onChange={event => this.handleChange(event)} value={this.state.to}>
                      <option disabled={this.state.fromTime != -1}>Any</option>
                      <option disabled={this.state.fromTime >= 1}>1:00 am</option>
                      <option disabled={this.state.fromTime >= 2}>2:00 am</option>
                      <option disabled={this.state.fromTime >= 3}>3:00 am</option>
                      <option disabled={this.state.fromTime >= 4}>4:00 am</option>
                      <option disabled={this.state.fromTime >= 5}>5:00 am</option>
                      <option disabled={this.state.fromTime >= 6}>6:00 am</option>
                      <option disabled={this.state.fromTime >= 7}>7:00 am</option>
                      <option disabled={this.state.fromTime >= 8}>8:00 am</option>
                      <option disabled={this.state.fromTime >= 9}>9:00 am</option>
                      <option disabled={this.state.fromTime >= 10}>10:00 am</option>
                      <option disabled={this.state.fromTime >= 11}>11:00 am</option>
                      <option disabled={this.state.fromTime >= 12}>12:00 pm</option>
                      <option disabled={this.state.fromTime >= 13}>1:00 pm</option>
                      <option disabled={this.state.fromTime >= 14}>2:00 pm</option>
                      <option disabled={this.state.fromTime >= 15}>3:00 pm</option>
                      <option disabled={this.state.fromTime >= 16}>4:00 pm</option>
                      <option disabled={this.state.fromTime >= 17}>5:00 pm</option>
                      <option disabled={this.state.fromTime >= 18}>6:00 pm</option>
                      <option disabled={this.state.fromTime >= 19}>7:00 pm</option>
                      <option disabled={this.state.fromTime >= 20}>8:00 pm</option>
                      <option disabled={this.state.fromTime >= 21}>9:00 pm</option>
                      <option disabled={this.state.fromTime >= 22}>10:00 pm</option>
                      <option disabled={this.state.fromTime >= 23}>11:00 pm</option>
                      <option disabled={this.state.fromTime == 0}>12:00 am</option>
                    </Form.Control>
                  </Col>
              </Form.Row>
            </div>
          </Collapse>
        </Form>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  getSearchResults: (query) => getSearchResults(query)
}, dispatch)


export default withRouter(connect(null, mapDispatchToProps)(SearchBar));

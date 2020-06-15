import React from 'react';
import './AdvancedSearch.css'
import { Form, Row, Col, Collapse } from 'react-bootstrap';
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
import DatePicker from "react-datepicker";
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const helper = require('./helper.js');

class AdvancedSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      selected: [],
      address: '11421, Clybourn Avenue, Sylmar, Los Angeles, Los Angeles County, California, United States, 91342, 6707',
      distance: 1,
      date: '',
      dayOfWeek: '',
      from: 'Any',
      to: 'Any',
      fromTime: -1,
      open: false,
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

    console.log("here", timeSplit, parseInt(timeSplit[0]) + 1)

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

    console.log("next hours is:", nextHour)
    return nextHour
  }

  handleDateChange = dateSelected => {
    this.setState({
      date: dateSelected,
      dayOfWeek: dateSelected.getDay()
    });
  };

  handleChange(event) {
    if(event.target.id === 'distance'){
      this.setState({
        distance: parseInt(event.target.value.split(" ")[0])
      })
    }
    else{
      if(this.state.date === ''){
        this.setState({
          date: new Date()
        })
      }

      if(event.target.id === 'from'){
        let curFrom = this.convertHoursToMin(event.target.value)/60
        let curTo = this.convertHoursToMin(this.state.to)/60
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
  }

  async handleSubmit(event) {
    // for some reason doesn't work without this..
    event.preventDefault();

    let from = this.convertHoursToMin(this.state.from, true)
    let to = this.convertHoursToMin(this.state.to, false)

    console.log("time", this.state.date, this.state.date.toUTCString(), Object.keys(this.state.date))

    if(this.state.selected.length === 0){
      console.log("1")
      await this.setState({
        to: to,
        from: from,
        nails: true,
        hair: true,
        facials: true,
        barber: true,
        spa: true,
        makeup: true,
        dateWithoutTimezone: this.state.date.toUTCString()
      })
      console.log("2")
    }
    else{
      await this.setState({
        to: to,
        from: from,
        dateWithoutTimezone: this.state.date.toUTCString()
      })
    }

    console.log("3")

    let queryString = helper.queryString;
    let query = queryString(this.state)

    console.log("4")

    console.log("state is:", this.state, "query is", query)

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

        <hr className="mt-4"/>
        <p className="font-weight-bold p-1" style={{cursor: 'pointer'}} onClick={() => this.setState({ open: !this.state.open})}>Additional Filters</p>

        <Collapse id="additionalFilters" style={{paddingTop:5}} in={this.state.open}>
          <Form.Group>
            <Row className='justify-content-center' className="mb-3">
              <Col xs="12" xl="2">
                <Form.Label>Date</Form.Label>
              </Col>
              <Col xs="12" xl="10">
                <div className="customDatePickerWidth">
                  <DatePicker
                    className="form-control"
                    selected={this.state.date}
                    onChange={this.handleDateChange}
                    minDate={new Date()}
                    popperModifiers={{
                      flip: {
                          behavior: ["bottom"] // don't allow it to flip to be above
                      }
                    }}
                  />
                </div>
              </Col>
              {/* <Col xs="11" md="6" className="mt-3">
                <Form>
                  <Form.Control  key={this.state.date} as="select" value={this.state.selectedTime} onChange={this.handleSelectChange.bind(this)}>
                    <CreateTimeSelects date={this.state.date} />
                  </Form.Control>
                </Form>
              </Col> */}
            </Row>

            <Row>
              <Col xs="12" xl="3">
                <Form.Label>Starting</Form.Label>
              </Col>
              <Col xs="10" xl="4" className="p-0">
                <Form.Control as="select" id="from" onChange={this.handleChange} value={this.state.from}>
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
              <Col xs="2" xl="1" className="p-0" style={{marginTop: 5}}>
                <p> - </p>
              </Col>
              <Col xs="10" xl="4" className="p-0">
                <Form.Control as="select" id="to" onChange={this.handleChange} value={this.state.to}>
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
            </Row>
          </Form.Group>
        </Collapse>

        <Button disabled={!(this.state.address)} style={{backgroundColor: '#8CAFCB', border: 'none'}} type="submit">Submit</Button>
      </Form>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  getSearchResults: (query) => getSearchResults(query)
}, dispatch)


export default withRouter(connect(null, mapDispatchToProps)(AdvancedSearch));

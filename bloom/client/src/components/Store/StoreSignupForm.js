import React from 'react';
import '../../App.css';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaShoppingCart, FaPen, FaPhone, FaMap } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import Cookies from 'js-cookie';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {updateRole} from '../../redux/actions/user.js'
import {addStore} from './StoreHelper'
import {updateCurrentStore} from '../../redux/actions/stores'
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { uploadHandler } from '../s3';
import { Multiselect } from 'multiselect-react-dropdown';
import { convertMinsToHrsMins } from '../helperFunctions'
// import { css } from '@emotion/core'
// import GridLoader from 'react-spinners/GridLoader'
// const override = css`
//   display: block;
//   margin: 0 auto;
// `;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const helper = require('../Search/helper.js');


class StoreSignupForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

      category: helper.getCategories(),
      categoryError: false,
      selected: [],
      selectedFiles: [],
      storeHours: [{ open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 }],
      weekIsWorking: [true, true, true, true, true, true, true],
      address: []
    }

    // RegEx for phone number validation
    this.phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      name: Yup.string()
        .min(2, "Store name must have at least 2 characters")
        .max(100, "Store name can't be longer than 100 characters")
        .required("Name is required"),
      description: Yup.string()
        .min(20, "Description must have at least 20 characters")
        .required("Description is required"),
      phone: Yup.string()
        .matches(this.phoneRegExp, "Phone number is not valid")
        .required("Phone number is required"),
      category: Yup.array()
        .required("Category is required"),
      address: Yup.string()
        .required("Address is required"),
      pictureCount: Yup.number()
      .required("Pictures are required")
      .min(1, "Must have at least one picture")
    });

    this.autocomplete = null
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);

    this.triggerStoreDisplay = this.triggerStoreDisplay.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  handleDayStatusChange = (day) => {
    var updateWeekIsWorking = [
      ...this.state.weekIsWorking.slice(0, day),
      !this.state.weekIsWorking[day],
      ...this.state.weekIsWorking.slice(day + 1)
    ]

    this.setState({
      weekIsWorking: updateWeekIsWorking
    })
  };
  async componentDidUpdate(prevProps) {

    if(prevProps.store !== this.props.store) {

        let prefix = 'stores/' + this.props.store.id + '/images/'
        if (this.state.selectedFiles.length > 0) {
            await uploadHandler(prefix, this.state.selectedFiles)
        }
        this.props.updateRole(1)

        this.triggerStoreDisplay(this.props.store, this.props.store.owners[0])
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
      address: address
    })
  }

  // redirect to the store display page and pass the new store data
  triggerStoreDisplay(returnedStore, user_id) {

    this.props.updateCurrentStore(returnedStore)

    this.props.history.push({
      pathname: '/users/' + user_id + '/stores',
    })
  }

  onChange(selectedList, item, setFieldValue) {
    setFieldValue("category", selectedList)
  }

  handleSelectChange = (event) => {
    var days = ['formHoursMonday', 'formHoursTuesday', 'formHoursWednesday', 'formHoursThursday', 'formHoursFriday', 'formHoursSaturday', 'formHoursSunday']
    var day = days.indexOf(event.target.id)
    var newStoreHours = []

    if (event.target.querySelector('option').value === "0") {
      newStoreHours = [
        ...this.state.storeHours.slice(0, day),
        { open_time: parseInt(event.target.value), close_time: this.state.storeHours[day].close_time },
        ...this.state.storeHours.slice(day + 1)
      ]
    } else {
      newStoreHours = [
        ...this.state.storeHours.slice(0, day),
        { open_time: this.state.storeHours[day].open_time, close_time: parseInt(event.target.value) },
        ...this.state.storeHours.slice(day + 1)
      ]
    }

    this.setState({
      storeHours: newStoreHours
    })
  };

  fileChangedHandler = (event, setFieldValue) => {
    setFieldValue('pictureCount', event.target.files.length)
    this.setState({ selectedFiles: event.target.files })
  }

  render() {
    return (
      <Container fluid>
        <Row className="justify-content-center my-5">
          <Col xs={12} lg={5}>
            <Formik
              initialValues={{
                name: '',
                description: '',
                phone: '',
                address: '',
                category: [],
                owner_id: "",
                pictureCount: this.state.selectedFiles.length,
              }}
              validationSchema={this.yupValidationSchema}
              onSubmit={(values, actions) => {
                let shorterVersion = helper.shorterVersion

                values.category = values.category.map(function (val) {
                  return shorterVersion(val.name)
                })

                values.owner_id = JSON.parse(Cookies.get('user').substring(2)).id
                values.storeHours = this.state.storeHours.map((day, index) => {
                  if(this.state.weekIsWorking[index]){
                    return day
                  }
                  else {
                    return {open_time: null, close_time: null}
                  }
                })
                values.address = this.state.address

                this.props.addStore(this.props.match.params.store_id, values)


              }}
            >
              {({ values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
                isSubmitting
              }) => (
                  <Form className="formBody rounded p-5">
                    <h3>Store Sign Up</h3>

                    <Form.Group controlId="formName">
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>
                            <FaShoppingCart />
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="text"
                          name="name"
                          value={values.name}
                          placeholder="Business Name"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={touched.name && errors.name ? "error" : null} />
                      </InputGroup>
                      {touched.name && errors.name ? (
                        <div className="error-message">{errors.name}</div>
                      ) : null}
                    </Form.Group>

                    <Form.Group controlId="formDescription">
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>
                            <FaPen />
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          name="description"
                          value={values.description}
                          placeholder="Description"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={touched.description && errors.description ? "error" : null} />
                      </InputGroup>
                      {touched.description && errors.description ? (
                        <div className="error-message">{errors.description}</div>
                      ) : null}
                    </Form.Group>

                    <Form.Group controlId="formPhone">
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>
                            <FaPhone />
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control type="text"
                          value={values.phone}
                          placeholder="Phone Number"
                          name="phone"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={touched.phone && errors.phone ? "error" : null} />
                      </InputGroup>
                      {touched.phone && errors.phone ? (
                        <div className="error-message">{errors.phone}</div>
                      ) : null}
                    </Form.Group>

                    <Form.Group controlId="autocomplete">
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>
                            <FaMap />
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="text"
                          placeholder="Address"
                          autoComplete="new-password"
                          onChange={event => setFieldValue("address", event.target.value)}
                          className={touched.address && errors.address ? "error" : null}
                        />
                      </InputGroup>
                      {touched.address && errors.address ? (
                        <div className="error-message">{errors.address}</div>
                      ) : null}
                    </Form.Group>

                    <Form.Group controlId="formCategory" className={touched.category && errors.category ? "error" : null}>
                      <Multiselect
                        options={this.state.category}
                        onSelect={async (selectedList, selectedItem) => this.onChange(selectedList, selectedItem, setFieldValue)}
                        onRemove={async (selectedList, removedItem) => this.onChange(selectedList, removedItem, setFieldValue)}
                        placeholder="Category"
                        closeIcon="cancel"
                        displayValue="name"
                        avoidHighlightFirstOption={true}
                        style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 50, maxWidth: 50}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                      />
                    </Form.Group>
                    {touched.category && errors.category ? (
                        <div className="error-message" style={{marginTop: -15}}>{errors.category}</div>
                      ) : null}

                    <h4>Store Hours</h4>

                    <Form.Group className="text-left" controlId="formHoursMonday">
                      <h5>Monday</h5>
                      <Form.Check
                        custom
                        className="form-custom"
                        type="checkbox"
                        id="monday-toggle"
                        label="Working Today?"
                        checked={this.state.weekIsWorking[0]}
                        onChange={() => this.handleDayStatusChange(0)}
                      />
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[0]} value={this.state.storeHours[0].open_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={0}>{convertMinsToHrsMins(0)}</option>
                            <option value={60}>{convertMinsToHrsMins(60)}</option>
                            <option value={120}>{convertMinsToHrsMins(120)}</option>
                            <option value={180}>{convertMinsToHrsMins(180)}</option>
                            <option value={240}>{convertMinsToHrsMins(240)}</option>
                            <option value={300}>{convertMinsToHrsMins(300)}</option>
                            <option value={360}>{convertMinsToHrsMins(360)}</option>
                            <option value={420}>{convertMinsToHrsMins(420)}</option>
                            <option value={480}>{convertMinsToHrsMins(480)}</option>
                            <option value={540}>{convertMinsToHrsMins(540)}</option>
                            <option value={600}>{convertMinsToHrsMins(600)}</option>
                            <option value={660}>{convertMinsToHrsMins(660)}</option>
                            <option value={720}>{convertMinsToHrsMins(720)}</option>
                            <option value={780}>{convertMinsToHrsMins(780)}</option>
                            <option value={840}>{convertMinsToHrsMins(840)}</option>
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[0]} value={this.state.storeHours[0].close_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={900}>{convertMinsToHrsMins(900)}</option>
                            <option value={960}>{convertMinsToHrsMins(960)}</option>
                            <option value={1020}>{convertMinsToHrsMins(1020)}</option>
                            <option value={1080}>{convertMinsToHrsMins(1080)}</option>
                            <option value={1140}>{convertMinsToHrsMins(1140)}</option>
                            <option value={1200}>{convertMinsToHrsMins(1200)}</option>
                            <option value={1260}>{convertMinsToHrsMins(1260)}</option>
                            <option value={1320}>{convertMinsToHrsMins(1320)}</option>
                            <option value={1380}>{convertMinsToHrsMins(1380)}</option>
                            <option value={1440}>{convertMinsToHrsMins(1440)}</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Form.Group className="text-left" controlId="formHoursTuesday">
                      <h5>Tuesday</h5>
                      <Form.Check
                        custom
                        className="form-custom"
                        type="checkbox"
                        id="tuesday-toggle"
                        label="Working Today?"
                        checked={this.state.weekIsWorking[1]}
                        onChange={() => this.handleDayStatusChange(1)}
                      />
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[1]} value={this.state.storeHours[1].open_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={0}>{convertMinsToHrsMins(0)}</option>
                            <option value={60}>{convertMinsToHrsMins(60)}</option>
                            <option value={120}>{convertMinsToHrsMins(120)}</option>
                            <option value={180}>{convertMinsToHrsMins(180)}</option>
                            <option value={240}>{convertMinsToHrsMins(240)}</option>
                            <option value={300}>{convertMinsToHrsMins(300)}</option>
                            <option value={360}>{convertMinsToHrsMins(360)}</option>
                            <option value={420}>{convertMinsToHrsMins(420)}</option>
                            <option value={480}>{convertMinsToHrsMins(480)}</option>
                            <option value={540}>{convertMinsToHrsMins(540)}</option>
                            <option value={600}>{convertMinsToHrsMins(600)}</option>
                            <option value={660}>{convertMinsToHrsMins(660)}</option>
                            <option value={720}>{convertMinsToHrsMins(720)}</option>
                            <option value={780}>{convertMinsToHrsMins(780)}</option>
                            <option value={840}>{convertMinsToHrsMins(840)}</option>
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[1]} value={this.state.storeHours[1].close_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={900}>{convertMinsToHrsMins(900)}</option>
                            <option value={960}>{convertMinsToHrsMins(960)}</option>
                            <option value={1020}>{convertMinsToHrsMins(1020)}</option>
                            <option value={1080}>{convertMinsToHrsMins(1080)}</option>
                            <option value={1140}>{convertMinsToHrsMins(1140)}</option>
                            <option value={1200}>{convertMinsToHrsMins(1200)}</option>
                            <option value={1260}>{convertMinsToHrsMins(1260)}</option>
                            <option value={1320}>{convertMinsToHrsMins(1320)}</option>
                            <option value={1380}>{convertMinsToHrsMins(1380)}</option>
                            <option value={1440}>{convertMinsToHrsMins(1440)}</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>


                    <Form.Group className="text-left" controlId="formHoursWednesday">
                      <h5>Wednesday</h5>
                      <Form.Check
                        custom
                        className="form-custom"
                        type="checkbox"
                        id="wednesday-toggle"
                        label="Working Today?"
                        checked={this.state.weekIsWorking[2]}
                        onChange={() => this.handleDayStatusChange(2)}
                      />
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[2]} value={this.state.storeHours[2].open_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={0}>{convertMinsToHrsMins(0)}</option>
                            <option value={60}>{convertMinsToHrsMins(60)}</option>
                            <option value={120}>{convertMinsToHrsMins(120)}</option>
                            <option value={180}>{convertMinsToHrsMins(180)}</option>
                            <option value={240}>{convertMinsToHrsMins(240)}</option>
                            <option value={300}>{convertMinsToHrsMins(300)}</option>
                            <option value={360}>{convertMinsToHrsMins(360)}</option>
                            <option value={420}>{convertMinsToHrsMins(420)}</option>
                            <option value={480}>{convertMinsToHrsMins(480)}</option>
                            <option value={540}>{convertMinsToHrsMins(540)}</option>
                            <option value={600}>{convertMinsToHrsMins(600)}</option>
                            <option value={660}>{convertMinsToHrsMins(660)}</option>
                            <option value={720}>{convertMinsToHrsMins(720)}</option>
                            <option value={780}>{convertMinsToHrsMins(780)}</option>
                            <option value={840}>{convertMinsToHrsMins(840)}</option>
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[2]} value={this.state.storeHours[2].close_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={900}>{convertMinsToHrsMins(900)}</option>
                            <option value={960}>{convertMinsToHrsMins(960)}</option>
                            <option value={1020}>{convertMinsToHrsMins(1020)}</option>
                            <option value={1080}>{convertMinsToHrsMins(1080)}</option>
                            <option value={1140}>{convertMinsToHrsMins(1140)}</option>
                            <option value={1200}>{convertMinsToHrsMins(1200)}</option>
                            <option value={1260}>{convertMinsToHrsMins(1260)}</option>
                            <option value={1320}>{convertMinsToHrsMins(1320)}</option>
                            <option value={1380}>{convertMinsToHrsMins(1380)}</option>
                            <option value={1440}>{convertMinsToHrsMins(1440)}</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Form.Group className="text-left" controlId="formHoursThursday">
                      <h5>Thursday</h5>
                      <Form.Check
                        custom
                        className="form-custom"
                        type="checkbox"
                        id="thursday-toggle"
                        label="Working Today?"
                        checked={this.state.weekIsWorking[3]}
                        onChange={() => this.handleDayStatusChange(3)}
                      />
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[3]} value={this.state.storeHours[3].open_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={0}>{convertMinsToHrsMins(0)}</option>
                            <option value={60}>{convertMinsToHrsMins(60)}</option>
                            <option value={120}>{convertMinsToHrsMins(120)}</option>
                            <option value={180}>{convertMinsToHrsMins(180)}</option>
                            <option value={240}>{convertMinsToHrsMins(240)}</option>
                            <option value={300}>{convertMinsToHrsMins(300)}</option>
                            <option value={360}>{convertMinsToHrsMins(360)}</option>
                            <option value={420}>{convertMinsToHrsMins(420)}</option>
                            <option value={480}>{convertMinsToHrsMins(480)}</option>
                            <option value={540}>{convertMinsToHrsMins(540)}</option>
                            <option value={600}>{convertMinsToHrsMins(600)}</option>
                            <option value={660}>{convertMinsToHrsMins(660)}</option>
                            <option value={720}>{convertMinsToHrsMins(720)}</option>
                            <option value={780}>{convertMinsToHrsMins(780)}</option>
                            <option value={840}>{convertMinsToHrsMins(840)}</option>
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[3]} value={this.state.storeHours[3].close_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={900}>{convertMinsToHrsMins(900)}</option>
                            <option value={960}>{convertMinsToHrsMins(960)}</option>
                            <option value={1020}>{convertMinsToHrsMins(1020)}</option>
                            <option value={1080}>{convertMinsToHrsMins(1080)}</option>
                            <option value={1140}>{convertMinsToHrsMins(1140)}</option>
                            <option value={1200}>{convertMinsToHrsMins(1200)}</option>
                            <option value={1260}>{convertMinsToHrsMins(1260)}</option>
                            <option value={1320}>{convertMinsToHrsMins(1320)}</option>
                            <option value={1380}>{convertMinsToHrsMins(1380)}</option>
                            <option value={1440}>{convertMinsToHrsMins(1440)}</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>


                    <Form.Group className="text-left" controlId="formHoursFriday">
                      <h5>Friday</h5>
                      <Form.Check
                        custom
                        className="form-custom"
                        type="checkbox"
                        id="friday-toggle"
                        label="Working Today?"
                        checked={this.state.weekIsWorking[4]}
                        onChange={() => this.handleDayStatusChange(4)}
                      />
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[4]} value={this.state.storeHours[4].open_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={0}>{convertMinsToHrsMins(0)}</option>
                            <option value={60}>{convertMinsToHrsMins(60)}</option>
                            <option value={120}>{convertMinsToHrsMins(120)}</option>
                            <option value={180}>{convertMinsToHrsMins(180)}</option>
                            <option value={240}>{convertMinsToHrsMins(240)}</option>
                            <option value={300}>{convertMinsToHrsMins(300)}</option>
                            <option value={360}>{convertMinsToHrsMins(360)}</option>
                            <option value={420}>{convertMinsToHrsMins(420)}</option>
                            <option value={480}>{convertMinsToHrsMins(480)}</option>
                            <option value={540}>{convertMinsToHrsMins(540)}</option>
                            <option value={600}>{convertMinsToHrsMins(600)}</option>
                            <option value={660}>{convertMinsToHrsMins(660)}</option>
                            <option value={720}>{convertMinsToHrsMins(720)}</option>
                            <option value={780}>{convertMinsToHrsMins(780)}</option>
                            <option value={840}>{convertMinsToHrsMins(840)}</option>
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[4]} value={this.state.storeHours[4].close_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={900}>{convertMinsToHrsMins(900)}</option>
                            <option value={960}>{convertMinsToHrsMins(960)}</option>
                            <option value={1020}>{convertMinsToHrsMins(1020)}</option>
                            <option value={1080}>{convertMinsToHrsMins(1080)}</option>
                            <option value={1140}>{convertMinsToHrsMins(1140)}</option>
                            <option value={1200}>{convertMinsToHrsMins(1200)}</option>
                            <option value={1260}>{convertMinsToHrsMins(1260)}</option>
                            <option value={1320}>{convertMinsToHrsMins(1320)}</option>
                            <option value={1380}>{convertMinsToHrsMins(1380)}</option>
                            <option value={1440}>{convertMinsToHrsMins(1440)}</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Form.Group className="text-left" controlId="formHoursSaturday">
                      <h5>Saturday</h5>
                      <Form.Check
                        custom
                        className="form-custom"
                        type="checkbox"
                        id="saturday-toggle"
                        label="Working Today?"
                        checked={this.state.weekIsWorking[5]}
                        onChange={() => this.handleDayStatusChange(5)}
                      />
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[5]} value={this.state.storeHours[5].open_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={0}>{convertMinsToHrsMins(0)}</option>
                            <option value={60}>{convertMinsToHrsMins(60)}</option>
                            <option value={120}>{convertMinsToHrsMins(120)}</option>
                            <option value={180}>{convertMinsToHrsMins(180)}</option>
                            <option value={240}>{convertMinsToHrsMins(240)}</option>
                            <option value={300}>{convertMinsToHrsMins(300)}</option>
                            <option value={360}>{convertMinsToHrsMins(360)}</option>
                            <option value={420}>{convertMinsToHrsMins(420)}</option>
                            <option value={480}>{convertMinsToHrsMins(480)}</option>
                            <option value={540}>{convertMinsToHrsMins(540)}</option>
                            <option value={600}>{convertMinsToHrsMins(600)}</option>
                            <option value={660}>{convertMinsToHrsMins(660)}</option>
                            <option value={720}>{convertMinsToHrsMins(720)}</option>
                            <option value={780}>{convertMinsToHrsMins(780)}</option>
                            <option value={840}>{convertMinsToHrsMins(840)}</option>
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[5]} value={this.state.storeHours[5].close_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={900}>{convertMinsToHrsMins(900)}</option>
                            <option value={960}>{convertMinsToHrsMins(960)}</option>
                            <option value={1020}>{convertMinsToHrsMins(1020)}</option>
                            <option value={1080}>{convertMinsToHrsMins(1080)}</option>
                            <option value={1140}>{convertMinsToHrsMins(1140)}</option>
                            <option value={1200}>{convertMinsToHrsMins(1200)}</option>
                            <option value={1260}>{convertMinsToHrsMins(1260)}</option>
                            <option value={1320}>{convertMinsToHrsMins(1320)}</option>
                            <option value={1380}>{convertMinsToHrsMins(1380)}</option>
                            <option value={1440}>{convertMinsToHrsMins(1440)}</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>


                    <Form.Group className="text-left" controlId="formHoursSunday">
                      <h5>Sunday</h5>
                      <Form.Check
                        custom
                        className="form-custom"
                        type="checkbox"
                        id="sunday-toggle"
                        label="Working Today?"
                        checked={this.state.weekIsWorking[6]}
                        onChange={() => this.handleDayStatusChange(6)}
                      />
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[6]} value={this.state.storeHours[6].open_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={0}>{convertMinsToHrsMins(0)}</option>
                            <option value={60}>{convertMinsToHrsMins(60)}</option>
                            <option value={120}>{convertMinsToHrsMins(120)}</option>
                            <option value={180}>{convertMinsToHrsMins(180)}</option>
                            <option value={240}>{convertMinsToHrsMins(240)}</option>
                            <option value={300}>{convertMinsToHrsMins(300)}</option>
                            <option value={360}>{convertMinsToHrsMins(360)}</option>
                            <option value={420}>{convertMinsToHrsMins(420)}</option>
                            <option value={480}>{convertMinsToHrsMins(480)}</option>
                            <option value={540}>{convertMinsToHrsMins(540)}</option>
                            <option value={600}>{convertMinsToHrsMins(600)}</option>
                            <option value={660}>{convertMinsToHrsMins(660)}</option>
                            <option value={720}>{convertMinsToHrsMins(720)}</option>
                            <option value={780}>{convertMinsToHrsMins(780)}</option>
                            <option value={840}>{convertMinsToHrsMins(840)}</option>
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[6]} value={this.state.storeHours[6].close_time} onChange={this.handleSelectChange.bind(this)}>
                            <option value={900}>{convertMinsToHrsMins(900)}</option>
                            <option value={960}>{convertMinsToHrsMins(960)}</option>
                            <option value={1020}>{convertMinsToHrsMins(1020)}</option>
                            <option value={1080}>{convertMinsToHrsMins(1080)}</option>
                            <option value={1140}>{convertMinsToHrsMins(1140)}</option>
                            <option value={1200}>{convertMinsToHrsMins(1200)}</option>
                            <option value={1260}>{convertMinsToHrsMins(1260)}</option>
                            <option value={1320}>{convertMinsToHrsMins(1320)}</option>
                            <option value={1380}>{convertMinsToHrsMins(1380)}</option>
                            <option value={1440}>{convertMinsToHrsMins(1440)}</option>
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Form.Group controlId="formPictureCount">
                      <input
                        onChange={event => this.fileChangedHandler(event, setFieldValue)}
                        type="file"
                        multiple
                        className={touched.pictureCount && errors.pictureCount ? "error" : null}
                      />
                      {touched.pictureCount && errors.pictureCount ? (
                        <div className="error-message">{errors.pictures}</div>
                      ) : null}
                    </Form.Group>
                    {touched.pictureCount && errors.pictureCount ? (
                      <div className="error-message">{errors.pictureCount}</div>
                    ): null}

                    <Button disabled={isSubmitting || (Object.keys(errors).length === 0 && errors.constructor === Object && (Object.keys(touched).length === 0 && touched.constructor === Object)) || !(Object.keys(errors).length === 0 && errors.constructor === Object)} style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={handleSubmit}>Submit</Button>
                  </Form>
                )}
            </Formik>
          </Col>
        </Row>
      </Container>
    );
  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  updateRole: (role) => updateRole(role),
  addStore: (store, values) => addStore(store, values),
  updateCurrentStore: (store) => updateCurrentStore(store)
}, dispatch)

const mapStateToProps = state => ({
  store: state.storeReducer.store,
})

export default connect(mapStateToProps, mapDispatchToProps)(StoreSignupForm);

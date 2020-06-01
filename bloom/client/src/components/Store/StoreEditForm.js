import React from 'react';
import '../../App.css';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaShoppingCart, FaPen, FaPhone, FaMap } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { getPictures, deleteHandler, uploadHandler } from '../s3'
import { Multiselect } from 'multiselect-react-dropdown';
import { withRouter } from "react-router-dom";
import { convertMinsToHrsMins } from '../helperFunctions'
import { css } from '@emotion/core'
import { Image } from 'react-bootstrap';
import GridLoader from 'react-spinners/GridLoader'
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const helper = require('../Search/helper.js');

class StoreEditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      store: {
        name: "",
        description: "",
        phone: "",
        id: "",
        address: "",
        category: []
      },
      address: "",
      storeHours: [{ open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 },
      { open_time: 540, close_time: 1020 }],
      originalStoreHours: [{ open_time: 540, close_time: 1020 },
        { open_time: 540, close_time: 1020 },
        { open_time: 540, close_time: 1020 },
        { open_time: 540, close_time: 1020 },
        { open_time: 540, close_time: 1020 },
        { open_time: 540, close_time: 1020 },
        { open_time: 540, close_time: 1020 }],
      newHours: [],
      weekIsWorking: [true, true, true, true, true, true, true],
      // selectedOption: [],
      loading: true,
      pictures: [],
      selectedFiles: [],
      keys: [],
      category: helper.getCategories(),
      categoryError: false,
      selected: [],
      isLoading: true
    };

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
        .required("Description is required"), // will make it required soon
      phone: Yup.string()
        .matches(this.phoneRegExp, "Phone number is not valid")
        .required("Phone number is required"),
      address: Yup.string()
        .required("Address is required"),
      category: Yup.array()
        .required("Category is required"),
      pictureCount: Yup.number()
        .required("Pictures are required")
        .min(1, "Must have at least one picture")
    });

    this.autocomplete = null
    this.handlePlaceSelect = this.handlePlaceSelect.bind(this);
    this.triggerStoreDisplay = this.triggerStoreDisplay.bind(this);
    this.onChange = this.onChange.bind(this);
    this.triggerStoreDisplayNoResp = this.triggerStoreDisplayNoResp.bind(this);
    this.autocompleteChange = this.autocompleteChange.bind(this)
  }

  onChange(selectedList, item, setFieldValue) {
    setFieldValue("category", selectedList)
  }

  autocompleteChange(event, setFieldValue){
    setFieldValue("address", event.target.value)
    this.setState({
      address: event.target.value
    })
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
  triggerStoreDisplay(returnedStore) {
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id,
      state: {
        store: returnedStore
      }
    })
  }

  triggerStoreDisplayNoResp() {
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id
    })
  }

  handleDayStatusChange = (day) => {
    var updateWeekIsWorking = [
      ...this.state.weekIsWorking.slice(0, day),
      !this.state.weekIsWorking[day],
      ...this.state.weekIsWorking.slice(day + 1)
    ]

    let oldStoreHours = this.state.storeHours
    if(this.state.storeHours[day].open_time == null){
      oldStoreHours[day].open_time = 540
      oldStoreHours[day].close_time = 1020
    }

    this.setState({
      weekIsWorking: updateWeekIsWorking,
      storeHours: oldStoreHours
    })
  };

  handleSelectChange = (event) => {
    var days = ['formHoursMonday', 'formHoursTuesday', 'formHoursWednesday', 'formHoursThursday', 'formHoursFriday', 'formHoursSaturday', 'formHoursSunday']
    var day = days.indexOf(event.target.id)
    var updateNewHours = this.state.newHours
    var old_open_time = 0
    var old_close_time = 0
    var newStoreHours = []
    if(this.state.newHours[day]) {
      old_open_time = this.state.newHours[day].open_time
      old_close_time = this.state.newHours[day].close_time
    } else {
      old_open_time = this.state.storeHours[day].open_time
      old_close_time = this.state.storeHours[day].close_time
    }
    if(parseInt(event.target.querySelector('option').value) <= 840) {
      if(this.state.storeHours[day].close_time == null){
        old_close_time = 1020
      }
      updateNewHours[day] = {open_time: parseInt(event.target.value), close_time: old_close_time}
      newStoreHours = [
        ...this.state.storeHours.slice(0, day),
        {open_time: parseInt(event.target.value), close_time: old_close_time},
        ...this.state.storeHours.slice(day + 1)
      ]
    } else {
      if(this.state.storeHours[day].open_time == null){
        old_open_time = 540
      }
      updateNewHours[day] = {open_time: old_open_time, close_time: parseInt(event.target.value)}
      newStoreHours = [
        ...this.state.storeHours.slice(0, day),
        {open_time: old_open_time, close_time: parseInt(event.target.value)},
        ...this.state.storeHours.slice(day + 1)
      ]
    }

    this.setState({
      newHours: updateNewHours,
      storeHours: newStoreHours
    })
  };

  deleteFileChangeHandler = async (event, setFieldValue) => {
    if(event.target.checked){
      var joined = this.state.keys.concat(event.target.id);
      setFieldValue("pictureCount", this.state.pictures.length - (this.state.keys.length + 1) + this.state.selectedFiles.length)
      this.setState({
        keys: joined
      })
    }
    else{
      setFieldValue("pictureCount", this.state.pictures.length - (this.state.keys.length - 1) + this.state.selectedFiles.length)
      this.setState({keys: this.state.keys.filter(item => item !== event.target.id)});
    }
  }

  fileChangedHandler = async (event, setFieldValue) => {
    setFieldValue("pictureCount", this.state.pictures.length - this.state.keys.length + event.target.files.length)
    this.setState({ selectedFiles: event.target.files })
  }

  async componentDidMount() {
    let picturesFetched = []
    try {
      picturesFetched = await getPictures('stores/' + this.props.match.params.store_id + '/images/')
    } catch (e) {
      console.log("Error! Could not get pictures from s3", e)
    }

    // if we were given the existing data from calling component use that, else fetch
    // check if categories are empty, if they are then cache/store needs to be updated.
    if (this.props.location.state && this.props.location.state.store) {
      let convertedCategory = this.props.location.state.store.category.map((str, indx) => ({ id: indx, name: helper.longerVersion(str)}));

      await fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + '/storeHours', {
        method: "GET",
        headers: {
            'Content-type': 'application/json'
        },
        credentials: 'include'
      })
      .then(function(response){
        if(response.status!==200){
          // throw an error alert
          store.dispatch(addAlert(response))
        }
        else{
          return response.json();
        }
      })
      .then(data => {
        let oldWeekIsWorking = this.state.weekIsWorking
        for(let i = 0; i < data.length; i++){
          if(data[i].open_time == null){
            oldWeekIsWorking[i] = false
          }
        }

        let dataCopy = JSON.parse(JSON.stringify(data))

        this.setState({
          store: this.props.location.state.store,
          selected: convertedCategory,
          address: this.props.location.state.store.address,
          weekIsWorking: oldWeekIsWorking,
          storeHours: data,
          originalStoreHours: dataCopy,
          isLoading: false,
          pictures: picturesFetched
        })
      });
    }
    else {
      await Promise.all([
        fetch(fetchDomain + '/stores/' + this.props.match.params.store_id, {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      }).then(value => value.json()),
      fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + '/storeHours', {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      }).then(value => value.json())
      ]).then(allResponses => {
        const response1 = allResponses[0]
        const response2 = allResponses[1]

        let convertedCategory = response1.category.map((str, indx) => ({ id: indx, name: helper.longerVersion(str)}) );

        let oldWeekIsWorking = this.state.weekIsWorking
        for(let i = 0; i < response2.length; i++){
          if(response2[i].open_time == null){
            oldWeekIsWorking[i] = false
          }
        }

        let dataCopy = JSON.parse(JSON.stringify(response2))

        this.setState({
          store: response1,
          selected: convertedCategory,
          address: response1.address,
          storeHours: response2,
          originalStoreHours: dataCopy,
          weekIsWorking: oldWeekIsWorking,
          isLoading: false,
          pictures: picturesFetched
        })
      })
    }

    const google = window.google;
    this.autocomplete = new google.maps.places.Autocomplete(document.getElementById('autocomplete'), { })

    this.autocomplete.addListener("place_changed", this.handlePlaceSelect)
  }

  render() {
    if(this.state.isLoading){
      return <Row className="vertical-center">
               <Col>
                <GridLoader
                  css={override}
                  size={20}
                  color={"#8CAFCB"}
                  loading={this.state.isLoading}
                />
              </Col>
            </Row>
    }
    else{
      return (
        <Row className="justify-content-center mx-1" id="test">
        <Col xs={12} lg={5} className="my-5">
          <Formik
            initialValues={{
              name: this.state.store.name,
              description: this.state.store.description,
              phone: this.state.store.phone,
              address: this.state.store.address,
              category: this.state.selected,
              services: null,
              owners: null,
              pictures: [],
              pictureCount: this.state.pictures.length - this.state.keys.length + this.state.selectedFiles.length,
              storeHours: this.state.storeHours
            }}
            validationSchema={this.yupValidationSchema}
            onSubmit={async (values, actions) => {
              let shorterVersion = helper.shorterVersion

              values.category = values.category.map(function (val) {
                return shorterVersion(val.name)
              })

              let store_id = this.props.match.params.store_id
              let triggerStoreDisplay = this.triggerStoreDisplay
              let triggerStoreDisplayNoResp = this.triggerStoreDisplayNoResp

              values.services = this.state.store.services
              values.owners = this.state.store.owners
              values.id = store_id
              values.storeHours = values.storeHours.map((day, index) => {
                if(this.state.weekIsWorking[index] && (this.state.originalStoreHours[index].open_time !== day.open_time || this.state.originalStoreHours[index].close_time !== day.close_time)){
                  return day
                }
                else if(this.state.weekIsWorking[index] && (this.state.originalStoreHours[index].open_time === day.open_time && this.state.originalStoreHours[index].close_time === day.close_time)){
                  return {}
                }else if(this.state.weekIsWorking[index] === false && this.state.originalStoreHours[index].open_time === null){
                  return {}
                }
                else{
                  return {open_time: null, close_time: null}
                }
              })

              values.address = this.state.address

              // remove files from s3
              if(this.state.keys.length > 0){
                try {
                  await deleteHandler(this.state.keys)
                } catch (e) {
                  console.log("Error! Could not delete images from s3", e)
                }
              }

              // upload new images to s3 from client to avoid burdening back end
              if(this.state.selectedFiles.length > 0){
                let prefix = 'stores/' + this.props.match.params.store_id + '/images/'
                try {
                  await uploadHandler(prefix, this.state.selectedFiles)
                } catch (e) {
                  console.log("Error! Could not upload images to s3", e)
                }
              }

              fetch(fetchDomain + '/stores/edit/' + store_id , {
                method: "POST",
                headers: {
                  'Content-type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(values)
              })
              .then(function(response){
                if(response.status!==200){
                  store.dispatch(addAlert(response))
                  actions.setSubmitting(false);
                }
                else {
                  // redirect to home page signed in
                  return response.json()
                }
              })
              .then(data => {
                if(data){
                  triggerStoreDisplay(data)
                }
                else{
                  console.log("should not be here, but going to redirect until this is fixed")
                  triggerStoreDisplayNoResp()
                  actions.setSubmitting(false);
                }
              });
            }}
          >
            {({ values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              setFieldValue,
              isSubmitting }) => (
                <Form className="formBody rounded p-4">
                  <h3>Store Edit</h3>

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
                          onChange={event => this.autocompleteChange(event, setFieldValue) }
                          className={touched.address && errors.address ? "error" : null}
                          value={this.state.address}
                        />
                      </InputGroup>
                      {touched.address && errors.address ? (
                        <div className="error-message">{errors.address}</div>
                      ) : null}
                    </Form.Group>

                  <Form.Group controlId="formCategory" className={touched.category && errors.category ? "error" : null}>
                    <Multiselect
                      selectedValues={this.state.selected}
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[0]} value={this.state.storeHours[0].open_time === null ? 540 : this.state.storeHours[0].open_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[0]} value={this.state.storeHours[0].close_time === null ? 1020 : this.state.storeHours[0].close_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[1]} value={this.state.storeHours[1].open_time === null ? 540 : this.state.storeHours[1].open_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[1]} value={this.state.storeHours[1].close_time === null ? 1020 : this.state.storeHours[1].close_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[2]} value={this.state.storeHours[2].open_time === null ? 540 : this.state.storeHours[2].open_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[2]} value={this.state.storeHours[2].close_time === null ? 1020 : this.state.storeHours[2].close_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[3]} value={this.state.storeHours[3].open_time === null ? 540 : this.state.storeHours[3].open_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[3]} value={this.state.storeHours[3].close_time === null ? 1020 : this.state.storeHours[3].close_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[4]} value={this.state.storeHours[4].open_time === null ? 540 : this.state.storeHours[4].open_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[4]} value={this.state.storeHours[4].close_time === null ? 1020 : this.state.storeHours[4].close_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[5]} value={this.state.storeHours[5].open_time === null ? 540 : this.state.storeHours[5].open_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[5]} value={this.state.storeHours[5].close_time === null ? 1020 : this.state.storeHours[5].close_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[6]} value={this.state.storeHours[6].open_time === null ? 540 : this.state.storeHours[6].open_time} onChange={this.handleSelectChange.bind(this)}>
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
                        <Form.Control as="select" disabled={!this.state.weekIsWorking[6]} value={this.state.storeHours[6].close_time === null ? 1020 : this.state.storeHours[6].close_time} onChange={this.handleSelectChange.bind(this)}>
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

                  <Form.Group controlId="pictures">
                    <Form.Label><h5>Delete Images</h5></Form.Label>
                    {this.state.pictures.map((picture, index) => (
                      <div key={"pic-" + index}>
                        <Image fluid style={{height: "400px", width: "400px"}} thumbnail src={picture.url} alt={"Slide " + index} />
                        <Form.Check
                          // style={{marginLeft: 30}}
                          custom
                          className="form-custom"
                          id={picture.key}
                          label={picture.key.split('/').slice(-1)[0]}
                          onChange={event => this.deleteFileChangeHandler(event, setFieldValue)}
                        />
                      </div>
                    ))}
                  </Form.Group>

                  <Form.Group controlId="pictureCount">
                    <Form.Label><h5>Add Images</h5></Form.Label>
                    <br/>
                    <input
                      onChange={event => this.fileChangedHandler(event, setFieldValue)}
                      type="file"
                      multiple
                      className={touched.pictures && errors.pictures ? "error" : null}
                    />
                    {touched.pictureCount && errors.pictureCount ? (
                      <div className="error-message">{errors.pictureCount}</div>
                    ): null}
                  </Form.Group>
                  
                  <Button disabled={isSubmitting || !(Object.keys(errors).length === 0 && errors.constructor === Object)} style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={handleSubmit}>Submit</Button>
                </Form>
              )}
          </Formik>
        </Col>
      </Row>
      );
    }
  }
}
export default withRouter(StoreEditForm);

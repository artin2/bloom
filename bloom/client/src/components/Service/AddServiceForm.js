import React from 'react';
import '../../App.css';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaDollarSign, FaHandshake, FaHourglassHalf, FaPen } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Multiselect } from 'multiselect-react-dropdown';
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { uploadHandler } from '../s3';
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getWorkers } from '../Worker/WorkerHelper.js'
import { addService, getCategories } from './ServiceHelper.js'
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const helper = require('../Search/helper.js');

class AddServiceForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      category: [],
      categoryError: false,
      selected: [],
      workerError: false,
      name: '', // assuming this is a unique value for file upload
      cost: '',
      duration: '',
      description: '',
      workers: [],
      store_id: '',
      workerOptions: [],
      selectedOption: null,
      selectedFiles: [],
      isLoading: this.props.loading
    };

    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      name: Yup.string()
      .min(2, "Name must have at least 2 characters")
      .max(100, "Name can't be longer than 100 characters")
      .required("Name is required"),
      description: Yup.string()
      .min(20, "Description must have at least 20 characters")
      .required("Description is required"),
      cost: Yup.number()
      .positive("Cost must be positive")
      .required("Cost is required"),
      duration: Yup.number()
      .positive("Duration must be positive")
      .required("Duration is required"),
      workers: Yup.array()
      .required("Worker(s) is required"),
      category: Yup.array()
      .required("Category is required"),
      pictureCount: Yup.number()
      .required("Pictures are required")
      .min(1, "Must have at least one picture")
    });

    this.triggerServiceDisplay = this.triggerServiceDisplay.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  async componentDidMount() {

    if(!this.props.workers) {
      this.props.getWorkers(this.props.match.params.store_id)
    }
    else {
      let convertedWorkers = this.props.workers.map((worker) => ({ value: worker.id, label: worker.first_name + " " + worker.last_name }));
      this.setState({
        workerOptions: convertedWorkers
      })
    }

    if(!this.props.categories) {
      this.props.getCategories(this.props.match.params.store_id)
    }
    else {
      let convertedCategory = this.props.categories.map((category, indx) => ({ value: indx, label: helper.longerVersion(category)}));
         this.setState({
           category: convertedCategory,
         })
    }

  }

  // redirect to the worker display page
  async componentDidUpdate(prevProps, prevState)  {

    if (prevProps.service !== this.props.service) {

      if(this.state.selectedFiles.length > 0){
        let prefix = 'stores/' + this.props.service.store_id + '/services/' + this.props.service.id + '/'
        await uploadHandler(prefix, this.state.selectedFiles)
      }
        this.triggerServiceDisplay(this.props.service)
    }
    if (prevProps.workers !== this.props.workers) {
      let convertedWorkers = this.props.workers.map((worker) => ({ value: worker.id, label: worker.first_name + " " + worker.last_name }));
      this.setState({
        workerOptions: convertedWorkers
      })
    }
    if (prevProps.categories !== this.props.categories) {
      let convertedCategory = this.props.categories.map((category, indx) => ({ value: indx, label: helper.longerVersion(category)}));
      this.setState({
        category: convertedCategory,
        // isLoading: false
      })
    }

  }

  // redirect to the worker display page and pass the new worker data
  triggerServiceDisplay(service) {
    this.props.history.push({
      pathname: '/stores/' + service.store_id + '/services/' + service.id,
      state: {
        service: service
      }
    })
  }


  fileChangedHandler = (event, setFieldValue) => {
    setFieldValue('pictureCount', event.target.files.length)
    this.setState({ selectedFiles: event.target.files })
  }

  onChange(selectedList, item, setFieldValue, value) {
    setFieldValue(value, selectedList)
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
        <Container fluid>
          <Row className="justify-content-center my-5">
            <Col xs={12} lg={5}>
              <Formik
                initialValues={{
                  name: '',
                  cost: '',
                  duration: '',
                  description: '',
                  pictures: [],
                  workers: [],
                  category: [],
                  store_id: this.props.match.params.store_id,
                  pictureCount: this.state.selectedFiles.length
                }}
                validationSchema={this.yupValidationSchema}
                onSubmit={async (values, actions) => {
                  let store_id = this.props.match.params.store_id
                  // let selectedFiles = this.state.selectedFiles
                  // let triggerServiceDisplay = this.triggerServiceDisplay
                  let shorterVersion = helper.shorterVersion;

                  values.category = values.category.map(function (val) {
                    return shorterVersion(val.label)
                  })[0]

                  values.workers = values.workers.map(function(val){
                    return val.value;
                  })

                  this.props.addService(store_id, values)
                  actions.setSubmitting(false)
                }}
              >
              {( {values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue,
                  isSubmitting}) => (
                <Form className="formBody rounded p-2 py-4 p-lg-5">
                  <h3>Add Service</h3>

                  <Form.Group controlId="formService">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaHandshake/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control type="text"
                        value={values.name}
                        placeholder="Name of Service"
                        name="name"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.name && errors.name ? "error" : null}/>
                    </InputGroup>
                    {touched.name && errors.name ? (
                      <div className="error-message">{errors.name}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formCost">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaDollarSign/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control type="number"
                      value={values.cost}
                      placeholder="Cost"
                      name="cost"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={touched.cost && errors.cost ? "error" : null}/>
                    </InputGroup>
                    {touched.cost && errors.cost ? (
                      <div className="error-message">{errors.cost}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formDuration">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                              <FaHourglassHalf/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        type="number"
                        value={values.duration}
                        placeholder="Duration (in min)"
                        name="duration"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.duration && errors.duration ? "error" : null}/>
                    </InputGroup>
                    {touched.duration && errors.duration ? (
                      <div className="error-message">{errors.duration}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formDescription">
                    <InputGroup>
                      <InputGroup.Prepend>
                          <InputGroup.Text>
                            <FaPen/>
                          </InputGroup.Text>
                      </InputGroup.Prepend>
                      <Form.Control
                        type="textarea"
                        rows={3}
                        value={values.description}
                        placeholder="Description"
                        name="description"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={touched.description && errors.description ? "error" : null}/>
                    </InputGroup>
                    {touched.description && errors.description ? (
                      <div className="error-message">{errors.description}</div>
                    ): null}
                  </Form.Group>

                  <Form.Group controlId="formWorkers" className={touched.workers && errors.workers ? "error" : null}>
                    <Multiselect
                      options={this.state.workerOptions}
                      onSelect={(selectedList, selectedItem) => this.onChange(selectedList, selectedItem, setFieldValue, "workers")}
                      onRemove={(selectedList, removedItem) => this.onChange(selectedList, removedItem, setFieldValue, "workers")}
                      placeholder="Assigned Worker"
                      closeIcon="cancel"
                      displayValue="label"
                      avoidHighlightFirstOption={true}
                      style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 50, maxWidth: 50}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                    />
                  </Form.Group>
                  {touched.workers && errors.workers ? (
                      <div className="error-message" style={{marginTop: -15}}>{errors.workers}</div>
                    ) : null}

                  <Form.Group controlId="formCategory" className={touched.category && errors.category ? "error" : null}>
                    <Multiselect
                      options={this.state.category}
                      onSelect={(selectedList, selectedItem) => this.onChange(selectedList, selectedItem, setFieldValue, "category")}
                      onRemove={(selectedList, removedItem) => this.onChange(selectedList, removedItem, setFieldValue, "category")}
                      singleSelect={true}
                      placeholder="Category"
                      closeIcon="cancel"
                      displayValue="label"
                      avoidHighlightFirstOption={true}
                      style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 50, maxWidth: 50}, chips: { background: "#587096", height: 35, color: 'white'}, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                    />
                  </Form.Group>
                  {touched.category && errors.category ? (
                      <div className="error-message" style={{marginTop: -15}}>{errors.category}</div>
                    ) : null}

                  <Form.Group controlId="formPictureCount">
                    <input
                      onChange={event => this.fileChangedHandler(event, setFieldValue)}
                      type="file"
                      multiple
                      className={touched.pictureCount && errors.pictureCount ? "error" : null}
                    />
                    {touched.pictureCount && errors.pictureCount ? (
                      <div className="error-message">{errors.pictureCount}</div>
                    ): null}
                  </Form.Group>

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
}

const mapDispatchToProps = dispatch => bindActionCreators({
  getWorkers: (store_id) => getWorkers(store_id),
  addService: (store_id, values) => addService(store_id, values),
  getCategories: (store_id) => getCategories(store_id)
}, dispatch)

const mapStateToProps = state => ({
  service: state.serviceReducer.service,
  workers: state.workerReducer.workers,
  loading: state.serviceReducer.isFetching,
  categories: state.serviceReducer.categories
})


export default connect(mapStateToProps, mapDispatchToProps)(AddServiceForm);

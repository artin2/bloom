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
import { getPictures, deleteHandler, uploadHandler } from '../s3'
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getWorkers } from '../Worker/WorkerHelper.js'
import { editService, getCategories, getService } from './ServiceHelper.js'
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const helper = require('../Search/helper.js');

class ServiceEditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

      category: [],
      categoryError: false,
      selected: [],
      workers: [],
      workerError: false,
      service: this.props.service,
      workerOptions: [],
      preselectedWorkers: [],
      preselectedCategories: [],
      pictures: [],
      keys: [],
      selectedFiles: [],
      isLoading: true
    };

    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      name: Yup.string()
      .min(2, "Name must have at least 2 characters")
      .max(100, "Name can't be longer than 100 characters")
      .required("Name is required"),
      description: Yup.string()
      .min(20, "Description must have at least 20 characters")
      .required("Description is required"), // will make it required soon,
      cost: Yup.number()
      .positive("Cost must be positive")
      .required("Cost is required"),
      duration: Yup.number()
      .positive("Duration must be positive")
      .required("Duration is required"),
      workers: Yup.array()
      .required("Worker is required"),
      category: Yup.array()
      .required("Category is required"),
      // pictureCount: Yup.number()
      // .required("Pictures are required")
      // .min(1, "Must have at least one picture")
    });

    this.triggerServiceDisplay = this.triggerServiceDisplay.bind(this);
    this.onChange = this.onChange.bind(this);

  }

  // redirect to the service display page and pass the new store data
  triggerServiceDisplay(returnedService) {
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id + '/services/' + this.props.match.params.service_id,
      state: {
        service: returnedService
      }
    })
  }

  deleteFileChangeHandler = async (event) => {
    if(event.target.checked){
      var joined = this.state.keys.concat(event.target.id);
      this.setState({
        keys: joined
      })
    }
    else{
      this.setState({keys: this.state.keys.filter(item => item !== event.target.id)});
    }
  }

  fileChangedHandler = async (event) => {
    this.setState({ selectedFiles: event.target.files })
  }

  async fetchPictures() {

    let picturesFetched = []
    try {
      picturesFetched = await getPictures('stores/' + this.props.match.params.store_id + '/services/' + this.props.match.params.service_id + '/')
    } catch (e) {
      console.log("Error getting pictures from s3!", e)
    }

    this.setState({
      // service: this.props.location.state.service,
      pictures: picturesFetched,
    })

  }

  componentDidMount() {

    if(!this.props.service){
      this.props.getService(this.props.match.params.store_id, this.props.match.params.service_id)
    }
    else {
      this.fetchPictures()
    }

    if(!this.props.workers) {
      this.props.getWorkers(this.props.match.params.store_id)
    }
    else {
      this.convertWorkers(this.props.workers)
    }

    if(!this.props.categories) {
      this.props.getCategories(this.props.match.params.store_id)
    }
    else {
      this.convertCategory(this.props.categories)
    }

    this.setState({
      isLoading: false
    })

  }

  componentDidUpdate(prevProps, prevState)  {

    if (prevProps.service !== this.props.service) {
          this.fetchPictures()
    }

    if (prevProps.categories !== this.props.categories) {
      this.convertCategory(this.props.categories)
    }

    if (prevProps.workers !== this.props.workers) {
      this.convertWorkers(this.props.workers)
    }

    if (prevProps.services !== this.props.services) {

      this.triggerServiceDisplay(this.props.service)

    }

  }

  convertCategory(categories) {

    let convertedCategory = []
    let preselectedCategories = []

    categories.map((category, indx) => {
      convertedCategory.push({ value: indx, label: helper.longerVersion(category)})
      if(this.state.service.category === category) {
        preselectedCategories.push({ value: indx, label: helper.longerVersion(category)})
      }
      return category
    });

    this.setState({
      category: convertedCategory,
      selected: preselectedCategories
    })
  }

  convertWorkers(workers) {

      let convertedWorkers = []
      let preselectedWorkers = []
      let originalWorkers = []
      workers.map((worker) => {
        convertedWorkers.push({ value: worker.id, label: worker.first_name + " " + worker.last_name})
        if(this.state.service.workers.includes(worker.id)) {
          preselectedWorkers.push({value: worker.id, label: worker.first_name + " " + worker.last_name})
          originalWorkers.push(worker.id)
        }
        return worker
      });

      this.setState({
        workerOptions: convertedWorkers,
        workers: preselectedWorkers,
        originalWorkers: originalWorkers
      })

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
                  color={"#2196f3"}
                  loading={this.state.isLoading}
                />
              </Col>
            </Row>
    }
    else{
      return (
        <Container fluid>
          <Row className="justify-content-center my-5">
            <Col xs={8} sm={7} md={6} lg={5}>
            <Formik
                initialValues={{
                  name: this.state.service.name,
                  cost: this.state.service.cost,
                  duration: this.state.service.duration,
                  description: this.state.service.description,
                  pictures: [],
                  pictureCount: this.state.pictures.length - this.state.keys.length + this.state.selectedFiles.length,
                  workers: this.state.service.workers,
                  category: this.state.category,
                  store_id: this.props.match.params.store_id
                }}
                validationSchema={this.yupValidationSchema}
                onSubmit={async (values) => {
                  let store_id = this.props.match.params.store_id
                  let service_id = this.props.match.params.service_id

                  let shorterVersion = helper.shorterVersion;

                  values.category = values.category.map(function (val) {
                    return shorterVersion(val.label)
                  })[0]

                  values.workers = values.workers.map(function(val){
                    return val.value;
                  })

                  var allWorkers = this.state.originalWorkers.concat(values.workers)
                  var allWorkersUnique = allWorkers.filter((worker, pos) => allWorkers.indexOf(worker) === pos)
                  values.allWorkers = allWorkersUnique

                  if(values.category.length === 0 || values.workers.length === 0) {
                    return;
                  }

                  // remove files from s3
                  if(this.state.keys.length > 0){
                    await deleteHandler(this.state.keys)
                  }

                  // upload new images to s3 from client to avoid burdening back end
                  if(this.state.selectedFiles.length > 0){
                    let prefix = 'stores/' + this.props.match.params.store_id + '/services/' + this.props.match.params.service_id + '/'
                    await uploadHandler(prefix, this.state.selectedFiles)
                  }

                  await this.props.editService(store_id, service_id, values)

                }}
              >
              {( {values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue}) => (
                <Form className="formBody rounded p-5">
                  <h3>Edit Service</h3>

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
                      selectedValues={this.state.workers}
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
                      selectedValues={this.state.selected}
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

                  <Form.Group controlId="pictureCount">
                    <Form.Label>Delete Images</Form.Label>
                    {this.state.pictures.map((picture, index) => (
                      <div key={"pic-" + index}>
                        <img className="img-fluid" src={picture.url} alt={"Slide " + index} />
                        <Form.Check
                          // style={{marginLeft: 30}}
                          id={picture.key}
                          label={picture.key.split('/').slice(-1)[0]}
                          onChange={event => this.deleteFileChangeHandler(event)}
                        />
                      </div>
                    ))}
                  </Form.Group>

                  <Form.Group controlId="pictures">
                    <Form.Label>Add Images</Form.Label>
                    <br/>
                    <input
                      onChange={event => this.fileChangedHandler(event)}
                      type="file"
                      multiple
                      className={touched.pictures && errors.pictures ? "error" : null}
                    />
                    {touched.pictureCount && errors.pictureCount ? (
                      <div className="error-message">{errors.pictureCount}</div>
                    ): null}
                  </Form.Group>

                  <Button onClick={handleSubmit}>Submit</Button>
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
  editService: (store_id, service_id, values) => editService(store_id, service_id, values),
  getCategories: (store_id) => getCategories(store_id),
  getService: (store_id, service_id) => getService(store_id, service_id)
}, dispatch)

const mapStateToProps = state => ({
  service: state.serviceReducer.service,
  workers: state.workerReducer.workers,
  categories: state.serviceReducer.categories,
  services: state.serviceReducer.services
})

export default connect(mapStateToProps, mapDispatchToProps)(ServiceEditForm);

import React from 'react';
import '../../App.css';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { convertMinsToHrsMins } from '../helperFunctions'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addWorker } from './WorkerHelper.js'
import { getStore } from '../Store/StoreHelper'
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class AddWorkerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      workerHours: [],
      storeHours: this.props.storeHours,
      weekIsWorking: [true, true, true, true, true, true, true],
      storeWeekIsWorking: [true, true, true, true, true, true, true],
      loading: true,
    };
    this.emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/
    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      email: Yup.string()
        .email("Must be a valid email address")
        .max(100, "Email must be less than 100 characters")
        .required("Email is required"),
    });

    this.triggerWorkerDisplay = this.triggerWorkerDisplay.bind(this);
  }

  // handle changes in the hours selection
  handleSelectChange = (event, setFieldValue, workerHours) => {
    var days = ['formHoursMonday', 'formHoursTuesday', 'formHoursWednesday', 'formHoursThursday', 'formHoursFriday', 'formHoursSaturday', 'formHoursSunday']
    var day = days.indexOf(event.target.id)
    var old_start_time = 0
    var old_end_time = 0
    var newWorkerHours = []
    old_start_time = workerHours[day].start_time
    old_end_time = workerHours[day].end_time
    if (parseInt(event.target.querySelector('option').value) <= 840) {
      newWorkerHours = [
        ...workerHours.slice(0, day),
        { start_time: parseInt(event.target.value), end_time: old_end_time },
        ...workerHours.slice(day + 1)
      ]
    } else {
      newWorkerHours = [
        ...workerHours.slice(0, day),
        { start_time: old_start_time, end_time: parseInt(event.target.value) },
        ...workerHours.slice(day + 1)
      ]
    }

    setFieldValue("workerHours", newWorkerHours)
  };

  // handle change in working day toggle
  handleDayStatusChange = (day, setFieldValue, weekIsWorking) => {
    var updateWeekIsWorking = [
      ...weekIsWorking.slice(0, day),
      !weekIsWorking[day],
      ...weekIsWorking.slice(day + 1)
    ]

    setFieldValue("weekIsWorking", updateWeekIsWorking)
  };

  // redirect to the worker display page and pass the new worker data
  triggerWorkerDisplay(returnedWorker, workerHours) {

    returnedWorker.workerHours = workerHours
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id + '/workers/' + returnedWorker.id,
      state: {
        worker: returnedWorker,
      }
    })
  }

  componentDidMount() {

    // fetch store hours on mounting
    // if(!this.props.storeHours) {
      this.props.getStore(this.props.match.params.store_id)
    // }
  }

  componentDidUpdate(prevProps) {

    if (this.props.storeHours !== prevProps.storeHours) {

      let receivedWorkerHours = this.props.storeHours.map((day) => ({ start_time: day.open_time, end_time: day.close_time }));
      let oldWeekIsWorking = this.state.weekIsWorking

      for(let i = 0; i < receivedWorkerHours.length; i++){
        if(receivedWorkerHours[i].start_time == null){
          oldWeekIsWorking[i] = false
        }
      }

      let storeWeekIsWorking = JSON.parse(JSON.stringify(oldWeekIsWorking))

      this.setState({
        storeHours: this.props.storeHours,
        weekIsWorking: oldWeekIsWorking,
        workerHours: receivedWorkerHours,
        storeWeekIsWorking: storeWeekIsWorking,
        loading: false
      })
    }

    if (this.props.addedWorker != prevProps.addedWorker) {

      this.triggerWorkerDisplay(this.props.addedWorker, this.state.workerHours)

    }
  }


  render() {
    const CreateStartTimesForDay = (props) => {
      if(this.state.storeHours[props.day].open_time == null){
        return <option key={"closed"} value={540}>{convertMinsToHrsMins(540)}</option>
      }
      else{
        let items = [];
        for (let i = this.state.storeHours[props.day].open_time; i <= 840; i += 60) {
          items.push(<option key={i} value={i}>{convertMinsToHrsMins(i)}</option>);
        }
        return items;
      }
    }
    const CreateEndTimesForDay = (props) => {
      if(this.state.storeHours[props.day].open_time == null){
        return <option key={"closed"} value={1020}>{convertMinsToHrsMins(1020)}</option>
      }
      else{
        let items = [];
        for (let i = 900; i <= this.state.storeHours[props.day].close_time; i += 60) {
          items.push(<option key={i} value={i}>{convertMinsToHrsMins(i)}</option>);
        }
        return items;
      }
    }
    const DisplayWithLoading = (props) => {
      if (this.state.loading) {
        return <Row className="vertical-center">
          <Col>
            <GridLoader
              css={override}
              size={20}
              color={"#3e4e69"}
              loading={this.state.isLoading}
            />
          </Col>
        </Row>
      } else {
        // only display checkboxes for days that the store is open
        let mondayCheckBox = <p>(Closed)</p>
        let tuesdayCheckBox = <p>(Closed)</p>
        let wednesdayCheckBox = <p>(Closed)</p>
        let thursdayCheckBox = <p>(Closed)</p>
        let fridayCheckBox = <p>(Closed)</p>
        let saturdayCheckBox = <p>(Closed)</p>
        let sundayCheckBox = <p>(Closed)</p>

        // worker form after loading
        return <Row className="justify-content-center my-5">
          <Col xs={12} lg={5}>
            <Formik
              initialValues={{
                email: this.state.email,
                workerHours: this.state.workerHours,
                weekIsWorking: this.state.weekIsWorking
              }}
              validationSchema={this.yupValidationSchema}
              onSubmit={(values, actions) => {
                let store_id = this.props.match.params.store_id

                // modify worker hours for db
                values.workerHours = values.workerHours.map((day, index) => {
                  if(values.weekIsWorking[index]){
                    return day
                  }
                  else{
                    return {start_time: null, end_time: null}
                  }
                })

                this.setState({
                  workerHours: values.workerHours
                })

                this.props.addWorker(store_id, values)

                actions.setSubmitting(false)
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
                    {(() => {
                      if(this.state.storeWeekIsWorking[0]){
                        mondayCheckBox = <Form.Check
                                          custom
                                          className="form-custom"
                                          type="checkbox"
                                          id="monday-toggle"
                                          label="Working Today?"
                                          checked={values.weekIsWorking[0]}
                                          onChange={() => this.handleDayStatusChange(0, setFieldValue, values.weekIsWorking)}
                                        />
                      }

                      if(this.state.storeWeekIsWorking[1]){
                        tuesdayCheckBox = <Form.Check
                                          custom
                                          className="form-custom"
                                          type="checkbox"
                                          id="tuesday-toggle"
                                          label="Working Today?"
                                          checked={values.weekIsWorking[1]}
                                          onChange={() => this.handleDayStatusChange(1, setFieldValue, values.weekIsWorking)}
                                        />
                      }

                      if(this.state.storeWeekIsWorking[2]){
                        wednesdayCheckBox = <Form.Check
                                          custom
                                          className="form-custom"
                                          type="checkbox"
                                          id="wednesday-toggle"
                                          label="Working Today?"
                                          checked={values.weekIsWorking[2]}
                                          onChange={() => this.handleDayStatusChange(2, setFieldValue, values.weekIsWorking)}
                                        />
                      }

                      if(this.state.storeWeekIsWorking[3]){
                        thursdayCheckBox = <Form.Check
                                          custom
                                          className="form-custom"
                                          type="checkbox"
                                          id="thursday-toggle"
                                          label="Working Today?"
                                          checked={values.weekIsWorking[3]}
                                          onChange={() => this.handleDayStatusChange(3, setFieldValue, values.weekIsWorking)}
                                        />
                      }

                      if(this.state.storeWeekIsWorking[4]){
                        fridayCheckBox = <Form.Check
                                          custom
                                          className="form-custom"
                                          type="checkbox"
                                          id="friday-toggle"
                                          label="Working Today?"
                                          checked={values.weekIsWorking[4]}
                                          onChange={() => this.handleDayStatusChange(4, setFieldValue, values.weekIsWorking)}
                                        />
                      }

                      if(this.state.storeWeekIsWorking[5]){
                        saturdayCheckBox = <Form.Check
                                          custom
                                          className="form-custom"
                                          type="checkbox"
                                          id="saturday-toggle"
                                          label="Working Today?"
                                          checked={values.weekIsWorking[5]}
                                          onChange={() => this.handleDayStatusChange(5, setFieldValue, values.weekIsWorking)}
                                        />
                      }

                      if(this.state.storeWeekIsWorking[6]){
                        sundayCheckBox = <Form.Check
                                          custom
                                          className="form-custom"
                                          type="checkbox"
                                          id="sunday-toggle"
                                          label="Working Today?"
                                          checked={values.weekIsWorking[6]}
                                          onChange={() => this.handleDayStatusChange(6, setFieldValue, values.weekIsWorking)}
                                        />
                      }
                    })()}

                    <h2>Add Worker</h2>

                    <Form.Group controlId="formEmail">
                      <InputGroup>
                        <InputGroup.Prepend>
                          <InputGroup.Text>
                            <FaEnvelope />
                          </InputGroup.Text>
                        </InputGroup.Prepend>
                        <Form.Control
                          type="email"
                          value={values.email}
                          placeholder="Email"
                          name="email"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className={touched.email && errors.email ? "error" : null}
                        />
                      </InputGroup>
                      {touched.email && errors.email ? (
                        <div className="error-message">{errors.email}</div>
                      ) : null}
                    </Form.Group>

                    {/* Later make this work with store hours*/}
                    <h4 style={{marginTop: 25}}>Worker Hours</h4>

                    <Form.Group controlId="formHoursMonday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Monday</h5>
                          {mondayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[0] || !this.state.storeWeekIsWorking[0]} value={!values.weekIsWorking[0] ? 540 : values.workerHours[0].start_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateStartTimesForDay day={0} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[0]  || !this.state.storeWeekIsWorking[0]} value={!values.weekIsWorking[0] ? 1020 : values.workerHours[0].end_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateEndTimesForDay day={0} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Form.Group controlId="formHoursTuesday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Tuesday</h5>
                          {tuesdayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[1]  || !this.state.storeWeekIsWorking[1]} value={!values.weekIsWorking[1] ? 540 : values.workerHours[1].start_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateStartTimesForDay day={1} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[1]  || !this.state.storeWeekIsWorking[1]} value={!values.weekIsWorking[1] ? 1020 : values.workerHours[1].end_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateEndTimesForDay day={1} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>


                    <Form.Group controlId="formHoursWednesday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Wednesday</h5>
                          {wednesdayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[2]  || !this.state.storeWeekIsWorking[2]} value={!values.weekIsWorking[2] ? 540 : values.workerHours[2].start_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateStartTimesForDay day={2} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[2]  || !this.state.storeWeekIsWorking[2]} value={!values.weekIsWorking[2]  ? 1020 : values.workerHours[2].end_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateEndTimesForDay day={2} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Form.Group controlId="formHoursThursday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Thursday</h5>
                          {thursdayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[3]  || !this.state.storeWeekIsWorking[3]} value={!values.weekIsWorking[3]  ? 540 : values.workerHours[3].start_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateStartTimesForDay day={3} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[3]  || !this.state.storeWeekIsWorking[3]} value={!values.weekIsWorking[3]  ? 1020 : values.workerHours[3].end_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateEndTimesForDay day={3} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>


                    <Form.Group controlId="formHoursFriday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Friday</h5>
                          {fridayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[4]  || !this.state.storeWeekIsWorking[4]} value={!values.weekIsWorking[4] ? 540 : values.workerHours[4].start_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateStartTimesForDay day={4} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[4]  || !this.state.storeWeekIsWorking[4]} value={!values.weekIsWorking[4] ? 1020 : values.workerHours[4].end_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateEndTimesForDay day={4} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Form.Group controlId="formHoursSaturday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Saturday</h5>
                          {saturdayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[5]  || !this.state.storeWeekIsWorking[5]} value={!values.weekIsWorking[5] ? 540 : values.workerHours[5].start_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateStartTimesForDay day={5} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[5]  || !this.state.storeWeekIsWorking[5]} value={!values.weekIsWorking[5] ? 1020 : values.workerHours[5].end_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateEndTimesForDay day={5} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>


                    <Form.Group controlId="formHoursSunday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Sunday</h5>
                          {sundayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[6]  || !this.state.storeWeekIsWorking[6]} value={!values.weekIsWorking[6] ? 540 : values.workerHours[6].start_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateStartTimesForDay day={6} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!values.weekIsWorking[6]  || !this.state.storeWeekIsWorking[6]} value={!values.weekIsWorking[6] ? 1020 : values.workerHours[6].end_time} onChange={event => this.handleSelectChange(event, setFieldValue, values.workerHours)}>
                            <CreateEndTimesForDay day={6} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>
                    <Button className="update-button" disabled={isSubmitting || (Object.keys(errors).length === 0 && errors.constructor === Object && (Object.keys(touched).length === 0 && touched.constructor === Object)) || !(Object.keys(errors).length === 0 && errors.constructor === Object)} onClick={handleSubmit}>Submit</Button>
                  </Form>
                )}
            </Formik>
          </Col>
        </Row>
      }
    }

    return (
      <Container fluid>
        <DisplayWithLoading/>
      </Container>
    );
  }
}


const mapDispatchToProps = dispatch => bindActionCreators({
  getStore: (id) => getStore(id),
  addWorker: (id, values) => addWorker(id, values)
}, dispatch)


const mapStateToProps = state => ({
  storeHours: state.storeReducer.store.storeHours,
  addedWorker: state.workerReducer.worker
})


export default connect(mapStateToProps, mapDispatchToProps)(AddWorkerForm);

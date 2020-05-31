import React from 'react';
import '../../App.css';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import { Formik } from 'formik';
import {
  addAlert
} from '../../reduxFolder/actions/alert'
import store from '../../reduxFolder/store';
import { convertMinsToHrsMins } from '../helperFunctions'
import GridLoader from 'react-spinners/GridLoader'
import { css } from '@emotion/core'
import { withRouter } from "react-router"
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const override = css`
  display: block;
  margin: 0 auto;
`;


class WorkerEditForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      worker: {
        id: 0,
        store_id: 0,
        user_id: 0,
        created_at: "",
        first_name: "",
        last_name: ""
      },

      storeHours: [
        { day_of_the_week: 0, start_time: 0, end_time: 0},
        { day_of_the_week: 1, start_time: 0, end_time: 0},
        { day_of_the_week: 2, start_time: 0, end_time: 0},
        { day_of_the_week: 3, start_time: 0, end_time: 0},
        { day_of_the_week: 4, start_time: 0, end_time: 0},
        { day_of_the_week: 5, start_time: 0, end_time: 0},
        { day_of_the_week: 6, start_time: 0, end_time: 0}
      ],
      workerHours: [
        { day_of_the_week: 0, start_time: 0, end_time: 0},
        { day_of_the_week: 1, start_time: 0, end_time: 0},
        { day_of_the_week: 2, start_time: 0, end_time: 0},
        { day_of_the_week: 3, start_time: 0, end_time: 0},
        { day_of_the_week: 4, start_time: 0, end_time: 0},
        { day_of_the_week: 5, start_time: 0, end_time: 0},
        { day_of_the_week: 6, start_time: 0, end_time: 0}
      ],
      originalWorkerHours: [
        { day_of_the_week: 0, start_time: 0, end_time: 0},
        { day_of_the_week: 1, start_time: 0, end_time: 0},
        { day_of_the_week: 2, start_time: 0, end_time: 0},
        { day_of_the_week: 3, start_time: 0, end_time: 0},
        { day_of_the_week: 4, start_time: 0, end_time: 0},
        { day_of_the_week: 5, start_time: 0, end_time: 0},
        { day_of_the_week: 6, start_time: 0, end_time: 0}
      ],
      loading: true,
      newHours: [],
      weekIsWorking: [true, true, true, true, true, true, true],
      storeWeekIsWorking: [true, true, true, true, true, true, true]
    };

    this.triggerWorkerDisplay = this.triggerWorkerDisplay.bind(this);
  }

  // redirect to the store display page and pass the new store data
  triggerWorkerDisplay(returnedWorker) {

    let store_id = this.props.match.params.store_id ? this.props.match.params.store_id : this.props.store_id;
    let worker_id = this.props.match.params.worker_id ? this.props.match.params.worker_id : this.props.worker_id;

    this.props.history.push({
      pathname: '/stores/' + store_id + '/workers/' + worker_id,
      state: {
        worker: returnedWorker
      }
    })
  }

  handleSelectChange = (event) => {
    var days = ['formHoursMonday', 'formHoursTuesday', 'formHoursWednesday', 'formHoursThursday', 'formHoursFriday', 'formHoursSaturday', 'formHoursSunday']
    var day = days.indexOf(event.target.id)
    var updateNewHours = this.state.newHours
    var old_start_time = 0
    var old_end_time = 0
    var newWorkerHours = []
    if (this.state.newHours[day]) {
      old_start_time = this.state.newHours[day].start_time
      old_end_time = this.state.newHours[day].end_time
    } else {
      old_start_time = this.state.workerHours[day].start_time
      old_end_time = this.state.workerHours[day].end_time
    }

    if (parseInt(event.target.querySelector('option').value) <= 840) {
      if(this.state.storeHours[day].end_time == null){
        old_end_time = 1020
      }
      updateNewHours[day] = { start_time: parseInt(event.target.value), end_time: old_end_time }
      newWorkerHours = [
        ...this.state.workerHours.slice(0, day),
        { start_time: parseInt(event.target.value), end_time: old_end_time },
        ...this.state.workerHours.slice(day + 1)
      ]
    } else {
      if(this.state.storeHours[day].start_time == null){
        old_start_time = 540
      }
      updateNewHours[day] = { start_time: old_start_time, end_time: parseInt(event.target.value) }
      newWorkerHours = [
        ...this.state.workerHours.slice(0, day),
        { start_time: old_start_time, end_time: parseInt(event.target.value) },
        ...this.state.workerHours.slice(day + 1)
      ]
    }

    this.setState({
      newHours: updateNewHours,
      workerHours: newWorkerHours
    })
  };

  handleDayStatusChange = (day) => {
    var updateWeekIsWorking = [
      ...this.state.weekIsWorking.slice(0, day),
      !this.state.weekIsWorking[day],
      ...this.state.weekIsWorking.slice(day + 1)
    ]

    let oldWorkerHours = this.state.workerHours
    if(this.state.workerHours[day].start_time == null){
      oldWorkerHours[day].start_time = 540
      oldWorkerHours[day].end_time = 1020
    }

    this.setState({
      weekIsWorking: updateWeekIsWorking,
      workerHours: oldWorkerHours
    })
  };

  componentDidMount() {
    let store_id = this.props.match.params.store_id ? this.props.match.params.store_id : this.props.store_id;
    let worker_id = this.props.match.params.worker_id ? this.props.match.params.worker_id : this.props.worker_id;

    if(this.props.location.state && this.props.location.state.worker){
      this.setState({
        worker: this.props.location.state.worker
      })
    }
    else{
      // first we fetch the service itself
      fetch(fetchDomain + '/stores/' + store_id + '/workers/' + worker_id, {
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
        if(data){
          this.setState({
            worker: data
          })
        }
      });
    }

    Promise.all([
      fetch(fetchDomain + '/stores/' + store_id + '/workers/' + worker_id + '/hours', {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      }).then(value => value.json()),
      fetch(fetchDomain + '/stores/' + store_id + "/storeHours", {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      }).then(value => value.json())
    ]).then(allResponses => {

      let oldWeekIsWorking = this.state.weekIsWorking
      for(let i = 0; i < allResponses[0].length; i++){
        if(allResponses[0][i].start_time == null){
          oldWeekIsWorking[i] = false
        }
      }

      let storeWeekIsWorking = this.state.storeWeekIsWorking
      for(let i = 0; i < allResponses[1].length; i++){
        if(allResponses[1][i].open_time == null){
          storeWeekIsWorking[i] = false
        }
      }
      this.setState({
        storeHours: allResponses[1],
        workerHours: allResponses[0],
        weekIsWorking: oldWeekIsWorking,
        storeWeekIsWorking: storeWeekIsWorking,
        originalWorkerHours: JSON.parse(JSON.stringify(allResponses[0])),
        loading: false
      })
    })
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
      if(this.state.storeHours[props.day].close_time == null){
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
              color={"#8CAFCB"}
              loading={this.state.isLoading}
            />
          </Col>
        </Row>
      } else {
        let mondayCheckBox = <p>(Closed)</p>
        let tuesdayCheckBox = <p>(Closed)</p>
        let wednesdayCheckBox = <p>(Closed)</p>
        let thursdayCheckBox = <p>(Closed)</p>
        let fridayCheckBox = <p>(Closed)</p>
        let saturdayCheckBox = <p>(Closed)</p>
        let sundayCheckBox = <p>(Closed)</p>

        if(this.state.storeWeekIsWorking[0]){
          mondayCheckBox = <Form.Check
                            custom
                            type="checkbox"
                            id="monday-toggle"
                            label="Working Today?"
                            className="form-custom"
                            checked={this.state.weekIsWorking[0]}
                            onChange={() => this.handleDayStatusChange(0)}
                          />
        }

        if(this.state.storeWeekIsWorking[1]){
          tuesdayCheckBox = <Form.Check
                            custom
                            className="form-custom"
                            type="checkbox"
                            id="tuesday-toggle"
                            label="Working Today?"
                            checked={this.state.weekIsWorking[1]}
                            onChange={() => this.handleDayStatusChange(1)}
                          />
        }

        if(this.state.storeWeekIsWorking[2]){
          wednesdayCheckBox = <Form.Check
                            custom
                            className="form-custom"
                            type="checkbox"
                            id="wednesday-toggle"
                            label="Working Today?"
                            checked={this.state.weekIsWorking[2]}
                            onChange={() => this.handleDayStatusChange(2)}
                          />
        }

        if(this.state.storeWeekIsWorking[3]){
          thursdayCheckBox = <Form.Check
                            custom
                            className="form-custom"
                            type="checkbox"
                            id="thursday-toggle"
                            label="Working Today?"
                            checked={this.state.weekIsWorking[3]}
                            onChange={() => this.handleDayStatusChange(3)}
                          />
        }

        if(this.state.storeWeekIsWorking[4]){
          fridayCheckBox = <Form.Check
                            custom
                            className="form-custom"
                            type="checkbox"
                            id="friday-toggle"
                            label="Working Today?"
                            checked={this.state.weekIsWorking[4]}
                            onChange={() => this.handleDayStatusChange(4)}
                          />
        }

        if(this.state.storeWeekIsWorking[5]){
          saturdayCheckBox = <Form.Check
                            custom
                            className="form-custom"
                            type="checkbox"
                            id="saturday-toggle"
                            label="Working Today?"
                            checked={this.state.weekIsWorking[5]}
                            onChange={() => this.handleDayStatusChange(5)}
                          />
        }

        if(this.state.storeWeekIsWorking[6]){
          sundayCheckBox = <Form.Check
                            custom
                            className="form-custom"
                            type="checkbox"
                            id="sunday-toggle"
                            label="Working Today?"
                            checked={this.state.weekIsWorking[6]}
                            onChange={() => this.handleDayStatusChange(6)}
                          />
        }

        return <Formik
              enableReinitialize
              initialValues={{
                id: this.state.worker.id,
                store_id: this.state.worker.store_id,
                user_id: this.state.worker.user_id,
                created_at: this.state.worker.created_at,
                first_name: this.state.worker.first_name,
                last_name: this.state.worker.last_name,
                newHours: this.state.newHours,
                noChange: false
              }}
              onSubmit={(values) => {

                let store_id = this.props.match.params.store_id ? this.props.match.params.store_id : this.props.store_id;
                let worker_id = this.props.match.params.worker_id ? this.props.match.params.worker_id : this.props.worker_id;

                values.newHours = this.state.workerHours.map((day, index) => {
                  if(this.state.weekIsWorking[index] && (this.state.originalWorkerHours[index].start_time !== day.start_time || this.state.originalWorkerHours[index].end_time !== day.end_time)){
                    return day
                  } 
                  else if(this.state.weekIsWorking[index] && (this.state.originalWorkerHours[index].start_time === day.start_time && this.state.originalWorkerHours[index].end_time === day.end_time)){
                    return {}
                  }
                  else if(this.state.weekIsWorking[index] === false && this.state.originalWorkerHours[index].start_time === null){
                    return {}
                  }else {
                    return {start_time: null, end_time: null}
                  }
                })

                fetch(fetchDomain + '/stores/' + store_id + '/workers/' + worker_id, {
                  method: "POST",
                  headers: {
                    'Content-type': 'application/json'
                  },
                  credentials: 'include',
                  body: JSON.stringify(values)
                })
                  .then(function (response) {
                    if (response.status !== 200) {
                      store.dispatch(addAlert(response))
                    }
                    else {
                      // redirect to worker page
                      return response.json()
                    }
                  })
                  .then(data => {
                    if (data) {
                      let actualHours = []
                      for(let i = 0; i < this.state.workerHours.length; i++) {
                        if(this.state.weekIsWorking[i] && this.state.storeWeekIsWorking[i]) {
                          actualHours.push(this.state.workerHours[i])
                        } else {
                          actualHours.push({end_time: null, start_time: null})
                        }
                      }
                      this.props.updateWorkerHours(actualHours)
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
                setFieldValue }) => (
                  <Form className="rounded">
                    <h3>Edit Worker Hours</h3>

                    <Form.Group controlId="formHoursMonday">
                      <Form.Row className="text-left">
                        <Col>
                          <h5>Monday</h5>
                          {mondayCheckBox}
                        </Col>
                      </Form.Row>
                      <Form.Row>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[0] || !this.state.storeWeekIsWorking[0]} value={this.state.workerHours[0].start_time === null ? 540 : this.state.workerHours[0].start_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateStartTimesForDay day={0} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[0] || !this.state.storeWeekIsWorking[0]} value={this.state.workerHours[0].end_time === null ? 1020 : this.state.workerHours[0].end_time} onChange={this.handleSelectChange.bind(this)}>
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
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[1] || !this.state.storeWeekIsWorking[1]} value={this.state.workerHours[1].start_time === null ? 540 : this.state.workerHours[1].start_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateStartTimesForDay day={1} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[1] || !this.state.storeWeekIsWorking[1]} value={this.state.workerHours[1].end_time === null ? 1020 : this.state.workerHours[1].end_time} onChange={this.handleSelectChange.bind(this)}>
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
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[2] || !this.state.storeWeekIsWorking[2]} value={this.state.workerHours[2].start_time === null ? 540 : this.state.workerHours[2].start_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateStartTimesForDay day={2} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[2] || !this.state.storeWeekIsWorking[2]} value={this.state.workerHours[2].end_time === null ? 1020 : this.state.workerHours[2].end_time} onChange={this.handleSelectChange.bind(this)}>
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
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[3] || !this.state.storeWeekIsWorking[3]} value={this.state.workerHours[3].start_time === null ? 540 : this.state.workerHours[3].start_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateStartTimesForDay day={3} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[3]  || !this.state.storeWeekIsWorking[3]} value={this.state.workerHours[3].end_time === null ? 1020 : this.state.workerHours[3].end_time} onChange={this.handleSelectChange.bind(this)}>
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
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[4] || !this.state.storeWeekIsWorking[4]} value={this.state.workerHours[4].start_time === null ? 540 : this.state.workerHours[4].start_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateStartTimesForDay day={4} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[4] || !this.state.storeWeekIsWorking[4]} value={this.state.workerHours[4].end_time === null ? 1020 : this.state.workerHours[4].end_time} onChange={this.handleSelectChange.bind(this)}>
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
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[5] || !this.state.storeWeekIsWorking[5]} value={this.state.workerHours[5].start_time === null ? 540 : this.state.workerHours[5].start_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateStartTimesForDay day={5} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[5] || !this.state.storeWeekIsWorking[5]} value={this.state.workerHours[5].end_time === null ? 1020 : this.state.workerHours[5].end_time} onChange={this.handleSelectChange.bind(this)}>
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
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[6] || !this.state.storeWeekIsWorking[6]} value={this.state.workerHours[6].start_time === null ? 540 : this.state.workerHours[6].start_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateStartTimesForDay day={6} />
                          </Form.Control>
                        </Col>
                        <Col>
                          <Form.Control as="select" disabled={!this.state.weekIsWorking[6] || !this.state.storeWeekIsWorking[6]} value={this.state.workerHours[6].end_time === null ? 1020 : this.state.workerHours[6].end_time} onChange={this.handleSelectChange.bind(this)}>
                            <CreateEndTimesForDay day={6} />
                          </Form.Control>
                        </Col>
                      </Form.Row>
                    </Form.Group>

                    <Button style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={handleSubmit}>Submit</Button>
                  </Form>
                )}
            </Formik>
      }
    }

    return (
      <Container fluid>
        <DisplayWithLoading />
      </Container>
    );
  }
}

export default withRouter(WorkerEditForm);

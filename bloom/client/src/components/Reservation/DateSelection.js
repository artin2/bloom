import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import './DateSelection.css';
import { Form, Button } from 'react-bootstrap';
import store from '../../redux/store';
import { addAlert } from '../../redux/actions/alert'
import { convertMinsToHrsMins } from '../helperFunctions'
import GridLoader from 'react-spinners/GridLoader'
import { css } from '@emotion/core'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const override = css`
  display: block;
  margin: 0 auto;
`;

class DateSelection extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startDate: new Date(),
      currDate: new Date(),
      selectedTime: 540,
      loading: true,
      appointments: []
    };
  }

  handleDateChange = date => {
    if (date.getMonth() !== this.state.startDate.getMonth()) {
      this.setState({
        loading: true
      })
      fetch(fetchDomain + '/stores/' + this.props.store_id + '/appointments/month/' + (parseInt(date.getMonth()) + 1), {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      })
        .then(function (response) {
          if (response.status !== 200) {
            store.dispatch(addAlert(response))
          }
          else {
            return response.json()
          }
        })
        .then(data => {
          let parsedData = data.map(appointment => {
            appointment.date = new Date(appointment.date)
            return appointment
          })
          this.setState({
            appointments: parsedData,
            currDate: date,
            startDate: date,
            loading: false
          })
        });
    }
    this.setState({
      currDate: date
    });
  };

  handleSelectChange = (event) => {
    this.setState({
      selectedTime: parseInt(event.target.value)
    });
  };

  handleSlotClick = (schedule) => {
    this.props.updateAppointments(schedule)
    this.props.handleSubmit(true)
  }

  componentDidMount() {
    fetch(fetchDomain + '/stores/' + this.props.store_id + '/appointments/month/' + (parseInt(this.state.startDate.getMonth()) + 1), {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          store.dispatch(addAlert(response))
        }
        else {
          return response.json()
        }
      })
      .then(data => {
        let parsedData = data.map(appointment => {
          appointment.date = new Date(appointment.date + ' UTC')
          return appointment
        })
        this.setState({
          appointments: parsedData,
          loading: false
        })
      });
  }

  render() {
    const CreateTimeSelects = (props) => {
      let items = [];
      for (let i = this.props.storeHours[this.state.currDate.getDay()].open_time; i + this.props.time <= this.props.storeHours[this.state.currDate.getDay()].close_time; i += 60) {
        items.push(<option key={i} value={i}>{convertMinsToHrsMins(i)}</option>);
      }
      return items;
    }

    const SlotsAtSelectedTime = () => {
      let slots = []
      let schedules = []
      // Loop through different appointment start times for the day
      for (let i = this.state.selectedTime; (i < this.state.selectedTime + 120 && i + this.props.time <= this.props.storeHours[this.state.currDate.getDay()].close_time); i += 15) {
        let currTime = i
        let foundSchedule = false
        let currSchedule = []
        let currDaySchedules = this.props.workersSchedules.filter(element => element.day_of_the_week === this.state.currDate.getDay());
        let scheduleStillWorks = true
        // We're going to increment through the workers that are scheduled for today and build a schedule bit by bit until we finish or realize there are no more appointments for the day
        // Don't want to lose the original values of currTime, currService, and k when we continue ahead in our schedule
        let currScheduleCurrTime = currTime
        let currScheduleCurrWorkerIndex = 0
        let currScheduleServiceIndex = 0
        // console.log("current time is: ", convertMinsToHrsMins(currTime))
        // Start building our schedule
        while (scheduleStillWorks && !foundSchedule) {
          let available = true
          let currScheduleCurrService = this.props.selectedServices[currScheduleServiceIndex]
          let currScheduleCurrWorker = currDaySchedules[currScheduleCurrWorkerIndex].worker_id
          // console.log("checking if appointment is in worker's hours: ")
          // console.log("currworker works from: ", currDaySchedules[currScheduleCurrWorkerIndex].start_time, "-",  currDaySchedules[currScheduleCurrWorkerIndex].end_time)
          // console.log("trying to match with appointment from: ", convertMinsToHrsMins(currScheduleCurrTime), "-", convertMinsToHrsMins(currScheduleCurrTime + currScheduleCurrService.duration))
          // Check if appointment is within worker's hours
          if (currDaySchedules[currScheduleCurrWorkerIndex].start_time > currScheduleCurrTime || currDaySchedules[currScheduleCurrWorkerIndex].end_time < (currScheduleCurrTime + currScheduleCurrService.duration)) {
            available = false
          } else {
            let currWorkerAppointments = this.state.appointments.filter((appointment) => {
              return appointment.worker_id === currScheduleCurrWorker && appointment.date.setHours(0, 0, 0, 0) === this.state.currDate.setHours(0, 0, 0, 0)
            })
            // console.log("Within bounds, checking for conflicts. ")
            // Check for conflicts via worker's existing appointments for the day
            // console.log("currWorkers appointments: ", currWorkerAppointments)
            for (let m = 0; m < currWorkerAppointments.length; m++) {
              if ((currScheduleCurrTime >= currWorkerAppointments[m].start_time && currScheduleCurrTime < currWorkerAppointments[m].end_time) || (currScheduleCurrTime + currScheduleCurrService.duration > currWorkerAppointments[m].start_time && currScheduleCurrTime + currScheduleCurrService.duration < currWorkerAppointments[m].end_time)) {
                // console.log("conflict found with because of slot from: ", convertMinsToHrsMins(currWorkerAppointments[m].start_time), "-", convertMinsToHrsMins(currWorkerAppointments[m].end_time))
                // Worker is unavailable
                available = false
                break
              }
            }
          }

          if (available) {
            // Add slot to the schedule we are building
            currSchedule.push({ worker_id: currScheduleCurrWorker, service_id: currScheduleCurrService.id, start_time: currScheduleCurrTime, end_time: currScheduleCurrTime + currScheduleCurrService.duration, price: currScheduleCurrService.cost, date: this.state.currDate })
            currScheduleCurrTime += currScheduleCurrService.duration
            currScheduleServiceIndex += 1
            //NOTE, will always cycle to first worker. What if we want to maintain worker for entire appointment duration? May be worth refactoring for continuity.
            currScheduleCurrWorkerIndex = 0
            if (currScheduleServiceIndex === this.props.selectedServices.length) {
              //We've found a worker for each service in the appointment. We're done.
              foundSchedule = true
            }
          } else if (currScheduleCurrWorkerIndex + 1 < currDaySchedules.length) {
            // continue checking if there's another worker available for this service
            currScheduleCurrWorkerIndex += 1
          } else {
            // no workers were available for this appointment.
            // NOTE: it may be possible, in the case where there are multiple services selected for the appointment, that there is still some combination of worker slots to make this appointment work. I'm only checking linearly. This may be worth refactoring for better scheduling, but the tradeoff is increased complexity in scheduling.
            scheduleStillWorks = false
          }
        }

        if (foundSchedule) {
          schedules.push(currSchedule)
          slots.push(<Button className="mt-3 mx-2" style={{backgroundColor: '#8CAFCB', border: '0px'}} key={i} onClick={() => this.handleSlotClick(currSchedule)}>{convertMinsToHrsMins(i)}</Button>)
        }
      }
      if (slots.length === 0 && this.props.storeHours[this.state.currDate.getDay()].open_time === null) {
        return <h2 className="mt-4">This store doesn't work on this day. Select another date. </h2>
      } else if (slots.length === 0) {
        return <h2 className="mt-4">No appointments available at this time.</h2>
      }
      return slots
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
        return <Row className="justify-content-center text-xs-center text-sm-left pl-2">
          <Col xs="12" md="11" className="px-1">
            {/* Maybe want to have this with multiple rows, each row belongs to technician. One last row is technician mix to make the appointment work out */}
            <SlotsAtSelectedTime />
          </Col>
        </Row>

      }
    }

    return (
      <Card
        text='dark'
        className='mt-0 py-3 add-shadow'
        style={{overflow: 'visible'}}
      >
        <div id="date-selection-form">
          <h3>Select Appointment Time</h3>
          <Card.Body className='pt-0'>
            <Row className='justify-content-center'>
              <Col xs="11" md="6" className="mt-3">
                <div className="customDatePickerWidth">
                  <DatePicker
                    className="form-control"
                    selected={this.state.currDate}
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
              <Col xs="11" md="6" className="mt-3">
                <Form>
                  <Form.Control  key={this.state.currDate} as="select" value={this.state.selectedTime} onChange={this.handleSelectChange.bind(this)}>
                    <CreateTimeSelects date={this.state.currDate} />
                  </Form.Control>
                </Form>
              </Col>
            </Row>
            <DisplayWithLoading />
            <Row className="justify-content-center mt-4">
              <Col md="3">
                <Button block style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={() => this.props.handleSubmit(false)}>Previous</Button>
              </Col>
            </Row>
          </Card.Body>
        </div>
      </Card>
    );
  }
}

export default DateSelection;

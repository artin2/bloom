import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button, Card, ListGroup } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { withRouter } from "react-router-dom";
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { convertMinsToHrsMins } from '../helperFunctions'
import { css } from '@emotion/core'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getAppointment, deleteAppointment } from './AppointmentHelper.js'
import { isDeleted } from '../../redux/actions/appointment'
import GridLoader from 'react-spinners/GridLoader'
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class AppointmentDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      appointment: [],
      start_time: 0,
      user_id: 0,
      end_time: 0,
      store_name: '',
      cost: 0,
      service_names: [],
      workers: [],
      loading: true,
      canReview: false
    }
  }

  deleteAppointment = () => {

    this.props.deleteAppointment(this.props.match.params.group_id)
  }

  triggerAppointmentCancel = () => {
    confirmAlert({
      title: 'Are you sure?',
      message: 'You will be charged a cancellation fee by this store.',
      buttons: [
        {
          label: 'Yes',
          onClick: () => this.deleteAppointment()
        },
        {
          label: 'No'
        }
      ]
    });
  }

  triggerReview() {
    console.log("appointment is:", this.state.appointment, "store id is:", this.state.appointment[0].store_id)
    this.props.history.push({
      pathname: '/stores/' + this.state.appointment[0].store_id + '/review'
    })
  }


  async componentDidUpdate(prevProps) {

    if(this.props.appointment !== prevProps.appointment) {
      let data = this.props.appointment
      console.log(data)

      await fetch(fetchDomain + '/checkTokenPrevReviewAndAppt', {
        method: "POST",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({store_id: data.appointment[0].store_id, email: JSON.parse(Cookies.get('user').substring(2)).email})
      }).then(res => {
        this.setState({
          appointment: data.appointment,
          user_id: data.user_id,
          start_time: data.start_time,
          end_time: data.end_time,
          store_name: data.store_name,
          cost: data.cost,
          service_names: data.service_names,
          workers: data.workers,
          loading: false,
          canReview: res.status === 200
        })
      })
    }
    if(this.props.deleted !== prevProps.deleted) {
      this.props.isDeleted(false)
      this.props.history.push({
           pathname: '/users/'+ this.state.user_id +'/appointments'
      })
    }
  }

  async componentDidMount() {
    this.props.getAppointment(this.props.match.params.group_id)
  }

  render() {
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
        let cancelButton, reviewButton;
        // if (Cookies.get('user') && this.state.user_id === JSON.parse(Cookies.get('user').substring(2)).id) {
        //   cancelButton = <Button variant="danger" onClick={() => this.triggerAppointmentCancel()}>Cancel Appointment</Button>
        // }

        let current_time = new Date()
        let appointment_time_converted = new Date(this.state.appointment[0].date)
        if(appointment_time_converted < current_time && this.state.canReview){
          reviewButton = <Button variant="warning" onClick={() => this.triggerReview()}>Review Store</Button>
        }
        else if(appointment_time_converted >= current_time){
          cancelButton = <Button variant="danger" onClick={() => this.triggerAppointmentCancel()}>Cancel Appointment</Button>
        }

        return <Row className="justify-content-md-center">
          <Col lg={5}>
            <Card className="mt-5 add-shadow">
              <Card.Header as="h5">Your Appointment at: {this.state.store_name}</Card.Header>
              <Card.Body>
                <Card.Text as="div">
                  <ListGroup as="div" variant="flush">
                    <ListGroup.Item><b>Appointment Date:</b> {new Date(this.state.appointment[0].date).toLocaleDateString("en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} </ListGroup.Item>
                    <ListGroup.Item><b>Appointment Time:</b> {convertMinsToHrsMins(this.state.start_time)}-{convertMinsToHrsMins(this.state.end_time)}</ListGroup.Item>
                    <ListGroup.Item><b>Services:</b> {this.state.service_names.toString()}</ListGroup.Item>
                    <ListGroup.Item><b>Scheduled Technicians:</b> {this.state.workers.toString()}</ListGroup.Item>
                    <ListGroup.Item><b>Total Cost:</b> ${this.state.cost}</ListGroup.Item>
                  </ListGroup>
                </Card.Text>
                {reviewButton}
                {cancelButton}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      }
    }

    return (
      <Container fluid>
        <DisplayWithLoading />
      </Container>
    );
  }
}


const mapDispatchToProps = dispatch => bindActionCreators({
  getAppointment: (group_id) => getAppointment(group_id),
  deleteAppointment: (group_id) => deleteAppointment(group_id),
  isDeleted: (deleted) => isDeleted(deleted)
}, dispatch)

const mapStateToProps = state => ({
  deleted: state.appointmentReducer.deleted,
  appointment: state.appointmentReducer.appointment
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AppointmentDisplay));

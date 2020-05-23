import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button, Card, ListGroup } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { withRouter } from "react-router-dom";
import {
  addAlert
} from '../../reduxFolder/actions/alert'
import store from '../../reduxFolder/store';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { convertMinsToHrsMins } from '../../util/helperFunctions'
import { css } from '@emotion/core'
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
      loading: true
    }
  }

  deleteAppointment = () => {
    fetch(fetchDomain + '/appointments/delete/' + this.props.match.params.group_id, {
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
        store.dispatch(addAlert('Deleted Appointment'))
        this.props.history.push({
          pathname: '/'
        })
      });
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

  componentDidMount() {
    // Refactor to optimize if we were passed the appointment data from calling component
    // if (this.props.location && this.props.location.state && this.props.location.state.appointment) {
    //   this.setState({
    //     appointment: this.props.location.state.appointment,
    //     user_id: this.props.location.state.user_id,
    //     start_time: this.props.location.state.start_time,
    //     end_time: this.props.location.state.end_time,
    //     store_name: this.props.location.state.store_name,
    //     cost: this.props.location.state.cost,
    //     workers: this.props.location.state.workers,
    //     loading: false
    //   })
    // }
    // else {
      // retrieve the appointment data from the database
      fetch(fetchDomain + '/appointments/display/' + this.props.match.params.group_id, {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      })
        .then(function (response) {
          if (response.status !== 200) {
            // throw an error alert
            store.dispatch(addAlert(response))
          }
          else {
            return response.json();
          }
        })
        .then(data => {
          if (data) {
            this.setState({
              appointment: data.appointment,
              user_id: data.user_id,
              start_time: data.start_time,
              end_time: data.end_time,
              store_name: data.store_name,
              cost: data.cost,
              service_names: data.service_names,
              workers: data.workers,
              loading: false
            })
          }
        });
    // }
  }

  render() {
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
        let cancelButton;
        if (Cookies.get('user') && this.state.user_id === JSON.parse(Cookies.get('user').substring(2)).id) {
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

export default withRouter(AppointmentDisplay);
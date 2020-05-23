import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Card, ListGroup, Image } from 'react-bootstrap';
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
      store_name_mappings: [],
      store_ids: [],
      cost: 0,
      service_name_mappings: [],
      grouped_service_ids: [],
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

  triggerAppointmentDisplay = (group_id) => {
    this.props.history.push({
      pathname: '/appointments/' + group_id
    })
  }

  componentDidMount() {
    // retrieve the appointment data from the database
    fetch(fetchDomain + '/appointments/' + JSON.parse(Cookies.get('user').substring(2)).id, {
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
          if(Object.keys(data).length === 0 && data.constructor === Object) {
            this.setState({
              loading: false,
              hasAppointments: false
            })
          } else {
            this.setState({
              store_ids: data.store_ids,
              store_name_mappings: data.store_name_mappings,
              dates: data.dates,
              start_times: data.start_times, 
              end_times: data.end_times,
              costs: data.costs,
              group_ids: data.group_ids,
              service_name_mappings: data.service_name_mappings,
              grouped_service_ids: data.grouped_service_ids,
              loading: false,
              hasAppointments: true
            })
          }
          
        }
      });
  }

  render() {
    //remove these props args if not needed
    const ShowServices = (props) => {
      let listGroupItems = [];
      for (let i = 0; i < this.state.grouped_service_ids[props.index].length; i ++) {
        listGroupItems.push(<ListGroup.Item key={this.state.grouped_service_ids[props.index][i]}>{this.state.service_name_mappings.find((element) => element.id === this.state.grouped_service_ids[props.index][i]).name}</ListGroup.Item>);
      }
      return listGroupItems;
    }

    const AppointmentList = (props) => {
      let cards = [];
      for (let i = 0; i < this.state.group_ids.length; i ++) {
        cards.push(<Card style={{cursor: 'pointer'}} key={this.state.group_ids[i]}className="my-5 add-shadow" onClick={() => this.triggerAppointmentDisplay(this.state.group_ids[i])}>
          <Card.Header as="h4">{this.state.store_name_mappings.find((element) => element.id === this.state.store_ids[i]).name} on {new Date(this.state.dates[i]).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</Card.Header>
          <Card.Body>
            <Card.Text as="div">
              <Row>
                <Col>
                  <h5>{convertMinsToHrsMins(this.state.start_times[i])} - {convertMinsToHrsMins(this.state.end_times[i])} </h5>
                </Col>
              </Row>
              <Row>
                <Col>
                  <h5>Services Booked for Today</h5>
                  <ListGroup as="div" variant="flush">
                    <ShowServices index={i}/>
                    <ListGroup.Item><h3>Total Price: ${this.state.costs[i]}</h3></ListGroup.Item>
                  </ListGroup>
                </Col>
              </Row>
            </Card.Text>
          </Card.Body>
        </Card>);
      }
      return cards;
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
      } else if (this.state.hasAppointments) {
        return <Row className="justify-content-md-center">
          <Col lg={5}>
            <AppointmentList/>
          </Col>
        </Row>
      } else {
        return <Row className="justify-content-center mt-5">
        <Col xs={11} lg={8}>
          <Card className="w-70 h-60 add-shadow">
          <Card.Header as="h4">My Appointments</Card.Header>
            <Card.Body>
              <Card.Text as="div">
                <h5 className="mb-4">Whoops, looks like you need to book an appointment with us first. </h5>
                <Image className="h-100 w-100" src="https://s3.amazonaws.com/thumbnails.thecrimson.com/photos/2018/11/15/001152_1334195.jpg.1500x998_q95_crop-smart_upscale.jpg"/>
              </Card.Text>
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
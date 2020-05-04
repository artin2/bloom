import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Image from 'react-bootstrap/Image'
import Nav from 'react-bootstrap/Nav'
import ListGroup from 'react-bootstrap/ListGroup'
import './WorkerDisplay.css'
import Calendar from '../Calendar/CalendarPage'
import WorkerEditForm from './WorkerEditForm';
import GridLoader from 'react-spinners/GridLoader'
import { css } from '@emotion/core'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const override = css`
  display: block;
  margin: 0 auto;
`;

class WorkerDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      worker: {
        id: 0,
        store_id: 0,
        services: [],
        user_id: 0,
        created_at: "",
        first_name: "",
        last_name: ""
      },
      serviceMapping: {
        0: "Brazilian Blowout",
        1: "Manicure"
      },
      loading: true,
      workerHours: [],
      receivedServices: [],
      selectedOption: [],
      storeHours: [],
      choice: 0,
      daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  }

  convertMinsToHrsMins(mins) {
    let h = Math.floor(mins / 60);
    let m = mins % 60;
    let am = false
    if (h == 24) {
      am = true
      h -= 12
    }
    else if (h < 12) {
      am = true
    } else if (h != 12) {
      h -= 12
    }
    h = h < 10 ? '0' + h : h;
    if (h == 0) {
      h = '12'
    }
    m = m < 10 ? '0' + m : m;
    if (am) {
      return `${h}:${m}am`;
    } else {
      return `${h}:${m}pm`;
    }

  }

  updateWorker = (worker, newHours, services) => {
    let updateHours = this.state.workerHours.map((dayHours, index) =>{
      if(newHours[index] != null) {
        return newHours[index]
      } else {
        return dayHours
      }
    })
    this.setState({
      worker: worker,
      workerHours: updateHours,
      receivedServices: services
    })
  }

  updateContent = (selectedChoice) => {
    this.setState({
      choice: selectedChoice
    })
  };

  componentDidMount() {
    if (this.props.location && this.props.location.state && this.props.location.state.worker) {
      // let convertedServices = this.props.location.state.worker.services.map((service) => ({ value: service, label: this.state.serviceMapping[service] }));
      Promise.all([
        fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + '/workers/' + this.props.match.params.worker_id + '/hours', {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(value => value.json()),
        fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + "/storeHours", {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(value => value.json())
      ]).then(allResponses => {
        let receivedWorkerHours = allResponses[1].map((day) => ({ start_time: day.open_time, end_time: day.close_time }));
        if (allResponses[0] && allResponses[0].length == 7) {
          receivedWorkerHours = allResponses[0]
        } else {
          this.setState({
            newHours: receivedWorkerHours
          })
        }
        this.setState({
          worker: this.props.location.state.worker,
          receivedServices: this.props.location.state.worker.services,
          storeHours: allResponses[1],
          workerHours: receivedWorkerHours,
          loading: false
        })
      })
    }
    else {
      Promise.all([
        fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + '/workers/' + this.props.match.params.worker_id, {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(value => value.json()),
        fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + "/storeHours", {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(value => value.json()),
        fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + '/workers/' + this.props.match.params.worker_id + '/hours', {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(value => value.json())
      ]).then(allResponses => {
        let convertedServices = allResponses[0].services.map((service) => ({ value: service, label: this.state.serviceMapping[service] }));
        let receivedWorkerHours = allResponses[1].map((day) => ({ start_time: day.open_time, end_time: day.close_time }));

        // If worker hours are not complete, we default them to store hours. Worker hours should be complete though.
        if (allResponses[2] && allResponses[2].length == 7) {
          receivedWorkerHours = allResponses[2]
        } else {
          this.setState({
            newHours: receivedWorkerHours
          })
        }
        this.setState({
          worker: allResponses[0],
          receivedServices: allResponses[0].services,
          selectedOption: convertedServices,
          storeHours: allResponses[1],
          workerHours: receivedWorkerHours,
          loading: false
        })
      })
    }
  }

  render() {
    const ListWorkingHours = () => {
      let items = [];
      for (let i = 0; i < this.state.workerHours.length; i++) {
        if (this.state.workerHours[i].start_time != null) {
          items.push(<Col sm="11" md="10" key={i}><ListGroup.Item>{this.state.daysOfWeek[i]}: {this.convertMinsToHrsMins(this.state.workerHours[i].start_time)}-{this.convertMinsToHrsMins(this.state.workerHours[i].end_time)}</ListGroup.Item></Col>);
        }
        else {
          items.push(<Col sm="11" md="10" key={i}><ListGroup.Item>{this.state.daysOfWeek[i]}: Off</ListGroup.Item></Col>);
        }
      }
      return items;
    }

    const RenderProfileContent = () => {
      if(this.state.choice == 0) {
        return <Calendar role={this.state.worker.first_name + "'s"} />
      } else if(this.state.choice == 1) {
        return <WorkerEditForm worker={this.state.worker} receivedServices={this.state.receivedServices} selectedOption={this.state.selectedOption} storeHours={this.state.storeHours} workerHours={this.state.workerHours} updateWorker={this.updateWorker}/>
      } else {
        return <p>Past Appointments go here....</p>
      }
    }

    const DisplayWithLoading = (props) => {
      if (this.state.loading) {
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
      } else {
        {/* CITATION: https://bootsnipp.com/snippets/M48pA */}
        return <Row className="profile">
        <Col xs="11" md="3">
        <div className="profile-sidebar">
            {/* <!-- SIDEBAR USERPIC --> */}
            <div className="profile-userpic">
              <Image src="https://i.redd.it/v0caqchbtn741.jpg" className="img-responsive" alt="" rounded />
            </div>
            {/* <!-- END SIDEBAR USERPIC --> */}

            {/* <!-- SIDEBAR USER TITLE --> */}
            <div className="profile-usertitle">
              <div className="profile-usertitle-name">
                {this.state.worker.first_name + " " + this.state.worker.last_name}
              </div>
              <div className="profile-usertitle-job">
                Stylist
              </div>
            </div>
            {/* <!-- END SIDEBAR USER TITLE --> */}

            {/* <!-- SIDEBAR BUTTONS --> */}
            <div className="profile-userbuttons">
              <button type="button" className="btn btn-success btn-sm">Give a Raise</button>
              <button type="button" className="btn btn-danger btn-sm">Lay Off</button>
            </div>
            {/* <!-- END SIDEBAR BUTTONS --> */}

            {/* WORKING HOURS */}
            <ListGroup variant="flush">
              <Row className="justify-content-center mt-4">
                <h5>Working Hours</h5>
                <ListWorkingHours/>
              </Row>
            </ListGroup>
            {/* END WORKING HOURS */}

            {/* <!-- SIDEBAR MENU --> */}
            <div className="profile-usermenu">
              <Nav defaultActiveKey="link-0" className="flex-column" variant="pills">
                <Nav.Link eventKey="link-0" active={this.state.choice == 0} onClick={() => this.updateContent(0)}>Calendar</Nav.Link>
                <Nav.Link eventKey="link-1" active={this.state.choice == 1}  onClick={() => this.updateContent(1)}>Edit Profile</Nav.Link>
                <Nav.Link eventKey="link-2" active={this.state.choice == 2} onClick={() => this.updateContent(2)}>Past Appointments</Nav.Link>
              </Nav>
            </div>
            {/* <!-- END MENU --> */}

          </div>
        </Col>

        <Col xs="11" md="9">
        <div className="profile-content">
            <RenderProfileContent/>
          </div>
        </Col>

      </Row>
      }
    }
    return (
      <Container fluid>
        {/* <Row className="justify-content-center">
          <Col>
            <h1>{this.state.worker.first_name}</h1>
            <p>{this.state.worker.last_name}</p>
            <ul>
                {this.state.worker.services.map((service, index) => (
                  <li key={"cat-" + index}>{this.state.serviceMapping[service]}</li>
                ))}
              </ul>
          </Col>
        </Row> */}
        <DisplayWithLoading/>

      </Container>
    );
  }
}

export default WorkerDisplay;

import React from 'react';
import {Container, Row, Col} from 'react-bootstrap'
import { connect } from 'react-redux';
import Image from 'react-bootstrap/Image'
import Nav from 'react-bootstrap/Nav'
import ListGroup from 'react-bootstrap/ListGroup'
import './LoginForm.css'
import Calendar from '../Calendar/CalendarPage'
import EditProfileForm from './EditProfileForm';
import GridLoader from 'react-spinners/GridLoader'
import WorkerEditForm from '../Worker/WorkerEditForm';
import { getPictures } from '../s3'
import './Profile.css'
import workerImage from '../../assets/worker.png'
import { convertMinsToHrsMins } from '../helperFunctions'
import { css } from '@emotion/core'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const override = css`
  display: block;
  margin: 0 auto;
`;

class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        id: 0,
        store_id: 0,
        created_at: "",
        first_name: "",
        last_name: "",
        email: "",
        // services: []
      },
      loading: true,
      userHours: [],
      picture: null,
      // receivedServices: [],
      selectedOption: [],
      storeHours: [],
      choice: 0,
      daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
    this.updateWorkerHours = this.updateWorkerHours.bind(this);
    this.updateProfileContent = this.updateProfileContent.bind(this);
  }

  updateUser = (user, newHours, services) => {
    let updateHours = this.state.userHours.map((dayHours, index) =>{
      if(newHours[index] != null) {
        return newHours[index]
      } else {
        return dayHours
      }
    })
    this.setState({
      user: user,
      userHours: updateHours,
      // receivedServices: services
    })
  }

  updateWorkerHours = (newHours) => {
    this.setState({
      userHours: newHours
    })
  }

  updateProfileContent = async (newPicture, newFirst, newLast) => {
    var newUser = Object.assign({}, this.state.user)
    newUser.first_name = newFirst
    newUser.last_name = newLast
    if(newPicture === true) {
      let picturesFetched = []
      try {
        picturesFetched = await getPictures('users/' + this.props.user.id + '/')

        if(picturesFetched.length > 0){
          await this.setState({
            picture: picturesFetched[0],
            user: newUser
          })
        }
      } catch (e) {
        console.log("Error getting pictures from s3!", e)
      }
    } else {
      this.setState({
        user: newUser
      })
    }
  }

  updateContent = (selectedChoice) => {
    this.setState({
      choice: selectedChoice
    })
  };

  async componentDidMount() {
    let picturesFetched = []
    try {
      picturesFetched = await getPictures('users/' + this.props.user.id + '/')

      if(picturesFetched.length > 0){
        await this.setState({
          picture: picturesFetched[0],
        })
      }
    } catch (e) {
      console.log("Error getting pictures from s3!", e)
    }

    let store_id = this.props.user.store_id;
    let worker_id = this.props.user.worker_id;
    if (this.props.user && this.props.user.role === '2' && (this.props.user.store_id && this.props.user.worker_id)) {
      // let convertedServices = this.props.location.state.worker.services.map((service) => ({ value: service, label: this.state.serviceMapping[service] }));
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
        let receivedWorkerHours = allResponses[1].map((day) => ({ start_time: day.open_time, end_time: day.close_time }));
        if (allResponses[0] && allResponses[0].length === 7) {
          receivedWorkerHours = allResponses[0]
        } else {
          this.setState({
            newHours: receivedWorkerHours
          })
        }
        this.setState({
          user: this.props.user,
          // receivedServices: this.props.location.state.worker.services,
          storeHours: allResponses[1],
          userHours: receivedWorkerHours,
          loading: false
        })
      })
    }
    else if(this.props.user.role === '2'  && (this.props.user.store_id && this.props.user.worker_id)) {
      Promise.all([
        fetch(fetchDomain + '/stores/' + store_id + '/workers/' + worker_id, {
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
        }).then(value => value.json()),
        fetch(fetchDomain + '/stores/' + store_id + '/workers/' + worker_id + '/hours', {
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
        if (allResponses[2] && allResponses[2].length === 7) {
          receivedWorkerHours = allResponses[2]
        } else {
          this.setState({
            newHours: receivedWorkerHours
          })
        }
        this.setState({
          user: allResponses[0],
          // receivedServices: allResponses[0].services,
          selectedOption: convertedServices,
          storeHours: allResponses[1],
          userHours: receivedWorkerHours,
          loading: false
        })
      })
    }
    else {
      this.setState({
        loading: false,
        choice: 2
      })
    }
  }

  render() {
    const ListWorkingHours = () => {
      let items = [];
      for (let i = 0; i < this.state.userHours.length; i++) {
        if (this.state.userHours[i].start_time != null) {
          items.push(<Col sm="11" md="10" key={i}><ListGroup.Item className="px-0">{this.state.daysOfWeek[i]}: {convertMinsToHrsMins(this.state.userHours[i].start_time)}-{convertMinsToHrsMins(this.state.userHours[i].end_time)}</ListGroup.Item></Col>);
        }
        else {
          items.push(<Col sm="11" md="10" key={i}><ListGroup.Item className="px-0">{this.state.daysOfWeek[i]}: Off</ListGroup.Item></Col>);
        }
      }
      return items;
    }

    const RenderProfileContent = () => {
      if(this.state.choice === 0) {
        //need to make this dynamic
        return <Calendar role={"my"} store_id={this.props.user.store_id}/>
      } else if(this.state.choice === 1) {
        return <p>Past Appointments go here....</p>
      } else if(this.state.choice === 2) {
        return <EditProfileForm updateProfileContent={this.updateProfileContent} picture={this.state.picture}/>
      } else {
        return <WorkerEditForm updateWorkerHours={this.updateWorkerHours} store_id={this.props.user.store_id} worker_id={this.props.user.worker_id}/>
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
      } else if(this.props.user.role === '2') {
        return <Row className="justify-content-center my-4 mx-1">
        <Col xs="11" lg="3" className="mb-4">
        <div className="profile-sidebar">
            {/* <!-- SIDEBAR USERPIC --> */}
            <div className="profile-userpic">
              <Image className="profile-img" fluid src={this.state.picture && Object.keys(this.state.picture).length !== 0 && this.state.picture.constructor === Object ? this.state.picture.url : workerImage} alt="" rounded />
            </div>
            {/* <!-- END SIDEBAR USERPIC --> */}

            {/* <!-- SIDEBAR USER TITLE --> */}
            <div className="profile-usertitle">
              <div className="profile-usertitle-name">
                {this.state.user.first_name + " " + this.state.user.last_name}
              </div>
              <div className="profile-usertitle-job">
                Stylist
              </div>
            </div>
            {/* <!-- END SIDEBAR USER TITLE --> */}



            {/* WORKING HOURS */}
            <ListGroup variant="flush" className="d-none d-lg-block">
              <Row className="justify-content-center mt-4">
                <Col xs={12}><h5>Working Hours</h5></Col>
                <ListWorkingHours/>
              </Row>
            </ListGroup>
            {/* END WORKING HOURS */}

            {/* <!-- SIDEBAR MENU --> */}
            <div className="profile-usermenu">
              <Nav defaultActiveKey="link-0" className="flex-column" variant="pills">
                <Nav.Link eventKey="link-0" active={this.state.choice === 0} onClick={() => this.updateContent(0)}>Calendar</Nav.Link>
                <Nav.Link eventKey="link-1" active={this.state.choice === 1} onClick={() => this.updateContent(1)}>Past Appointments</Nav.Link>
                <Nav.Link eventKey="link-2" active={this.state.choice === 2}  onClick={() => this.updateContent(2)}>Edit Profile</Nav.Link>
                <Nav.Link eventKey="link-3" active={this.state.choice === 3}  onClick={() => this.updateContent(3)}>Edit Working Hours</Nav.Link>
              </Nav>
            </div>
            {/* <!-- END MENU --> */}

          </div>
        </Col>

        <Col xs="11" lg="9">
        <div className="profile-content">
            <RenderProfileContent/>
          </div>
        </Col>

      </Row>
      }
      else {
        let type = 'Customer'
        if(this.props.user.role === '1'){
          type = 'Salon Owner'
        }
        
        return <Row className="justify-content-center my-5">
        <Col xs="11" lg="3">
        <div className="profile-sidebar mb-5">
            {/* <!-- SIDEBAR USERPIC --> */}
            <div className="profile-userpic">
              <Image className="profile-img" src={this.state.picture != null ? this.state.picture.url : "https://i.redd.it/v0caqchbtn741.jpg"} alt="" rounded />
            </div>
            {/* <!-- END SIDEBAR USERPIC --> */}

            {/* <!-- SIDEBAR USER TITLE --> */}
            <div className="profile-usertitle">
              <div className="profile-usertitle-name">
                {this.props.user.first_name + " " + this.props.user.last_name}
              </div>
              <div className="profile-usertitle-job">
                {type}
              </div>
            </div>
            {/* <!-- END SIDEBAR USER TITLE --> */}

            {/* <!-- SIDEBAR MENU --> */}
            <div className="profile-usermenu">
              <Nav defaultActiveKey="link-0" className="flex-column" variant="pills">
                <Nav.Link eventKey="link-0" active={this.state.choice === 2}  onClick={() => this.updateContent(2)}>Edit Profile</Nav.Link>
              </Nav>
            </div>
            {/* <!-- END MENU --> */}
          </div>
        </Col>

        <Col xs="11" lg="9">
        <div className="profile-content">
            <RenderProfileContent/>
          </div>
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


const mapStateToProps = state => ({
  user: state.userReducer.user
})

export default connect(mapStateToProps)(Profile);

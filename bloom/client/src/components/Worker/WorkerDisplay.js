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
import workerImage from '../../assets/worker.png'
import { getPictures } from '../s3'
import { convertMinsToHrsMins } from '../helperFunctions'
import GridLoader from 'react-spinners/GridLoader'
import { css } from '@emotion/core'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const override = css`
  display: block;
  margin: 0 auto;
`;

class WorkerDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      worker: this.props.worker,
      storeHours: this.props.storeHours,

      loading: true,
      selectedOption: [],
      choice: 0,
      picture: null,
      daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }

    this.updateWorkerHours = this.updateWorkerHours.bind(this);
  }

  updateWorkerHours = (newHours) => {

    this.setState(prevState => ({
    ...prevState, worker: {
        ...prevState.worker,
        workerHours: newHours
        }
      })
    )
  }

  // updateWorker = (worker, newHours) => {
  //   let updateHours = this.state.worker.workerHours.map((dayHours, index) =>{
  //     if(newHours[index] != null) {
  //       return newHours[index]
  //     } else {
  //       return dayHours
  //     }
  //   })
  //   this.setState(prevState => ({
  //   ...prevState, worker: {
  //       ...prevState.worker,
  //       workerHours: updateHours
  //       }
  //     })
  //   )
  // }

  updateContent = (selectedChoice) => {
    this.setState({
      choice: selectedChoice
    })
  };

  componentDidUpdate(prevProps) {

    if (this.props.worker !== prevProps.worker) {

        this.updateWorkerHours(this.props.worker.workerHours)
      }
  }

  async componentDidMount() {


    let choice = 0
    if(this.props.location.state && this.props.location.state.edit) {
      choice = 1
    }
      let picturesFetched = []
      try {
        picturesFetched = await getPictures('users/' + this.props.worker.user_id + '/')

        if(picturesFetched.length > 0){
          await this.setState({
            picture: picturesFetched[0],
          })
        }
        else{
          await this.setState({
            picture: picturesFetched,
          })
        }
      } catch (e) {
        console.log("Error getting pictures from s3!", e)
      }


        this.setState({
          choice: choice,
          loading: false
        })

  }

  render() {
    const ListWorkingHours = () => {
      let items = [];
      for (let i = 0; i < this.state.worker.workerHours.length; i++) {
        if (this.state.worker.workerHours[i].start_time != null) {
          items.push(<Col sm="11" md="10" key={i}><ListGroup.Item>{this.state.daysOfWeek[i]}: {convertMinsToHrsMins(this.state.worker.workerHours[i].start_time)}-{convertMinsToHrsMins(this.state.worker.workerHours[i].end_time)}</ListGroup.Item></Col>);
        }
        else {
          items.push(<Col sm="11" md="10" key={i}><ListGroup.Item>{this.state.daysOfWeek[i]}: Off</ListGroup.Item></Col>);
        }
      }
      return items;
    }

    const RenderProfileContent = () => {
      if(this.state.choice === 0) {
        return <Calendar role={this.state.worker.first_name + "'s"} id={this.state.worker.id} />
      } else if(this.state.choice === 1) {
        return <WorkerEditForm worker={this.state.worker} selectedOption={this.state.selectedOption} storeHours={this.state.storeHours} workerHours={this.state.workerHours} />
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
              color={"#3e4e69"}
              loading={this.state.isLoading}
            />
          </Col>
        </Row>
      } else {
        return <Row className="justify-content-center my-4 pb-5">
        <Col xs="11" md="3" className="mb-4">
        <div className="profile-sidebar">
            {/* <!-- SIDEBAR USERPIC --> */}
            <div className="profile-userpic">
              <Image className="profile-img" src={this.state.picture && Object.keys(this.state.picture).length !== 0 && this.state.picture.constructor === Object ? this.state.picture.url : workerImage} alt="" rounded />
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
            <ListGroup variant="flush" className="d-none d-lg-block">
              <Row className="justify-content-center mt-4">
                <h5>Working Hours</h5>
                <ListWorkingHours/>
              </Row>
            </ListGroup>
            {/* END WORKING HOURS */}

            {/* <!-- SIDEBAR MENU --> */}
            <div className="profile-usermenu">
              <Nav defaultActiveKey="link-0" className="flex-column" variant="pills">
                <Nav.Link eventKey="link-0" active={this.state.choice === 0} onClick={() => this.updateContent(0)}>Calendar</Nav.Link>
                <Nav.Link eventKey="link-1" active={this.state.choice === 1}  onClick={() => this.updateContent(1)}>Edit Profile</Nav.Link>
                <Nav.Link eventKey="link-2" active={this.state.choice === 2} onClick={() => this.updateContent(2)}>Past Appointments</Nav.Link>
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
      <Container fluid className="my-4 pb-5">
        <DisplayWithLoading/>
      </Container>
    );
  }
}



const mapStateToProps = state => ({
  storeHours: state.storeReducer.store.storeHours,
  worker: state.workerReducer.worker
})

export default connect(mapStateToProps, null)(WorkerDisplay);

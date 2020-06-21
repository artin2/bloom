import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button } from 'react-bootstrap';
import './Worker.css'
import { FaEdit } from 'react-icons/fa';
import './WorkerDashboard.css'
import { Image } from 'react-bootstrap';
import ListGroup from 'react-bootstrap/ListGroup'
import UserDashboardLoader from '../Store/UserStoresDashboardLoader';
import workerImage from '../../assets/worker.png'
import { getPictures } from '../s3'
import { convertMinsToHrsMins } from '../helperFunctions'
// import {
//   addAlert
// } from '../../reduxFolder/actions'
// import store from '../../reduxFolder/store';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getWorkers } from './WorkerHelper.js'
import { updateCurrentWorker } from '../../redux/actions/worker'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class WorkerDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workers: [],
      redirectToWorkerEditForm: null,
      redirectToWorkerDisplay: null,
      loading: true,
      daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    }
  }

  triggerWorkerEditForm(workerPassed) {

    this.props.updateCurrentWorker(workerPassed)
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id + '/workers/' + workerPassed.id,
      state: {
        edit: true
      }
    })
  }

  triggerWorkerDisplay(workerPassed) {

    this.props.updateCurrentWorker(workerPassed)
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id + '/workers/' + workerPassed.id,
    })
  }

  triggerAddWorker() {
    this.props.history.push({
      pathname: '/stores/addWorker/' + this.props.match.params.store_id
    })
  }

  componentDidUpdate(prevProps) {

    if (this.props.workers !== prevProps.workers && this.props.workers) {
      console.log("update call")
      this.fetchPictures(this.props.workers)
    }

  }

  async componentDidMount() {
    if (!this.props.workers || this.props.workers.length == 0 || (this.props.workers.length > 0 && this.props.workers[0].store_id != this.props.match.params.store_id)) {
      this.props.getWorkers(this.props.match.params.store_id)
    } else {
      this.fetchPictures(this.props.workers)
    }
  }

  async fetchPictures(workers) {

    for (let i = 0; i < workers.length; i++) {
      let picturesFetched = {}
      try {
        picturesFetched = await getPictures('users/' + workers[i].user_id + '/')
        if (picturesFetched.length > 0) {
          picturesFetched = picturesFetched[0]
        }
        else {
          picturesFetched = {}
        }
      } catch (e) {
        console.log("Error getting pictures from s3!", e)
      }

      // let stateCopy = Object.assign({}, this.state);
      workers[i].picture = picturesFetched
      this.setState({ workers: workers })

    }
    this.setState({ loading: false })

  }

  render() {
    const ListWorkingHours = (props) => {

      if (props.workerHours) {
        let items = [];
        for (let i = 0; i < props.workerHours.length; i++) {
          if (props.workerHours[i].start_time != null) {
            items.push(<Col sm="11" md="10" key={i} style={{ backgroundColor: "#bdcddb" }}><ListGroup.Item className={"py-1"} style={{ backgroundColor: "#bdcddb" }}>{this.state.daysOfWeek[i]}: {convertMinsToHrsMins(props.workerHours[i].start_time)}-{convertMinsToHrsMins(props.workerHours[i].end_time)}</ListGroup.Item></Col>);
          }
          else {
            items.push(<Col sm="11" md="10" key={i} style={{ backgroundColor: "#bdcddb" }}><ListGroup.Item className={"py-1"} style={{ backgroundColor: "#bdcddb" }}>{this.state.daysOfWeek[i]}: Off</ListGroup.Item></Col>);
          }
        }
        return items;
      }
      return null
    }

    const DisplayWithLoading = (props) => {

      if (this.state.loading) {
        return <Row className="mt-5">
          <Col xs="12">
            <UserDashboardLoader />
          </Col>
        </Row>
      } else {
        if (this.state.workers.length === 0) {
          return (
            <div>
              <p className="noResults">No Workers!</p>
              <Button className="update-button" onClick={() => this.triggerAddWorker()}>Add Worker</Button>
            </div>
          )
        }
        else {
          // console.log(this.props.workers)

          return (
            <div>
              <p className="workers_title">My Workers </p>
              <Button className="update-button" onClick={() => this.triggerAddWorker()}>Add Worker</Button>
              <>{this.state.workers.map((worker, index) => (
                <div key={"worker" + index}>
                  <Row className="justify-content-center align-content-center my-5">
                    <Col md={4} className="vertical-align-contents">
                      {/* <Carousel className="dashboard-carousel" interval="">
                        <Carousel.Item key={"pic-" + index}> */}
                      <Image className="dashboard-carousel" fluid src={worker.picture && Object.keys(worker.picture).length !== 0 && worker.picture.constructor === Object ? worker.picture.url : workerImage} alt={"alt-" + index} />
                      {/* </Carousel.Item>
                      </Carousel> */}
                    </Col>
                    <Col md={4}>
                      <Row className={"justify-content-center"}>
                        <Col sm={12}>
                          <span className={"workerName"} onClick={() => this.triggerWorkerDisplay(worker)} style={{ cursor: 'pointer' }}> {worker.first_name + " " + worker.last_name} </span>
                          <FaEdit className="edit mb-3 hvr-forward" size={25} onClick={() => this.triggerWorkerEditForm(worker)} />
                        </Col>
                      </Row>
                      <Row className={"justify-content-center"}>
                        <ListGroup variant="flush">
                          <Row className="justify-content-center mt-4">
                            <h5>Working Hours</h5>
                            <ListWorkingHours workerHours={worker.workerHours} />
                          </Row>
                        </ListGroup>
                      </Row>
                    </Col>
                  </Row>
                </div>
              ))}</>
            </div>
          )
        }
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
  updateCurrentWorker: (worker) => updateCurrentWorker(worker),
  getWorkers: (store_id) => getWorkers(store_id)
}, dispatch)

const mapStateToProps = state => ({
  workers: state.workerReducer.workers,
  // loading: state.workerReducer.isFetching,
})

export default connect(mapStateToProps, mapDispatchToProps)(WorkerDashboard);

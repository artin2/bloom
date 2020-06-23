import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button, Image } from 'react-bootstrap';
// import SearchCard from '../Search/SearchCard';
import Carousel from 'react-bootstrap/Carousel'
import { FaEdit } from 'react-icons/fa';
import './UserStoresDashboard.css'
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getStores, getStore, getStoreHours } from './StoreHelper.js'
import { updateCurrentStore } from '../../redux/actions/stores'
import UserStoresDashboardLoader from './UserStoresDashboardLoader';
import {getPictures, defaultStorePictures } from '../s3'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// ***** NOTE: fix to properly display all the stores

class UserStoresDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      stores: this.props.stores,
      loading: true
    }
  }

  triggerStoreEdit(store) {

    this.props.updateCurrentStore(store)

    this.props.history.push({
      pathname: '/stores/edit/' + store.id,
    })
  }

  triggerShowWorkers(store) {
    // console.log("about to show worker")
    this.props.updateCurrentStore(store)
    this.props.getStoreHours(store.id)
    // console.log("store is: ", store)
    // console.log("store updated")
    this.props.history.push({
      pathname: '/stores/' + store.id + '/workers'
    })
  }

  triggerStoreShow(store) {
    // console.log("triggering store show")
    this.props.updateCurrentStore(store)

    // console.log("store is; ", store.id)

    this.props.history.push({
      pathname: '/stores/' + store.id,
    })
  }

  triggerShowServices(id) {
    this.props.history.push({
      pathname: '/stores/' + id + '/services'
    })
  }

  triggerShowCalendar(store) {

    this.props.getStore(store.id)

    this.props.history.push({
      pathname: '/storeCalendar/' + store.id,
    })
  }

  componentDidMount() {

    // if(!this.props.stores) {
      this.props.getStores(this.props.match.params.user_id)
    // }
    // else {
      this.fetchPictures(this.props.stores)
    // }

  }

  componentDidUpdate(prevProps) {

    if(this.props.stores != prevProps.stores) {
      this.fetchPictures(this.props.stores)
    }
  }

  async fetchPictures(stores) {


    //why is this only returning default
    let appendedStores = await Promise.all(stores.map(async (store): Promise<Object> => {
      let newstore = Object.assign({}, store);
      try {
        let pictures = defaultStorePictures()

        newstore.pictures = pictures;
        return newstore;
      } catch (error) {
        newstore.pictures = defaultStorePictures();
        return newstore
      }
    }));

    await this.setState({
      stores: appendedStores,
      loading: false
    })

  }

  render() {
    const DisplayWithLoading = (props) => {
      if (this.state.loading) {
        return <Row className="mt-5">
            <Col xs="12">
              <UserStoresDashboardLoader/>
            </Col>
          </Row>
      } else {
        return(
          <>{this.state.stores.map((store, index) => (
            <div key={"store" + index}>
              <Row className="justify-content-center align-content-center my-5">
                <Col md={6} xl={5} className="vertical-align-contents">
                  <Carousel className="dashboard-carousel" interval="">
                    {store.pictures.map((picture, index) => (
                      <Carousel.Item key={"pic-" + index}>
                        <Image fluid style={{height: '100%', width: '100%'}}src={picture.url} alt={"alt-" + index}/>
                        {/* <img style={this.props.img} src={picture.url} alt={"Slide " + index} /> */}
                      </Carousel.Item>
                    ))}
                  </Carousel>
                </Col>
                <Col md={5} className="vertical-align-contents">
                  <Row className={"justify-content-center"}>
                    <Col sm={12}>
                      <span className="name" onClick={() => this.triggerStoreShow(store)} style={{cursor: 'pointer'}}> {store.name} </span>
                      <FaEdit className="edit hvr-float mb-3" size={25} onClick={() => this.triggerStoreEdit(store)}/>
                    </Col>
                    <Col sm={12}>
                      <p className="address">{store.address} </p>
                    </Col>
                    <Col sm={8} className={"py-1"}>
                      <Button block className="update-button"  onClick={() =>  this.triggerShowCalendar(store)}>Calendar</Button>
                    </Col>
                    <Col sm={8} className={"py-2"}>
                      <Button block className="update-button" onClick={() =>  this.triggerShowWorkers(store)}>Workers</Button>
                    </Col>
                    <Col sm={8} className={"py-1"}>
                      <Button block className="update-button" onClick={() =>  this.triggerShowServices(store.id)}>Services</Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
          ))}</>
        )
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
  stores: state.storeReducer.stores,
})

const mapDispatchToProps = dispatch => bindActionCreators({
  getStores: (user_id) => getStores(user_id),
  getStore: (store_id) => getStore(store_id),
  updateCurrentStore: (store) => updateCurrentStore(store),
  getStoreHours: (store_id) => getStoreHours(store_id)
}, dispatch)


export default connect(mapStateToProps, mapDispatchToProps)(UserStoresDashboard);

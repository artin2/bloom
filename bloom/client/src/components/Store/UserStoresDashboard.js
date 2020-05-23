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
} from '../../reduxFolder/actions/alert'
import store from '../../reduxFolder/store';
import { connect } from 'react-redux';
// import { bindActionCreators } from 'redux';
// import {addStore} from '../../reduxFolder/actions/stores.js'
import UserStoresDashboardLoader from './UserStoresDashboardLoader';
import { /*getPictures,*/ defaultStorePictures } from '../../util/s3'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

// ***** NOTE: fix to properly display all the stores

class UserStoresDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      stores: [
        {
          id: "",
          name: "",
          address: "",
          created_at: "",
          category: [],
          services: [],
          workers: [],
          owners: [],
          phone: "",
          clients: [],
          description: "",
          lat: "",
          lng: ""
        }
      ],
      redirectToWorkerForm: null,
      store_id: null,
      loading: true
    }
  }

  triggerStoreEdit(passedStore) {
    this.props.history.push({
      pathname: '/stores/edit/' + passedStore.id,
      state: {
        store: passedStore
      }
    })
  }

  triggerAddWorker(id) {
    this.props.history.push({
      pathname: '/stores/addWorker/' + id
    })
  }

  triggerShowWorkers(id) {
    this.props.history.push({
      pathname: '/stores/' + id + '/workers'
    })
  }

  triggerStoreShow(passedStore) {
    this.props.history.push({
      pathname: '/stores/' + passedStore.id,
      state: {
        store: passedStore
      }
    })
  }

  triggerShowServices(id) {
    this.props.history.push({
      pathname: '/stores/' + id + '/services'
    })
  }

  triggerAddService(id) {
    this.props.history.push({
      pathname: '/stores/addService/' + id,
    })
  }

  triggerShowCalendar(store) {
    this.props.history.push({
      pathname: '/storeCalendar/' + store.id,
      state: {
        store: store
      }
    })
  }

  componentDidMount() {
    fetch(fetchDomain + '/stores/users/' + this.props.match.params.user_id , {
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
    .then(async data => {
      if(data){
        // let convertedCategory = data.category.map((str) => ({ value: str.toLowerCase(), label: str }));

        var appendedStores = await Promise.all(data.map(async (store): Promise<Object> => {
          var newstore = Object.assign({}, store);
          try {
            let pictures = defaultStorePictures()
            // let pictures = await getPictures('stores/' + store.id + '/images/')

            // // once all data is clean and picture requirement is enforced we can remove this
            // if(pictures.length === 0){
            //   pictures = defaultStorePictures()
            // }

            // we can set pictures to defaultStorePictures to prevent s3 calls

            newstore.pictures = pictures;
            return newstore;
          } catch (error) {
            newstore.pictures = defaultStorePictures();
            return newstore
          }
        }));

        this.setState({
          stores: appendedStores,
          loading: false
        })
      }
      // this.props.addStore(data);
    });
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
                      <FaEdit className="edit mb-3" size={25} onClick={() => this.triggerStoreEdit(store)}/>
                    </Col>
                    <Col sm={12}>
                      <p className="address">{store.address} </p>
                    </Col>
                    <Col sm={8} className={"py-1"}>
                      <Button block className="update_button"  onClick={() =>  this.triggerShowCalendar(store)}>Calendar</Button> &nbsp;
                    </Col>
                    <Col sm={8} className={"py-1"}>
                      <Button block className="update_button" onClick={() =>  this.triggerShowWorkers(store.id)}>Workers</Button> &nbsp;
                    </Col>
                    <Col sm={8} className={"py-1"}>
                      <Button block className="update_button" onClick={() =>  this.triggerShowServices(store.id)}>Services</Button> &nbsp;
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
  // stores: state.storeReducer.stores,
  user: state.userReducer.user
})

// const mapDispatchToProps = dispatch => bindActionCreators({
//   addStore: (store) => addStore(store),
// }, dispatch)


export default connect(mapStateToProps/*, mapDispatchToProps*/)(UserStoresDashboard);

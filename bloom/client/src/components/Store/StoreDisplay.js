import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Carousel, Image  } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { withRouter } from "react-router-dom";
import {
  addAlert
} from '../../redux/actions/alert'
import store from '../../redux/store';
import './StoreDisplay.css'
import { getPictures, defaultStorePictures } from '../s3'
import {ListGroup} from 'react-bootstrap'
import { FaEdit } from 'react-icons/fa';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getStore } from './StoreHelper.js'
import { convertMinsToHrsMins } from '../helperFunctions'

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class StoreDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      store: this.props.store,
      daysOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      loading: true
    }
  }

  triggerStoreEdit() {
    this.props.history.push({
      pathname: '/stores/edit/' + this.props.match.params.store_id,
      state: this.state
    })
  }

  triggerBook() {
    this.props.history.push({
      pathname: '/book/' + this.props.match.params.store_id,
      state: this.state
    })
  }

  async fetchPictures(store) {

    let pictures
    try {
      pictures = await getPictures('stores/' + this.props.match.params.store_id + '/images/')
      if(pictures.length === 0){
        pictures = defaultStorePictures()
      }
    } catch (e) {
      pictures = defaultStorePictures()
      console.log("Error! Could not get store images", e)
    }

    store.pictures = pictures
    this.setState({ store: store, loading: false })
  }

  componentDidUpdate(prevProps) {

    if(this.props.store !== prevProps.store) {
      this.fetchPictures(this.props.store)
    }

  }


  componentDidMount() {
    // if we were passed the store data from calling component

    // console.log(this.props.match.params.store_id)
    // if (!this.props.store) {
      this.props.getStore(this.props.match.params.store_id)
    // }

    // else {
      this.fetchPictures(this.props.store)
    // }

  }

  render() {
    let editButton;
    if(Cookies.get('user') && this.state.store.owners.indexOf(JSON.parse(Cookies.get('user').substring(2)).id) > -1){
      editButton = <FaEdit className="edit mb-3" style={{marginTop: "40px"}} size={25} onClick={() => this.triggerStoreEdit()}/>
    }

    const ListWorkingHours = (props) => {
      if(props.storeHours){
        let items = [];
        for (let i = 0; i < props.storeHours.length; i++) {
          if (props.storeHours[i].open_time != null) {
            items.push(<Col sm="11" md="10" key={i} style={{backgroundColor: "#bdcddb"}}><ListGroup.Item className={"py-2"} style={{backgroundColor: "#bdcddb"}}>{this.state.daysOfWeek[i]}: {convertMinsToHrsMins(props.storeHours[i].open_time)}-{convertMinsToHrsMins(props.storeHours[i].close_time)}</ListGroup.Item></Col>);
          }
          else {
            items.push(<Col sm="11" md="10" key={i} style={{backgroundColor: "#bdcddb"}}><ListGroup.Item className={"py-2"} style={{backgroundColor: "#bdcddb"}}>{this.state.daysOfWeek[i]}: Off</ListGroup.Item></Col>);
          }
        }
        return items;
      }
      return null
    }

    if(!this.state.loading) {
      return (
      <Container fluid>
        <Row className="justify-content-md-center" style={{ marginTop: '20px', marginBottom: '15px'}}>

          <Col md={6} className="vertical-align-contents px-0 h-100 w-100">

            <Carousel interval="">
              {this.state.store.pictures.map((picture, index) => (
                // style={{maxWidth: '100%', maxHeight: '100%'}}
                <Carousel.Item key={"pic-" + index}>
                  <Image style={{maxWidth: '200%', maxHeight: '100%'}} src={picture.url} alt={"Slide " + index} />
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>

          <Col md={5}>
            <Row className={"justify-content-center"}>
              <p className="name">{this.state.store.name}</p>
              {editButton}
            </Row>
            <Row>
              <p className="address">{this.state.store.address}</p>
              <hr/>
            </Row>
            <Row className={"justify-content-center"}>
              <h5>Store Hours</h5>
              <ListGroup variant="flush" style={{marginTop: "-30px"}}>
                <Row className="justify-content-center mt-4">
                  <ListWorkingHours storeHours={this.state.store.storeHours}/>
                </Row>
              </ListGroup>
            </Row>
          </Col>
        </Row>
        <Row style={{marginTop: "20px", marginLeft: "25px"}}>
          <Col md={6}>
            <p className="address-large">{this.state.store.description}</p>
          </Col>
        </Row>
      </Container>
    )}
    else {
      return null
    }
  }
}


const mapStateToProps = state => ({
  store: state.storeReducer.store,
})

const mapDispatchToProps = dispatch => bindActionCreators({
  getStore: (store_id) => getStore(store_id),
}, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(StoreDisplay));

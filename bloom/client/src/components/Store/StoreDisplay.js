import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import LargeCarousel from '../LargeCarousel';
import { Button, Carousel, Image  } from 'react-bootstrap';
import Cookies from 'js-cookie';
import { withRouter } from "react-router-dom";
import {
  addAlert
} from '../../reduxFolder/actions/alert'
import store from '../../reduxFolder/store';
import './StoreDisplay.css'
import { getPictures } from '../s3'
import {ListGroup} from 'react-bootstrap'
import { FaEdit } from 'react-icons/fa';

const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class StoreDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      store: {
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
        pictures: [],
        description: "",
        lat: "",
        lng: ""
      },
      pictures: [],
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

  async componentDidMount() {
    // if we were passed the store data from calling component
    let pictures = await getPictures('stores/' + this.props.match.params.store_id + '/images/')
    if(pictures.length == 0){
      pictures = [
        {
          url: "/hair.jpg",
          key: "/hair.jpg"
        },
        {
          url: "/nails.jpg",
          key: "/nails.jpg"
        },
        {
          url: "/salon.jpg",
          key: "/salon.jpg"
        }
      ]
    }

    if(this.props.location.state && this.props.location.state.storeHours){
      this.setState({
        storeHours: this.props.location.state.storeHours,
      })
    }
    else{
      fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + '/storeHours', {
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
      .then(data => {
        if(data){
          this.setState({
            storeHours: data,
          })
        }
      });
    }

    if(this.props.location.state && this.props.location.state.store){
      let convertedCategory = this.props.location.state.store.category.map((str) => ({ value: str.toLowerCase(), label: str }));
      let appendedStore = this.props.location.state.store
      appendedStore.pictures = pictures

      this.setState({
        store: appendedStore,
        selectedOption: convertedCategory
      })
    }
    else{
      // retrieve the store data from the database
      fetch(fetchDomain + '/stores/' + this.props.match.params.store_id , {
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
      .then(data => {
        if(data){
          let convertedCategory = data.category.map((str) => ({ value: str.toLowerCase(), label: str }));
          data.pictures = pictures

          this.setState({
            store: data,
            selectedOption: convertedCategory
          })
        }
      });
    }
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
            items.push(<Col sm="11" md="10" key={i} style={{backgroundColor: "#bdcddb"}}><ListGroup.Item className={"py-1"} style={{backgroundColor: "#bdcddb"}}>{this.state.daysOfWeek[i]}: {this.convertMinsToHrsMins(props.storeHours[i].open_time)}-{this.convertMinsToHrsMins(props.storeHours[i].close_time)}</ListGroup.Item></Col>);
          }
          else {
            items.push(<Col sm="11" md="10" key={i} style={{backgroundColor: "#bdcddb"}}><ListGroup.Item className={"py-1"} style={{backgroundColor: "#bdcddb"}}>{this.state.daysOfWeek[i]}: Off</ListGroup.Item></Col>);
          }
        }
        return items;
      }
      return null
    }

    return (
      <Container fluid>
        <Row className="justify-content-md-center" style={{ marginTop: '15px', marginBottom: '15px'}}>
          <Col md={6} className="vertical-align-contents px-0 h-100 w-100">
            <Carousel interval="">
              {this.state.store.pictures.map((picture, index) => (
                <Carousel.Item key={"pic-" + index}>
                  <Image fluid src={picture.url} alt={"Slide " + index} />
                </Carousel.Item>
              ))}
            </Carousel>
          </Col>

          <Col md={5}>
            <Row className={"justify-content-center"}>
              <p className="name">{this.state.store.name}</p>
              {editButton}
            </Row>
            <p className="address">{this.state.store.address}</p>
            <hr/>
            <ListGroup variant="flush" style={{marginTop: "-30px"}}>
              <Row className="justify-content-center mt-4">
                <h5>Store Hours</h5>
                <ListWorkingHours storeHours={this.state.storeHours}/>
              </Row>
            </ListGroup>
          </Col>
        </Row>
        <Row style={{marginTop: "20px", marginLeft: "25px"}}>
          <Col md={6}>
            <p className="address-large">{this.state.store.description}</p>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withRouter(StoreDisplay);
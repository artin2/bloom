import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Cookies from 'js-cookie';
import { FaEdit, FaHourglassHalf, FaDollarSign } from 'react-icons/fa';
import {Carousel, Image } from 'react-bootstrap'
import { getPictures, defaultServicePictures } from '../s3'
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class ServiceDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      service: this.props.service,
      loading: true,
      pictures: [],
      store: {owners:[]}
    }
  }

  async componentDidMount(): Promise<void> {
    // retrieve the pictures from s3
    let picturesFetched
    try {
      picturesFetched = await getPictures('stores/' + this.props.match.params.store_id + '/services/' + this.props.match.params.service_id + '/')
      if(picturesFetched.length === 0){
        picturesFetched = defaultServicePictures()
      }
    } catch (e) {
      console.log("Error geting service images!", e)
      picturesFetched = defaultServicePictures()
    }

    if(picturesFetched.length === 0){
      picturesFetched = defaultServicePictures()
    }

    // can put/putting this for now so we don't have to interact with s3
    // let picturesFetched = defaultServicePictures()

    // retrieve the service, either passed or fetching directly from db
    if(this.props.service){
      this.setState({
        // service: this.props.location.state.service,
        pictures: picturesFetched,
      })
    }


    // get the store so we can check if the current user is an owner
    let storeResponse = await fetch(fetchDomain + '/stores/' + this.props.match.params.store_id, {
      method: "GET",
      headers: {
          'Content-type': 'application/json'
      },
      credentials: 'include'
    })
    const storeFetched = await storeResponse.json()

    this.setState({
      store: storeFetched,
      loading: false
    })

    return Promise.resolve()
  }

  triggerServiceEdit() {
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id + "/services/" + this.props.match.params.service_id + '/edit',
      state: {
        service: this.state.service
      }
    })
  }

  render() {
    let editButton;
    if(Cookies.get('user') && this.state.store.owners.indexOf(JSON.parse(Cookies.get('user').substring(2)).id) > -1){
      editButton = <FaEdit className="edit mb-3" style={{marginTop: "40px"}} size={25} onClick={() => this.triggerServiceEdit()}/>
    }

    // display loading screen while the page is loading
    if(this.state.loading){
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
    }
    else{
      // display the page once finished loading
      return (
        <Container fluid>
          <Row className="justify-content-center">
            <Col md={6} className="vertical-align-contents px-0 h-100 w-100">
              <Carousel interval="">
                {this.state.pictures.map((picture, index) => (
                  <Carousel.Item key={"pic-" + index}>
                    <Image fluid src={picture.url} alt={"Slide " + index} />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
            <Col md={5}>
              <Row className={"justify-content-center"}>
                <p className="name">{this.state.service.name}</p>
                {editButton}
              </Row>
              <Row className={"justify-content-center"} style={{marginTop: "75px"}}>
                <p className="address-large">{this.state.service.description}</p>
              </Row>
              <Row className={"justify-content-center"}>
                <Col md={1}>
                  <FaDollarSign/>
                </Col>
                <Col md={1}>
                  <p className={"address-small"}>{this.state.service.cost}</p>
                </Col>
              </Row>
              <Row className={"justify-content-center"}>
                <Col md={1}>
                  <FaHourglassHalf/>
                </Col>
                <Col md={1}>
                  <p className={"address-small"}>{this.state.service.duration}</p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
      );
    }
  }
}


const mapStateToProps = state => ({
  service: state.serviceReducer.service,

})

export default connect(mapStateToProps, null)(ServiceDisplay);

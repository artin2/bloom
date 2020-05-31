import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { Button, Carousel, Image } from 'react-bootstrap';
import './Services.css';
import { /*getPictures,*/ defaultServicePictures } from '../s3'
import { FaEdit } from 'react-icons/fa';
import LinesEllipsis from 'react-lines-ellipsis'
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getServices } from './ServiceHelper.js'
import { updateCurrentService } from '../../redux/actions/service.js'
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const colors = ['#d2d4cf', '#d2d4cf', '#d2d4cf'];

// component for managing all the services of a store
class ServiceDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      loading: true,
      services: []
    }
  }

  // trigger functions are for redirecting to a different page
  triggerServiceEdit(servicePassed) {

    this.props.updateCurrentService(servicePassed)
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id + "/services/" + servicePassed.id + '/edit',
    })
  }

  triggerServiceDisplay(servicePassed) {

    this.props.updateCurrentService(servicePassed)
    this.props.history.push({
      pathname: '/stores/' + this.props.match.params.store_id + "/services/" + servicePassed.id,
    })
  }

  triggerAddService() {
    this.props.history.push({
      pathname: '/stores/addService/' + this.props.match.params.store_id
    })
  }

  async fetchPictures(services) {

    // if there are services, retrieve the pictures of the services
    if(services.length > 0){
      var appendedServices = await Promise.all(services.map(async (service): Promise<Object> => {
        var newService = Object.assign({}, service);
        try {
          // // fetch the pictures from s3
          // let picturesFetched = await getPictures('stores/' + service.store_id + '/services/' + service.id + '/')

          // // if the service doesn't have any pictures, give it default service pictures
          // if(picturesFetched.length === 0){
          //   picturesFetched = defaultServicePictures()
          // }

          // can put/putting this for now so we don't have to interact with s3
          let picturesFetched = defaultServicePictures()

          newService.pictures = picturesFetched;
          return newService;
        } catch (e) {
          console.log("Error getting service pictures!", e)
          newService.pictures = defaultServicePictures();
          return newService
        }
      }));

      this.setState({
        services: appendedServices,
      })
    }
  }

  async componentDidMount() {
    // retrieve the services, either passed or fetching directly from db

    if(!this.props.services){
      this.props.getService(this.props.match.params.store_id)
    }
    else {
      this.fetchPictures(this.props.services)
    }

    this.setState({
      loading: false
    })
  }

  async componentDidUpdate(prevProps, prevState)  {

    if (prevProps.services !== this.props.services) {
      this.fetchPictures(this.props.services)
    }
  }

  render() {
    let services = null;

    // display either no services or service dashboard
    if(this.state.services.length > 0){
      services = <Col>
                    <p className="services_title">My Services </p>
                    <Button className="buttons" style={{backgroundColor: "#3E4E69", color: 'white'}} onClick={() => this.triggerAddService()}>Add Service</Button>
                    {/* <Button className="buttons" onClick={() => this.triggerServiceEditForm()}>Edit Services</Button> */}
                    <div className="service_container">
                      {this.state.services.map((service, indx) => (
                        <div key={"service-" + service.id}>
                          <Row>
                              <Col className="px-0 h-50 w-50" xs={12} lg={6}>
                                <Carousel interval="">
                                  {service.pictures.map((picture, index) => (
                                    <Carousel.Item key={"pic-" + index} style={{height: '20%'}}>
                                      <Image fluid src={picture.url} alt={"Slide " + index} />
                                    </Carousel.Item>
                                  ))}
                                </Carousel>
                              </Col>
                              <Col className="service_text" xs={12} lg={6} style={{backgroundColor: `${colors[indx % 3]}`, height: '555px'}}>
                                <div className="fun_style"> </div>
                                <Col>
                                  <div className="title_container" style={{backgroundColor: `${colors[indx % 3]}`}}>
                                    <span className="service_title" onClick={() => this.triggerServiceDisplay(service)}> {service.name} </span>
                                    <FaEdit className="edit" size={15} onClick={() => this.triggerServiceEdit(service)}/>
                                  </div>
                                  <Row>
                                    <div className="service_subtitle">
                                      <p> Category </p>
                                      <p> Cost </p>
                                      <p> Duration </p>
                                      <p> Associated Workers </p>
                                      <p> Description </p>
                                    </div>
                                    <div className="subtitle_values" >
                                      <p>  {service.category}  </p>
                                      <p> $ {service.cost}  </p>
                                      <p>  {service.duration} Minutes  </p>
                                      <p> {service.workers} </p>
                                      <LinesEllipsis
                                        text={service.description}
                                        maxLine='6'
                                        ellipsis={service.description.length > 55 ? service.description.substring(0, 55) + " ..." : service.description.substring(0) + " ..."}
                                        trimRight
                                        basedOn='words'
                                      />
                                    </div>
                                  </Row>
                                </Col>
                              </Col>
                            </Row>
                          </div>
                      ))}
                    </div>
                  </Col>
    }
    else{
      services = <div>
                  <p className="noResults">No Services!</p>
                  <Button style={{backgroundColor: "#3E4E69", color: 'white'}} onClick={() => this.triggerAddService()}>Add Service</Button>
                </div>
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
        <Container>
          {services}
        </Container>
      );
    }
  }
}


const mapDispatchToProps = dispatch => bindActionCreators({
  getServices: (store_id) => getServices(store_id),
  updateCurrentService: (service) => updateCurrentService(service),
}, dispatch)

const mapStateToProps = state => ({
  services: state.serviceReducer.services,
})


export default connect(mapStateToProps, mapDispatchToProps)(ServiceDashboard);

import React from 'react';
import Container from 'react-bootstrap/Container'
import { Row, Col, ListGroup, Button, Carousel, Image } from 'react-bootstrap';
import './Services.css';
import { getPictures, defaultServicePictures } from '../s3'
import { FaEdit } from 'react-icons/fa';
import LinesEllipsis from 'react-lines-ellipsis'
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getServices } from './ServiceHelper.js'
import { updateCurrentService } from '../../redux/actions/service.js'
import { FaPlusCircle } from 'react-icons/fa';
// import 'hover.css'
const override = css`
  display: block;
  margin: 0 auto;
`;
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const colors = ['#d2d4cf', '#d2d4cf', '#d2d4cf'];

let observer

// component for managing all the services of a store
class ServiceDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      categories: [],
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

  onScroll() {
    // console.log("adding listener")
    observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            if (entry.intersectionRatio > 0) {
              // console.log("here")
              let found = document.querySelector(`a[href="#${id}"]`)
              if (found) {
                found.classList.add('active');
              }
                // .parentElement.classList.add('active');
            } else {
              // console.log("there")
              let found = document.querySelector(`a[href="#${id}"]`)
              if (found) {
                found.classList.remove('active');
              }
                // document.querySelector(`nav li a[href="#${id}"]`).parentElement.classList.remove('active');
            }
        });
    });

    // Track all sections that have an `id` applied
    document.querySelectorAll('.categoryy').forEach((section) => {
        // console.log("section is: ", section)
        observer.observe(section);
    });

    // console.log(observer)
    window.removeEventListener("click", this.onScroll, true);
  }

  async fetchPictures(services) {
    // console.log("about to fetch photographs")

    // if there are services, retrieve the pictures of the services
    let appendedServices = []
    let categorySet = new Set()
    if(services.length > 0){
      appendedServices = await Promise.all(services.map(async (service): Promise<Object> => {
        var newService = Object.assign({}, service);
        categorySet.add(service.category)
        try {
          // fetch the pictures from s3
          let picturesFetched = await getPictures('stores/' + service.store_id + '/services/' + service.id + '/')

          // if the service doesn't have any pictures, give it default service pictures
          if(picturesFetched.length === 0){
            picturesFetched = defaultServicePictures()
          }

          // can put/putting this for now so we don't have to interact with s3
          // let picturesFetched = defaultServicePictures()

          newService.pictures = picturesFetched;
          return newService;
        } catch (e) {
          console.log("Error getting service pictures!", e)
          newService.pictures = defaultServicePictures();
          return newService
        }
      }));
    }
    // console.log("about to set state")
    // console.log(Array.from(categorySet))
    this.setState({
      services: appendedServices,
      categories: Array.from(categorySet),
      loading: false
    })
  }

  async componentDidMount() {
    // retrieve the services, either passed or fetching directly from db
    // console.log("mounting...")
    window.addEventListener('scroll', this.onScroll, true);

    if(!this.props.services || this.props.services.length == 0 || (this.props.services.length > 0 && this.props.services[0].store_id != this.props.match.params.store_id)){
      // console.log("no services")
      await this.props.getServices(this.props.match.params.store_id)
    }
    else {
      // console.log("serviees are: ", this.props.services)
      await this.fetchPictures(this.props.services)

      // console.log("got photos")
    }

  }

  async componentDidUpdate(prevProps, prevState)  {
    // console.log("state update?")
    if (prevProps.services !== this.props.services) {
      this.fetchPictures(this.props.services)
    }
  }

  async componentWillUnmount() {
    // console.log("trying to remove")
    // console.log(this.observer)
    window.removeEventListener("click", this.onScroll, true);
    // this.observer.disconnect()
    // console.log("removed")
  }

  render() {
    let services = null;
    function AddCategories(props) {
      // console.log("props is: ", props)
        const categoriesList = props.categories.map((category) => {
          return <ListGroup.Item className="p-3 list-categories" action id={category} key={category} href={'#' + category}>
            {category}
          </ListGroup.Item>
        });
        return categoriesList
    }

    const CategorizedServices = (props) => {
      if (this.state.services) {
        const categories = this.state.categories.map((category) => {
          return <div className="categoryy" id={category} key={category}>
            {/* <h1 className="py-2 mb-0" style={{ backgroundColor: '#bdcddb' }}>{category}</h1> */}
            {
              this.state.services.map((service, indx) => {
                if (service.category == category) {
                  return <div key={"service-" + service.id}>
                    <Row>
                      {/* <Col className="px-0 h-50 w-50" xs={12} lg={5}>
                          <Carousel interval="">
                            {service.pictures.map((picture, index) => (
                              <Carousel.Item key={"pic-" + index} style={{ height: '20%' }}>
                                <Image fluid src={picture.url} alt={"Slide " + index} />
                              </Carousel.Item>
                            ))}
                          </Carousel>
                        </Col> */}
                      <Col className="service_text pb-4 px-lg-5" xs={12}>
                        <div className="fun_style"> </div>
                        <Col>
                          <div className="title_container mt-4" style={{ backgroundColor: 'rgb(240,240,240)' }}>
                            <span className="service_title" id={service.name} onClick={() => this.triggerServiceDisplay(service)}> {service.name} </span>
                            <FaEdit className="edit hvr-forward mb-1" size={20} onClick={() => this.triggerServiceEdit(service)} />
                          </div>
                          <Row className="justify-content-center">
                            <Col xs={4} className="text-left ml-lg-5">
                              <p><b>Category</b></p>
                            </Col>
                            <Col xs={3} className="text-left">
                              <p>  {service.category}  </p>
                            </Col>
                          </Row>
                          <Row className="justify-content-center">
                            <Col xs={4} className="text-left ml-lg-5">
                              <p><b>Cost</b></p>
                            </Col>
                            <Col xs={3} className="text-left">
                              <p> $ {service.cost}  </p>
                            </Col>
                          </Row>
                          <Row className="justify-content-center">
                            <Col xs={4} className="text-left ml-lg-5">
                              <p><b>Duration</b></p>
                            </Col>
                            <Col xs={3} className="text-left">
                              <p>  {service.duration}&nbsp;Minutes </p>
                            </Col>
                          </Row>
                          <Row className="justify-content-center">
                            <Col xs={12}>
                              <p><b>Associated&nbsp;Workers</b></p>
                            </Col>
                            <Col xs={12}>
                              <p> {service.workers} </p>
                            </Col>
                          </Row>
                          <Row className="justify-content-center">
                            <p><b>Description</b></p>
                          </Row>
                          <Row className="justify-content-center">
                            <Col xs={11} className="pb-5 px-5">
                              <LinesEllipsis
                                text={service.description}
                                maxLine='6'
                                ellipsis={service.description.length > 55 ? service.description.substring(0, 55) + " ..." : service.description.substring(0) + " ..."}
                                trimRight
                                basedOn='words'
                              />
                            </Col>
                          </Row>
                        </Col>
                      </Col>
                    </Row>
                  </div>
                }
                else {
                  return null
                }
              })
            }
          </div>
        })
        return categories
      }
      return null
    }

    // display either no services or service dashboard
    if (this.state.services.length > 0) {
      services = <Col>
        <div className="service_container">
          <CategorizedServices />
        </div>
      </Col>
    }
    else {
      services = <div>
        <p className="noResults">No Services!</p>
        <Button style={{ backgroundColor: "#3E4E69", color: 'white' }} onClick={() => this.triggerAddService()}>Add Service</Button>
      </div>
    }

    // display loading screen while the page is loading
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
    }
    else {
      // display the page once finished loading
      return (
        <Container fluid>
          <Row className="mb-5">
            <Col xs={12} lg={3} className="d-none d-lg-block">
              <nav className="section-nav add-shadow">
              <ListGroup defaultActiveKey={'#' + this.state.categories[0]}>
              <ListGroup.Item className="services-nav-title">
                <Row>
                <Col xs={6} style={{fontWeight: "bold"}} className="text-left">
                Services
                </Col>
                <Col xs={6} className="text-right">
                <FaPlusCircle color={"#fff"} size={20} onClick={() => this.triggerAddService()} style={{cursor: "pointer"}} className="text-right hvr-float"/>
                </Col>
                </Row>
              </ListGroup.Item>
              <AddCategories categories={this.state.categories}/>
            </ListGroup>
              </nav>
            </Col>
            <Col xs={12} className="d-block d-lg-none mt-4">
            <Button className="hvr-icon-forward" style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={() => this.triggerAddService()}>Add&nbsp;Service&nbsp;&nbsp;<FaPlusCircle className="hvr-icon mb-1"/></Button>
            </Col>
            <Col xs={12} lg={9} className="mt-3">
              {services}
            </Col>
          </Row>
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

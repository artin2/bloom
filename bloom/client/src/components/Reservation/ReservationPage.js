import React from 'react';
import Container from 'react-bootstrap/Container'
import ServiceSelection from './ServiceSelection'
import './ReservationPage.css'
import { Row, Col, Card, ListGroup } from 'react-bootstrap'
// import { FaArrowLeft } from 'react-icons/fa'
import DateSelection from './DateSelection'
import { css } from '@emotion/core'
import GridLoader from 'react-spinners/GridLoader'
import BookingPage from './BookingPage';
import RedirectToLogin from './RedirectToLogin'
import Cookies from 'js-cookie';
import HorizontalLinearStepper from './BookingStepper';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const override = css`
  display: block;
  margin: 0 auto;
`;

class ReservationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      storeName: null,
      total: 0,
      time: 0,
      currentStep: 1,
      categories: [],
      selectedServices: [],
      services: [],
      loading: true,
      workers: [],
      workersSchedules: [],
      storeHours: [],
      appointments: "original value"
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  updateReservation = (removal, currService) => {
    if (removal) {
      this.setState({ time: this.state.time - currService.duration })
      this.setState({ total: this.state.total - currService.cost })
      this.setState({
        selectedServices: this.state.selectedServices.filter(function (selectedService) {
          return currService.id !== selectedService.id;
        }
        )
      })
    } else {
      this.setState({ time: this.state.time + currService.duration })
      this.setState({ total: this.state.total + currService.cost })
      this.setState({ selectedServices: [...this.state.selectedServices, currService] })
    }
  }

  backStep = (event) => {
    var newStep = this.state.currentStep - 1
    this.setState({
      currentStep: newStep
    })
  }

  handleSubmit = (goNext) => {
    console.log("goNext is: ", goNext)
    console.log("currentstep is: ", this.state.currentStep)
    var newStep
    if (goNext && this.state.currentStep < 4) {
      newStep = this.state.currentStep + 1
      this.setState({
        currentStep: newStep
      })
    } else if(!goNext && this.state.currentStep > 1) {
      newStep = this.state.currentStep - 1
      this.setState({
        currentStep: newStep
      })
    } else {
      alert(JSON.stringify(this.state));
    }
  }

  updateAppointments = (receivedAppointments) => {
    this.setState({
      appointments: receivedAppointments
    })
  }

  pluralize = (val, word, plural = word + 's') => {
    const _pluralize = (num, word, plural = word + 's') =>
      [1, -1].includes(Number(num)) ? word : plural;
    if (typeof val === 'object') return (num, word) => _pluralize(num, word, val[word]);
    return _pluralize(val, word, plural);
  };

  timeConvert = (n) => {
    var num = n;
    var hours = (num / 60);
    var rhours = Math.floor(hours);
    var minutes = (hours - rhours) * 60;
    var rminutes = Math.round(minutes);
    return rhours + " " + this.pluralize(rhours, 'hour') + " and " + rminutes + " " + this.pluralize(rminutes, 'minute');
  }

  prefetchSchedules = () => {
    Promise.all([
      fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + '/workers/schedules', {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      }).then(value => value.json()),
      fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + "/storeHours", {
        method: "GET",
        headers: {
          'Content-type': 'application/json'
        },
        credentials: 'include'
      }).then(value => value.json())
    ]).then(allResponses => {
      this.setState({
        storeHours: allResponses[1],
        workersSchedules: allResponses[0]
      })
    })
  }

  componentDidMount() {
    // need to get store category, fetch?
    Promise.all([
      fetch(fetchDomain + '/stores/' + this.props.match.params.store_id + "/services", {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    }).then(value => value.json()),
    fetch(fetchDomain + '/stores/' + this.props.match.params.store_id, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    }).then(value => value.json())
    ]).then(allResponses => {
      const response1 = allResponses[0]
      const response2 = allResponses[1]
      const unique = [...new Set(response1.map(service => service.category))];
      if(this.props.location.currentStep && this.props.location.appointments) {
        this.setState({
          appointments: this.props.appointments,
          currentStep: this.props.currentStep
        })
      }
      this.setState({
        services: response1,
        storeName: response2.name,
        workers: response2.workers,
        categories: unique,
        loading: false
      })
    })

    this.prefetchSchedules()
  }

  static getDerivedStateFromProps(nextProps, preState) {
    if(nextProps.location.appointments && nextProps.location.appointments !== preState.appointments) {
      return {
        appointments: nextProps.location.appointments,
        currentStep: nextProps.location.currentStep
      }
    } else {
      return null
    }
  }


  render() {
    let that = this;
    const DisplayByStep = (props) => {
      if (this.state.loading) {
        return <Card className="add-shadow">
          <Row className="vertical-center">
            <Col>
              <GridLoader
                css={override}
                size={20}
                color={"#8CAFCB"}
                loading={this.state.loading}
              />
            </Col>
          </Row>
        </Card>
      } else {
        if (this.state.currentStep === 1) {
          return <ServiceSelection services={this.state.services} categories={this.state.categories} updateReservation={this.updateReservation} selectedServices={this.state.selectedServices} time={this.state.time} total={this.state.total} handleSubmit={this.handleSubmit} timeConvert={this.timeConvert} pluralize={this.pluralize} />
        } else if(this.state.currentStep === 2) {
          return <DateSelection time={this.state.time}  store_id={this.props.match.params.store_id} selectedServices={this.state.selectedServices} storeHours={this.state.storeHours} workersSchedules={this.state.workersSchedules} handleSubmit={this.handleSubmit} updateAppointments={this.updateAppointments}/>
        } else {
          if(Cookies.get('user')){
            return <BookingPage handleSubmit={this.handleSubmit} appointments={this.state.appointments} store_id={this.props.match.params.store_id} history={this.props.history}/>
          } else {
            return <RedirectToLogin handleSubmit={this.handleSubmit} appointments={this.state.appointments} store_id={this.props.match.params.store_id} history={this.props.history}/>
          }
        }
      }
    }

    // const DisplayBackButton = (props) => {
    //   if (this.state.currentStep === 1) {
    //     return null
    //   } else {
    //     return <FaArrowLeft size={'2em'} className="pt-2 pr-2" onClick={this.backStep} />
    //   }
    // }

    function ServiceList(props) {
      if (props.services) {
        const servicesList = props.services.map((service) => {
          return <ListGroup.Item variant="light" key={service.name}>
            <Row>
              <Col lg={7}>
                <Row>
                  {service.name}
                </Row>
                <Row className="smallText">
                  {service.duration} {that.pluralize(service.duration, 'minute')}
                </Row>
              </Col>
              <Col lg={5}>
                <div className="float-right">
                  ${service.cost.toFixed(2)}
                </div>
              </Col>
            </Row>
          </ListGroup.Item>;
        });

        return (
          <ListGroup variant='flush'>{servicesList}</ListGroup>
        );
      }
      return null
    }

    return (
      <Container fluid>
        <Row>
          <Col xs={12} lg={8} className="largeMarginBottom">
            <Row noGutters className="pt-3 pb-0">
              <HorizontalLinearStepper currentStep={this.state.currentStep}/>
            </Row>
            <DisplayByStep />
          </Col>
          <Col xs={12} lg={4} className="d-none d-lg-block">
            <Card
              text='dark'
              className='shoppingCart mt-3 add-shadow'
            >
              <Card.Header>Shopping Cart</Card.Header>
              <Card.Body className='pt-0'>
                <Row className='text-left'>
                  <Col>
                    <ServiceList services={this.state.selectedServices} />
                  </Col>
                </Row>

                <h2>Total: ${this.state.total.toFixed(2)}</h2>
                <h2>Time: {this.state.time} minutes</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={12} className="d-lg-none shopping-cart-col p-3">
            <Card
              bg='light'
              text='dark'
              className='add-shadow'
            >
              <Card.Header className='py-1'>Shopping Cart</Card.Header>
              <Card.Body className="smallPadding">
                <h6>{this.state.selectedServices.length} Selected {this.pluralize(this.state.selectedServices.length, 'Service')}</h6>
                <h6>Total: ${this.state.total.toFixed(2)}</h6>
                <h6>Time: {this.timeConvert(this.state.time)}</h6>
              </Card.Body>
            </Card>
          </Col>
        </Row>


      </Container>
    );
  }
}

export default ReservationPage;
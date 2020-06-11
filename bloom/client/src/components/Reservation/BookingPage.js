import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import './BookingPage.css';
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope, FaUser, FaPhone } from 'react-icons/fa';
import { Formik } from 'formik';
import { Form, Button } from 'react-bootstrap';
import store from '../../redux/store';
import { addAlert } from '../../redux/actions/alert'
import GridLoader from 'react-spinners/GridLoader'
import { css } from '@emotion/core'
import Cookies from 'js-cookie';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { addNewAppointment } from './ReservationHelper.js'
import { convertMinsToHrsMins } from '.././helperFunctions'
import alertReducer from '../../redux/reducers/alert';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const override = css`
  display: block;
  margin: 0 auto;
`;

class BookingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      first_name: '',
      last_name: '',
      phone: '',
      email: '',
      user_id: -1,
    };

    // RegEx for phone number validation
    this.phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/

    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      first_name: Yup.string()
        .min(2, "First name must have at least 2 characters")
        .max(100, "First name can't be longer than 100 characters")
        .required("First name is required"),
      last_name: Yup.string()
        .min(2, "Last name must have at least 2 characters")
        .max(100, "Last name can't be longer than 100 characters")
        .required("Last name is required"),
      email: Yup.string()
        .email("Must be a valid email address")
        .max(100, "Email must be less than 100 characters")
        .required("Email is required"),
      phone: Yup.string()
        .matches(this.phoneRegExp, "Phone number is not valid")
        .required("Phone number is required")
    });

    this.triggerAppointmentDisplay = this.triggerAppointmentDisplay.bind(this);
  }

  // redirect to the appointment display page and pass the new store data
  triggerAppointmentDisplay(returnedAppointment) {

    this.props.history.push({
      pathname: '/appointments/' + returnedAppointment,
      state: {
        appointmentGroupId: returnedAppointment
      }
    })
  }

  componentDidMount () {
    if(Cookies.get('user')){
      let user = JSON.parse(Cookies.get('user').substring(2))
      this.setState({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_id: user.id
      })
    }
  }

  componentDidUpdate(prevProps) {

    if(this.props.appointment !== prevProps.appointment) {
      this.triggerAppointmentDisplay(this.props.appointment.group_id)
    }
  }

  render() {
    const DisplayWithLoading = (props) => {
      if (this.state.loading) {
        return <Card
        text='dark'
        className='mt-0 py-3'
      >
        <Card.Body className='pt-0'>
          <Row className="vertical-center">
            <Col>
              <GridLoader
                css={override}
                size={20}
                color={"#8CAFCB"}
                loading={this.state.isLoading}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>
      } else {
        return <Card text='dark'
        className='mt-0 py-3 add-shadow'>
          <Card.Title>Book Appointment</Card.Title>
          <Card.Body className='pt-0'>
            <Row className='justify-content-center'>
              <Formik
                initialValues={{
                  first_name: this.state.first_name,
                  last_name: this.state.last_name,
                  phone: this.state.phone,
                  email: this.state.email,
                  user_id: this.state.user_id
                }}
                validationSchema={this.yupValidationSchema}
                onSubmit={(values, actions) => {
                  values.appointments = this.props.appointments
                  values.store_name = this.props.store.name
                  values.address = this.props.store.address
                  values.services = this.props.services
                  values.price = 0

                  for (let i = 0; i < values.appointments.length; i++) {
                    values.price += values.appointments[i].price

                    if(i === 0){
                      values.start_time = convertMinsToHrsMins(values.appointments[i].start_time)
                    }

                    if(i + 1 === values.appointments.length){
                      values.end_time = convertMinsToHrsMins(values.appointments[i].end_time)
                    }
                  }

                  this.props.addNewAppointment(this.props.store_id, values)
                }}
              >
                {({ values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting
                }) => (
                    <Form className="form-style">

                      <Form.Group controlId="formfirst_name">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <FaUser />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="text"
                            name="first_name"
                            value={values.first_name}
                            placeholder="First Name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.first_name && errors.first_name ? "error" : null} />
                        </InputGroup>
                        {touched.first_name && errors.first_name ? (
                          <div className="error-message">{errors.first_name}</div>
                        ) : null}
                      </Form.Group>

                      <Form.Group controlId="formlast_name">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <FaUser />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="text"
                            name="last_name"
                            value={values.last_name}
                            placeholder="Last Name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.last_name && errors.last_name ? "error" : null} />
                        </InputGroup>
                        {touched.last_name && errors.last_name ? (
                          <div className="error-message">{errors.last_name}</div>
                        ) : null}
                      </Form.Group>

                      <Form.Group controlId="formPhone">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <FaPhone />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control type="text"
                            value={values.phone}
                            placeholder="Phone Number"
                            name="phone"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.phone && errors.phone ? "error" : null} />
                        </InputGroup>
                        {touched.phone && errors.phone ? (
                          <div className="error-message">{errors.phone}</div>
                        ) : null}
                      </Form.Group>

                      <Form.Group controlId="formEmail">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <FaEnvelope />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="email"
                            value={values.email}
                            placeholder="Email"
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.email && errors.email ? "error" : null} />
                        </InputGroup>
                        {touched.email && errors.email ? (
                          <div className="error-message">{errors.email}</div>
                        ) : null}
                      </Form.Group>
                      <Row className="justify-content-center">
                        <Col xs="11" lg="3" className="mb-3">
                        <Button block style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={() => this.props.handleSubmit(false)}>Previous</Button>
                        </Col>
                        <Col xs="11" lg="3">
                        <Button disabled={isSubmitting || !(Object.keys(errors).length === 0 && errors.constructor === Object)} block style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={handleSubmit}>Submit</Button>
                        </Col>
                      </Row>
                    </Form>
                  )}
              </Formik>
            </Row>
          </Card.Body>
        </Card>
      }
    }

    return (
      <DisplayWithLoading />
    );
  }
}


const mapDispatchToProps = dispatch => bindActionCreators({
  addNewAppointment: (store_id, values) => addNewAppointment(store_id, values)
}, dispatch)

const mapStateToProps = state => ({
  appointment: state.reservationReducer.appointment,
})

export default connect(mapStateToProps, mapDispatchToProps)(BookingPage);

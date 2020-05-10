import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import './BookingPage.css';
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope, FaUser, FaPhone } from 'react-icons/fa';
import { Formik } from 'formik';
import { Form, Button } from 'react-bootstrap';
import store from '../../reduxFolder/store';
import { addAlert } from '../../reduxFolder/actions/alert'
import GridLoader from 'react-spinners/GridLoader'
import { css } from '@emotion/core'
import Cookies from 'js-cookie';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const override = css`
  display: block;
  margin: 0 auto;
`;

class BookingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      user_id: -1,
    };
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
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        user_id: user.id
      })
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
                  firstName: this.state.firstName,
                  lastName: this.state.lastName,
                  phone: this.state.phone,
                  email: this.state.email,
                  user_id: this.state.user_id
                }}
                onSubmit={(values) => {
                  values.appointments = this.props.appointments
                  let triggerAppointmentDisplay = this.triggerAppointmentDisplay

                  fetch(fetchDomain + '/stores/' + this.props.store_id + '/appointments/new', {
                    method: "POST",
                    headers: {
                      'Content-type': 'application/json',
                      'Accept': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify(values)
                  })
                    .then(function (response) {
                      if (response.status !== 200) {
                        // throw an error alert
                        store.dispatch(addAlert(response))
                      }
                      else {
                        return response.json();
                      }
                    })
                    .then(async data => {
                      if (data) {
                        triggerAppointmentDisplay(data.group_id)
                      }
                    });
                }}
              >
                {({ values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  setFieldValue
                }) => (
                    <Form className="form-style">

                      <Form.Group controlId="formFirstName">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <FaUser />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="text"
                            name="firstName"
                            value={values.firstName}
                            placeholder="First Name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.firstName && errors.firstName ? "error" : null} />
                        </InputGroup>
                        {touched.firstName && errors.firstName ? (
                          <div className="error-message">{errors.firstName}</div>
                        ) : null}
                      </Form.Group>

                      <Form.Group controlId="formLastName">
                        <InputGroup>
                          <InputGroup.Prepend>
                            <InputGroup.Text>
                              <FaUser />
                            </InputGroup.Text>
                          </InputGroup.Prepend>
                          <Form.Control
                            type="text"
                            name="lastName"
                            value={values.lastName}
                            placeholder="Last Name"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={touched.lastName && errors.lastName ? "error" : null} />
                        </InputGroup>
                        {touched.lastName && errors.lastName ? (
                          <div className="error-message">{errors.lastName}</div>
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
                        <Button block style={{backgroundColor: '#8CAFCB', border: '0px'}} onClick={handleSubmit}>Submit</Button>
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

export default BookingPage;
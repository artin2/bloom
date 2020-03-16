import React from 'react';
import '../../App.css';

import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope, FaLockOpen, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';

class EditProfileForm extends React.Component {
  constructor(props) {
    super(props);
    // RegEx for phone number validation
    this.phoneRegExp = /^(\+?\d{0,4})?\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{3}\)?)\s?-?\s?(\(?\d{4}\)?)?$/
    this.emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/
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
      .matches(this.phoneRegExp, "Phone number is not valid"),
      password: Yup.string()
      .min(6, "Password must have at least 6 characters")
      .max(100, "Password can't be longer than 100 characters"),
      password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords do not match')
    });
  }

  // temporary, change so that we pass as prop the store data and set that as initial value to rubik
  UNSAFE_componentWillMount() {
    // fetch('http://localhost:8081/users/' + this.props.match.params.id , {
    //   method: "GET",
    //   headers: {
    //       'Content-type': 'application/json'
    //   },
    //   body: JSON.stringify(this.state)
    //   })
    //   .then(function(response){
    //   if(response.status!==200){
    //       console.log("Error!", response.status)
    //       // throw new Error(response.status)
    //   }
    //   else{
    //       // got user data
    //       console.log("Successfully got business information!", response)
    //   }
    // })

    this.setState({
      user: {
        first_name: 'Artin',
        last_name: 'Kasumyan',
        email: 'artinkasumyan@yahoo.com',
        phone: '',
        password: '',
        password_confirmation: '',
        id: this.props.match.params.id
      }
    })
  }
    
  render() {
    return (
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={8} sm={7} md={6} lg={5}>
            <Formik 
              initialValues={{
                first_name: this.state.user.first_name,
                last_name: this.state.user.last_name,
                email: this.state.user.email,
                phone: this.state.user.phone,
                password: '',
                password_confirmation: ''
              }}
              validationSchema={this.yupValidationSchema}
              onSubmit={(values) => {
                fetch('http://localhost:8081/user/' + this.state.user.id , {
                  method: "PATCH",
                  headers: {
                    'Content-type': 'application/json'
                  },
                  body: JSON.stringify(values)
                })
                .then(function(response){
                  if(response.status!==200){
                    console.log("Error!", response.status)
                    // throw new Error(response.status)
                  }
                  else{
                    // redirect to home page signed in
                    console.log("Successful patch!", response.status)
                  }
                })
              }}
            >
            {( {values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit}) => (
              <Form className="formBody rounded">
                <h3>Sign Up</h3>

                <Form.Group controlId="formFirstName">
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FaUser/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control 
                      type="text" 
                      name="first_name"
                      value={values.first_name} 
                      placeholder="First Name" 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={touched.first_name && errors.first_name ? "error" : null}/>
                  </InputGroup>
                  {touched.first_name && errors.first_name ? (
                    <div className="error-message">{errors.first_name}</div>
                  ): null}
                </Form.Group>


                <Form.Group controlId="formLastName">
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FaUser/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control type="text" 
                    value={values.last_name}
                    placeholder="Last Name" 
                    name="last_name" 
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={touched.last_name && errors.last_name ? "error" : null}/>
                  </InputGroup>
                  {touched.last_name && errors.last_name ? (
                    <div className="error-message">{errors.last_name}</div>
                  ): null}
                </Form.Group>

                <Form.Group controlId="formPhone">
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FaPhone/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control type="text" 
                      value={values.phone} 
                      placeholder="Phone Number" 
                      name="phone" 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={touched.phone && errors.phone ? "error" : null}/>
                  </InputGroup>
                  {touched.phone && errors.phone ? (
                    <div className="error-message">{errors.phone}</div>
                  ): null}
                </Form.Group>

                <Form.Group controlId="formEmail">
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FaEnvelope/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control 
                      type="email"
                      value={values.email}
                      placeholder="Email" 
                      name="email" 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={touched.email && errors.email ? "error" : null}/>
                  </InputGroup>
                  {touched.email && errors.email ? (
                    <div className="error-message">{errors.email}</div>
                  ): null}
                </Form.Group>

                <Form.Group controlId="formPassword">
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FaLockOpen/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control 
                      type="password" 
                      value={values.password} 
                      placeholder="Password" 
                      name="password" 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={touched.password && errors.password ? "error" : null}/>
                  </InputGroup>
                  {touched.password && errors.password ? (
                    <div className="error-message">{errors.password}</div>
                  ): null}
                </Form.Group>

                <Form.Group controlId="formPasswordConfirmation">
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FaLock/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control 
                      type="password" 
                      value={values.password_confirmation}
                      placeholder="Confirm Password" 
                      name="password_confirmation" 
                      onChange={handleChange} 
                      onBlur={handleBlur}
                      className={touched.password_confirmation && errors.password_confirmation ? "error" : null}/>
                  </InputGroup>
                  {touched.password_confirmation && errors.password_confirmation ? (
                    <div className="error-message">{errors.password_confirmation}</div>
                  ): null}
                </Form.Group>
                <Button onClick={handleSubmit}>Submit</Button>
              </Form>
            )}
            </Formik>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default EditProfileForm;
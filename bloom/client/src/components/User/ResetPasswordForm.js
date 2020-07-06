import React from 'react';
import '../../App.css';
import './LoginForm.css'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {sendResetPassword} from './UserHelper.js'

class ResetPasswordForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null
    };

    this.toggleLogin = this.toggleLogin.bind(this);

    // RegEx for phone number validation
    this.emailRegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/
    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      email: Yup.string()
      .email("Must be a valid email address")
      .max(100, "Email must be less than 100 characters")
      .required("Email is required"),
    });
  }

  handleSubmit = (values, actions) => {
    actions.setSubmitting(true);
    this.props.sendResetPassword(values.email)
    // actions.setSubmitting(false);
  }

  toggleLogin(newValue) {
    this.setState({
      displayLogin: newValue
    })
  }


  // componentDidUpdate(prevProps, prevState)  {
  //   // means we updated redux store with the user and have successfully logged in
  //   if (prevProps.user !== this.props.user) {
  //     if(this.props.appointments) {
  //       this.props.history.push({
  //         pathname: '/book/' + this.props.store_id,
  //         appointments: this.props.appointments,
  //         currentStep: 3
  //       })
  //     } else {
  //       this.props.history.push({
  //         pathname: '/'
  //       })
  //     }

  //   }
  // }

  render() {
      return( <Formik
          initialValues={{
            email: ''
          }}
          validationSchema={this.yupValidationSchema}
          onSubmit={this.handleSubmit}
        >

        {( {values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting}) => (
              <Form className="formBody rounded px-3 py-4">
                <h3>Reset Password</h3>
                <p className="m-3" style={{fontStyle: "italic"}}>Please enter your email so we can send you a link to reset your password (if the email exists in our database).</p>
                <Form.Row className="justify-content-center">
                  <Col xs={12} sm={10} md={9} lg={8}>
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
                  </Col>
                </Form.Row>

                <Form.Row className="justify-content-center">
                  <Col xs={11} sm={8} md={7} lg={6}>
                    <Button disabled={isSubmitting || (Object.keys(errors).length === 0 && errors.constructor === Object && (Object.keys(touched).length === 0 && touched.constructor === Object)) || !(Object.keys(errors).length === 0 && errors.constructor === Object)} className="signup mb-1" onClick={handleSubmit}>Send Reset Email</Button>
                    <p className="my-1"> OR </p>

                    <p className="my-1"> Don't have a Bloom account yet? <Button variant="link"className="p-0" onClick={() => this.props.toggleLogin(1)}> Sign Up. </Button></p>
                    <p className="my-1"> Already have a Bloom account? <Button variant="link" className="p-0" onClick={() => this.props.toggleLogin(0)}> Log in. </Button></p>
                  </Col>
                </Form.Row>
              </Form>
        )}

        </Formik>
);

  }
}

const mapDispatchToProps = dispatch => bindActionCreators({
  sendResetPassword: (email) => sendResetPassword(email)
}, dispatch)


export default connect(null, mapDispatchToProps)(ResetPasswordForm);

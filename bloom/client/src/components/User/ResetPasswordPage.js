import React from 'react';
import '../../App.css';
import './LoginForm.css'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaLockOpen, FaLock } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {updatePassword} from './UserHelper.js'
import {toast} from 'react-toastify';

class ResetPasswordPage extends React.Component {
  constructor(props) {
    super(props);

    // Schema for yup
    this.yupValidationSchema = Yup.object().shape({
      password: Yup.string()
      .min(6, "Password must have at least 6 characters")
      .max(100, "Password can't be longer than 100 characters")
      .required("Password required"),
      password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords do not match')
      .required("Password Confirmation required")
    });
  }

  handleSubmit = (values, actions) => {
    this.props.updatePassword(values)
    actions.setSubmitting(false);
  }

  failureToast = (message) => {
    toast.error('⚠️ ' + message, {
      position: "top-right",
      autoClose: 6000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      })
  }

  componentDidUpdate(prevProps, prevState)  {
    // means we updated redux store with the user and have successfully logged in
    if (this.props.user) {
      this.props.history.push({
        pathname: '/'
      })
    }
  }

  render() {
      return(
      <Container fluid>
        <Row className="justify-content-center mt-5">
          <Col xs={12} sm={10} md={8} lg={7}>
            <Formik
                initialValues={{
                  email: this.props.match.params.email,
                  token: this.props.match.params.token,
                  password: '',
                  password_confirmation: ''
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

                      <Form.Row className="justify-content-center">
                        <Col xs={11} sm={8} md={7} lg={6}>
                          <Button disabled={isSubmitting || (Object.keys(errors).length === 0 && errors.constructor === Object && (Object.keys(touched).length === 0 && touched.constructor === Object)) || !(Object.keys(errors).length === 0 && errors.constructor === Object)} className="signup mb-1" onClick={handleSubmit}>Reset</Button>
                        </Col>
                      </Form.Row>
                    </Form>
              )}
            </Formik>
          </Col>
        </Row>
      </Container>
);

  }
}

const mapStateToProps = state => ({
  user: state.userReducer.user
})

const mapDispatchToProps = dispatch => bindActionCreators({
  updatePassword: (values) => updatePassword(values)
}, dispatch)


export default connect(mapStateToProps, mapDispatchToProps)(ResetPasswordPage);

import React from 'react';
import '../../App.css';
import './LoginForm.css'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope, FaLockOpen, FaLock, FaUser, FaPhone } from 'react-icons/fa';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {signup} from './UserHelper.js'
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import {TiSocialFacebookCircular, TiSocialGooglePlus} from 'react-icons/ti';
import {toast} from 'react-toastify';

class SignupForm extends React.Component {
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
      .max(100, "Password can't be longer than 100 characters")
      .required("Password required"),
      password_confirmation: Yup.string()
      .oneOf([Yup.ref('password')], 'Passwords do not match')
      .required("Password Confirmation required")
    });
  }

  handleSubmit = (values, actions) => {
    this.props.signUpUser(values)
    actions.setSubmitting(false);
  }

  successGoogle = (response) => {
    // console.log(response.profileObj)
    // console.log("Google Success: ", response.accessToken);
    this.setState({
      provider: "Google",
      password: response.accessToken,
      email: response.profileObj.email,
      first_name: response.profileObj.givenName,
      last_name: response.profileObj.familyName,
      role: '0',
      phone: ''
    });

    this.props.signUpUser(this.state)
  }

  failureGoogle = (response) => {
    this.failureToast("Google Failure: " + response.error);
  }

  successFacebook = (response) => {

    console.log("Facebook Success:", response.accessToken);
    let name = response.name.split(" ");;

    this.setState({

      provider: "Facebook",
      password: response.accessToken,
      email: response.email,
      first_name: name[0],
      last_name: name[1],
      role: '0',
      phone: ''

    });

    this.props.signUpUser(this.state)

  }

  failureFacebook = (response) => {
    if(response.status){
      this.failureToast("Facebook Failure");
    }
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
    if (prevProps.user !== this.props.user) {
      if(this.props.appointments) {
        this.props.history.push({
          pathname: '/book/' + this.props.store_id,
          appointments: this.props.appointments,
          currentStep: 3
        })
      } else {
        this.props.history.push({
          pathname: '/'
        })
      }

    }
  }

  render() {
      return( <Formik
          initialValues={{
            first_name: '',
            last_name: '',
            email: '',
            role: '0',
            phone: '',
            password: '',
            password_confirmation: '',
            provider: null
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
            <h3>Sign Up</h3>

            <Row className="align-items-center">
              <Col xs={12} sm={10} md={5} lg={6}>
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

                <Button disabled={isSubmitting || (Object.keys(errors).length === 0 && errors.constructor === Object && (Object.keys(touched).length === 0 && touched.constructor === Object)) || !(Object.keys(errors).length === 0 && errors.constructor === Object)} className="signup mb-1" onClick={handleSubmit}>Sign Up</Button>
                </Col>

                <Col xs={12} sm={10} md={7} lg={6}>
                <p > OR </p>
                <GoogleLogin
                  clientId={process.env.REACT_APP_GOOGLE_ID}
                  buttonText="Login with Google"
                  onSuccess={this.successGoogle}
                  onFailure={this.failureGoogle}
                  cookiePolicy={'single_host_origin'}
                  render={renderProps => (
                    <button onClick={renderProps.onClick} className="my-1" style={{ width: '100%', backgroundColor:"#db4a39", color: 'white', paddingRight: '30px',
                  height: '48px', fontSize: '14px'}}> <TiSocialGooglePlus  size={45} style={{paddingRight:"15px"}}/>Login with Google</button>
                )}
              />

              <FacebookLogin
                appId={process.env.REACT_APP_FACEBOOK_ID} //APP ID NOT CREATED YET
                fields="name,email,picture"
                onFailure={this.failureFacebook}
                xfbml={true}
                cssClass="facebookButton my-1"
                icon={<TiSocialFacebookCircular size={45} style={{paddingRight:"15px"}}/>}
                callback={this.successFacebook}
                />
                <p className="my-1"> Already have a Bloom account? <Button variant="link" className="p-0" onClick={() => this.props.toggleLogin(0)}> Log in. </Button></p>
                </Col>

                </Row>
              </Form>
        )}

        </Formik>
);

  }
}

const mapStateToProps = state => ({
  user: state.userReducer.user
})

const mapDispatchToProps = dispatch => bindActionCreators({
  signUpUser: (values) => signup(values)
}, dispatch)


export default connect(mapStateToProps, mapDispatchToProps)(SignupForm);

import React from 'react';
import './LoginForm.css'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope, FaLock } from 'react-icons/fa';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import {TiSocialFacebookCircular, TiSocialGooglePlus} from 'react-icons/ti';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {login} from './UserHelper.js'
import {toast} from 'react-toastify';
// import { useGoogleLogin } from 'react-google-login';
// import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      message: {},
      provider: null
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({[event.target.id]: event.target.value});
  }


  successGoogle = (response) => {
    console.log(response)
    console.log("Google Success: ", response.accessToken);
    this.setState({
      provider: "Google",
      email: response.profileObj.email,
      password: response.accessToken
    });
    this.props.loginUser(this.state)
  }

  failureGoogle = (response) => {
    this.failureToast("Google Failure: " + response.error);
  }

  successFacebook = (response) => {
    console.log("Facebook Success:", response.accessToken);
    this.setState({
      provider: "Facebook",
      email: response.email,
      password: response.accessToken

    });

    this.props.loginUser(this.state)
  }

  failureFacebook = (response) => {
    if(response.status){
      this.failureToast("Facebook Login Failure");
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

  handleSubmit(event) {
    //there might be a CORS issue with the backend, this doesn't work without preventDefault..
    event.preventDefault();
    this.props.loginUser(this.state)
  }

  render() {
    return ( <Form className="formBody rounded px-3 py-4">
              <h3>{this.props.title}</h3>
              <Form.Row className="justify-content-center">
              <Col xs={12} sm={10} md={9} lg={8}>
                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend >
                        <InputGroup.Text>
                            <FaEnvelope/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control id="email" type="email" placeholder="Email" onChange={this.handleChange}/>
                  </InputGroup>
                </Form.Group>

                <Form.Group>
                  <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>
                            <FaLock/>
                        </InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control id="password" type="password" placeholder="Password" onChange={this.handleChange}/>
                  </InputGroup>
                </Form.Group>
                </Col>
                </Form.Row>
              <Form.Row className="justify-content-center">
              <Col xs={11} sm={8} md={7} lg={6}>
                <Button disabled={!(this.state.email && this.state.password)} className="login my-1" type="submit" variant="primary" onClick={this.handleSubmit}>Login</Button>
                  <p className="my-1"> OR </p>
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
                  <p className="my-1"> Don't have a Bloom account yet? <Button variant="link"className="p-0" onClick={() => this.props.toggleLogin(false)}> Sign Up. </Button></p>
              </Col>
              </Form.Row>
            </Form>
    );
  }
}

const mapStateToProps = state => ({
  user: state.userReducer.user
})

const mapDispatchToProps = dispatch => bindActionCreators({
  loginUser: (email, password, auth_token) => login(email, password, auth_token)
}, dispatch)


export default connect(mapStateToProps, mapDispatchToProps)(LoginForm);

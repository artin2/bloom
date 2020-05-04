import React from 'react';
import './LoginForm.css'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope, FaLock } from 'react-icons/fa';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import {TiSocialFacebookCircular, TiSocialGooglePlus} from 'react-icons/ti';
import paint from '../../assets/abstract-painting.jpg';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {login} from '../../reduxFolder/redux.js'
// import ReactDOM from 'react-dom';
// import { useGoogleLogin } from 'react-google-login';
// import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      message: {},
      auth: ''
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
      auth: {
        party: "Google",
        token: response.accessToken
      }
    });
  }

  failureGoogle = (response) => {
    console.log("Google Failure:", response.error);
  }

  fsuccessFacebook = (response) => {
    console.log("Facebook Success:", response.accessToken);
    this.setState({
      auth: {
        party: "Google",
        token: response.accessToken
      }
    });
  }

  failureFacebook = (response) => {
    if(response.status){
      console.log("Facebook Failure");
    }
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
    this.props.loginUser(this.state.email, this.state.password, this.state.auth)
  }

  render() {
    return ( <Form className="formBody rounded">
              <h3>{this.props.title}</h3>
              <Form.Group style={{marginTop: 40, width: '65%', marginLeft: '17%'}}>
                <InputGroup>
                  <InputGroup.Prepend >
                      <InputGroup.Text>
                          <FaEnvelope/>
                      </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control id="email" type="email" placeholder="Email" onChange={this.handleChange}/>
                </InputGroup>
              </Form.Group>

              <Form.Group style={{width: '65%', marginLeft: '17%'}}>
                <InputGroup>
                  <InputGroup.Prepend>
                      <InputGroup.Text>
                          <FaLock/>
                      </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control id="password" type="password" placeholder="Password" onChange={this.handleChange}/>
                </InputGroup>
              </Form.Group>
              <Col xs={8} sm={8} md={8} lg={8} style={{marginLeft: '17%'}}>
                <Button  className="login" type="submit" variant="primary" onClick={this.handleSubmit}>Login</Button>
                  <p><b> OR </b></p>
                  <GoogleLogin
                    clientId={process.env.REACT_APP_GOOGLE_ID}
                    buttonText="Login with Google"
                    onSuccess={this.successGoogle}
                    onFailure={this.failureGoogle}
                    cookiePolicy={'single_host_origin'}
                    render={renderProps => (
                      <button onClick={renderProps.onClick} style={{ width: '100%', backgroundColor:"#db4a39", color: 'white', paddingRight: '30px',
                    marginBottom: '10px', height: '48px', fontSize: '14px'}}> <TiSocialGooglePlus  size={45} style={{paddingRight:"15px"}}/>Login with Google</button>
                    )}
                  />

                  <FacebookLogin
                    appId={process.env.REACT_APP_FACEBOOK_ID} //APP ID NOT CREATED YET
                    fields="name,email,picture"
                    onFailure={this.failureFacebook}
                    xfbml={true}
                    cssClass="facebookButton"
                    icon={<TiSocialFacebookCircular size={45} style={{paddingRight:"15px"}}/>}
                    callback={this.successFacebook}
                    />
                  <p> Don't have a Bloom account yet? <Link  onClick={() => this.props.toggleLogin(false)}> Sign Up. </Link></p>
              </Col>
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

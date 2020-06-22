import React from 'react';
import './LoginForm.css'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import paint from '../../assets/abstract-painting.jpg'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'
import { Image } from 'react-bootstrap'

class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      message: {},
      displayLogin: props.location.pathname === "/login"
    };

    this.toggleLogin = this.toggleLogin.bind(this);
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

  toggleLogin(newValue) {
    this.setState({
      displayLogin: newValue
    })
  }

  render() {
    const RenderLoginOrSignup = (props) => {
      if(this.state.displayLogin) {
        return <LoginForm title="Login" history={this.props.history} toggleLogin={this.toggleLogin}/>
      } else {
        return <SignupForm history={this.props.history} toggleLogin={this.toggleLogin}/>
      }
    }
    return (
      <Container fluid>
        <Image src={paint} fluid alt="paint" style={{top: 0, left: 0, position: 'absolute', height: '100vh', width:'100%', filter: 'grayscale(0.4)'}}/>
        <Row className="justify-content-center mt-5">
          <Col xs={12} sm={10} md={8} lg={7}>
            <RenderLoginOrSignup/>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default Registration;

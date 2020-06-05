import React from 'react';
import {Container, Col, Row} from 'react-bootstrap'

class NotFoundPage extends React.Component {
  render() {
    return (
      <Container fluid>
        <Row className="justify-content-center">
          <Col xs={12} sm={11} md={10} lg={9}>
              <h1 className="about" style={{marginTop: "10%"}}>~ Whoops ~</h1>
              <p style={{fontSize: 22, marginTop: '10%'}}>
                Looks like the page you are looking for doesn't exist! Yikes. We will soon fire the engineer responsible for this (Arthur), don't you worry.
              </p>
            </Col>
          </Row>
      </Container>
    );
  }
}

export default NotFoundPage;

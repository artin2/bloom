import React from 'react';
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import { Form, Button } from 'react-bootstrap';
import './ServiceSelection.css'

class StylistSelection extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(currWorker) {
    if (this.props.selectedWorkers.find(x => x === currWorker.id)) {
      this.props.updateSelectedWorkers(true, currWorker.id)
    }
    else {
      this.props.updateSelectedWorkers(false, currWorker.id);
    }
    // this.setState({ [event.target.id]: !this.state[event.target.id] })
  }

  render() {
    const Workers = (props) => {
      if (this.props.workers) {
        const workers = this.props.workers.map((worker) => {
          return <Col className={"mb-4 " + (this.props.selectedWorkers.filter(x => x === worker.id).length > 0 ? 'perm-shadow' : 'hvr-float-shadow')} xs={12} lg={3} id={worker.id} key={worker.id}>
              <Card onClick={() => this.handleChange(worker)} className={this.props.selectedWorkers.filter(x => x === worker.id).length > 0 ? 'selected' : ''} >
                <Card.Body>  
                  <Card.Title>
                    {worker.first_name + " " + worker.last_name[0]}
                  </Card.Title>
                </Card.Body>
                <Card.Footer>
                  <small>5 star stylist</small>
                </Card.Footer>
              </Card>
            </Col>
        })
        return workers
      }
      return null
    }
    return (
      <Card className='p-4 add-shadow'>
        <h3 className="mb-4">Select Stylist</h3>
          <Row className="text-left">
              <Workers/>
          </Row>
          <Row className="justify-content-center mt-4">
            <Col xs="3" className="text-left">
            <Button block className="update-button" onClick={() => this.props.handleSubmit(false)}>Previous</Button>
            </Col>
            <Col xs="3" className="text-right">
            <Button block className="update-button" disabled={this.props.selectedWorkers.length === 0} onClick={() => this.props.handleSubmit(true)}>Next</Button>
            </Col>
          </Row>
        
      </Card>
      
    );
  }
}

export default StylistSelection;

import React from 'react';
import LargeCarousel from '../LargeCarousel';
import Card from 'react-bootstrap/Card'
import { Button, Carousel, Image, Col } from 'react-bootstrap';
import Row from 'react-bootstrap/Row'
import { FaPhone } from 'react-icons/fa';

class SearchCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pictures: [],
      addressDisplay: null
    }
  }

  componentDidMount(){
    if(this.props.store && this.props.store.address){
      let shortAddress = this.props.store.address.split(",").splice(0, 4).join(", ")
      console.log("short:", shortAddress, "split", this.props.store.address.split(","))
      this.setState({
        addressDisplay: shortAddress
      })
    }
  }

  render() {
    console.log(this.props.store)
    return (
      <Col xs={12} className="my-3 px-0 h-100">
        <Card className="add-shadow" style={{height: '100%'}}>
          <Row style={{height: '100%'}}>
            <Col md={6} className="vertical-align-contents px-0 h-100 w-100">
              <Carousel interval="">
                {this.props.store.pictures.map((picture, index) => (
                  <Carousel.Item key={"pic-" + index}>
                    <Image fluid style={{height: '100%', width: '100%'}} src={picture.url} alt={"Slide " + index} />
                  </Carousel.Item>
                ))}
              </Carousel>
            </Col>
            <Col md={6} className="vertical-align-contents px-0 h-100">
              <Card.Body >
                <div>
                  <Card.Title onClick={() => this.props.onClickFunctionStore(this.props.store.id)} style={{cursor: 'pointer'}} >{this.props.store.name}</Card.Title>
                  <Card.Text className="mb-3">{this.state.addressDisplay == null ? this.props.store.address : this.state.addressDisplay}</Card.Text>
                  <Card.Text className="mb-3">
                    <FaPhone size={12}/> {this.props.store.phone}
                  </Card.Text>


                </div>
                <Button style={{backgroundColor: '#8CAFCA', border: 0}} onClick={() => this.props.onClickFunctionBook(this.props.store.id)}>Book Now</Button>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Col>
    );
  }
}

export default SearchCard;

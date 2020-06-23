import React from 'react';
import Card from 'react-bootstrap/Card'
import { Button, Carousel, Image, Col } from 'react-bootstrap';
import Row from 'react-bootstrap/Row'
import { FaPhone } from 'react-icons/fa';
import { Rating } from '@material-ui/lab'

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
      this.setState({
        addressDisplay: shortAddress
      })
    }
  }

  render() {
    return (
      <Col xs={12} className="my-3 px-0 h-50">
        <Card className="add-shadow hvr-float-shadow" style={{height: '100%'}}>
          <Row className="mr-0 ml-0" style={{height: '100%'}}>
            <Col md={6} className="vertical-align-contents px-0" style={{maxHeight: '250px', width: '100%'}}>
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
                  <Card.Title onClick={() => this.props.onClickFunctionStore(this.props.store.id)} style={{cursor: 'pointer'}} ><h3>{this.props.store.name}</h3></Card.Title>
                  <Card.Text className="mb-3">
                    <FaPhone className="mb-1" size={12}/> {this.props.store.phone}
                  </Card.Text>
                  
                  <Row className="mb-3 justify-content-center">
                    <p>({this.props.store.rating_count})</p>
                    <Rating
                      name={"rating"}
                      precision={0.5}
                      value={this.props.store.rating_count > 0 ? this.props.store.rating_total/this.props.store.rating_count : 0}
                      readOnly
                    />
                  </Row>
                <Button className="update-button" onClick={() => this.props.onClickFunctionBook(this.props.store.id)}>Book Now</Button>
              </Card.Body>
            </Col>
          </Row>
        </Card>
      </Col>
    );
  }
}

export default SearchCard;

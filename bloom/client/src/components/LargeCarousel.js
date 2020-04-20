import React from 'react';
import Carousel from 'react-bootstrap/Carousel'
import './LargeCarousel.css'


class LargeCarousel extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <Carousel style={this.props.style} interval="">
        {this.props.pictures.map((url, index) => (
          <Carousel.Item key={"pic-" + index}>
            <img style={this.props.img} src={url} alt={"Slide " + index} />
          </Carousel.Item>
        ))}
      </Carousel>
    );
  }
}

export default LargeCarousel;

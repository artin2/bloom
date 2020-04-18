import React from 'react';
import Carousel from 'react-bootstrap/Carousel'
import './LargeCarousel.css'


class LargeCarousel extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  render() {
    return (
      <Carousel interval="">
        {this.props.pictures.map((picture, index) => (
          <Carousel.Item key={"pic-" + index}>
            <img className="img-fluid w-100" src={picture.url} alt={"Slide " + index} />
          </Carousel.Item>
        ))}
      </Carousel>
    );
  }
}

export default LargeCarousel;

import React from 'react';
import Container from 'react-bootstrap/Container'
import { Form, Row, InputGroup, Button, Navbar } from 'react-bootstrap';
import Col from 'react-bootstrap/Col'
import SearchCard from './SearchCard'
import './SearchDisplay.css'
import MapContainer from '../Map/MapContainer'
import SearchDisplayLoader from './SearchDisplayLoader'
import SearchDisplayLoaderMobile from './SearchDisplayLoaderMobile'
// import Chip from '@material-ui/core/Chip';
// import Select from '@material-ui/core/Select';
// import MenuItem from '@material-ui/core/MenuItem';
// import Input from '@material-ui/core/Input';
import { FiSearch } from 'react-icons/fi';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;


class SearchDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      center: {
        lat: 0.0,
        lng: 0.0
      },
      zoom: 11,
      mapStyles: {
        width: '100%',
        height: '100%'
      },
      center: {
        lat: '',
        lng: ''
      },
      category: ["Nail Salon", "Hair Salon", "Facials", "Barbershops"],
      selected: [],
      address: '',
      distance: 1,
      loading: true
    }
  }

  componentDidMount() {
    console.log("this things props are: ", this.props)
    if (this.props.location.state && this.props.location.state.stores && this.props.location.state.center) {
      this.setState({
        stores: this.props.location.state.stores,
        center: this.props.location.state.center
      })
    }
    else {
      console.log("about to get results")
      let link = window.location.href.split("search")
      let query = ""

      if (link.length > 1) {
        query = link[1]
      }

      this.getResults(query);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location) {
      if (this.props.location.search !== prevProps.location.search) {
        this.getResults(this.props.location.search);
      }
    }
  }

  getResults(query) {
    fetch(fetchDomain + '/stores' + query, {
      method: "GET",
      headers: {
        'Content-type': 'application/json'
      },
      credentials: 'include'
    })
      .then(function (response) {
        if (response.status !== 200) {
          // should throw an error here
          console.log("ERROR!")
        }
        else {
          return response.json();
        }
      })
      .then(data => {
        if (data) {
          this.setState({
            stores: data,
            center: {
              lat: data[0].lat,
              lng: data[0].lng,
            },
            loading: false
          })
        }
      });
  }

  render() {
    const RenderStoreCards = (props) => {
      return this.state.stores.map(store => (
          <SearchCard key={"store-" + store.id} store={store}
            onClickFunctionBook={() => window.location.href = '/book/' + store.id}
            onClickFunctionStore={() => window.location.href = '/stores/' + store.id}
          />
      ))
    }
    const DisplayWithLoading = (props) => {
      if (this.state.loading) {
        return <Row>
            <Col xs="12">
              <SearchDisplayLoader className={'d-none d-md-block'}/>
              <SearchDisplayLoaderMobile className={'d-block d-md-none'}/>
            </Col>
          </Row>
      } else {
        return(<div>
          <h3 className="text-left"> {this.state.stores.length} results </h3>
          <Row className="mx-0 justify-content-center search-cards-row">
            <RenderStoreCards/>
          </Row>
        </div>
        )
      }
    }
    let map = null
    if (this.state.stores.length > 0) {
      map = <MapContainer google={window.google}
        stores={this.state.stores}
        center={this.state.center}
        zoom={this.state.zoom}
        mapStyles={this.state.mapStyles} />
    }

    return (
      <div>
        <Row className="restrict-viewport mx-0">
          <Col xs={12} xl={6} className="px-5 my-3 h-100">
            <DisplayWithLoading/>
          </Col>
          <Col id="map" xs={12} xl={6}>
            <div className="position-fixed h-100 w-50 d-none d-xl-block">
              {map}
            </div>
          </Col>
        </Row>
      </div>

    );
  }
}

export default SearchDisplay;

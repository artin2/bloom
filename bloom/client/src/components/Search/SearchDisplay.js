import React from 'react';
import { Row, Col, Container } from 'react-bootstrap';
import SearchCard from './SearchCard'
import './SearchDisplay.css'
import MapContainer from '../Map/MapContainer'
import SearchDisplayLoader from './SearchDisplayLoader'
import SearchDisplayLoaderMobile from './SearchDisplayLoaderMobile'
import {Switch} from '@material-ui/core'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class SearchDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: [],
      // center: {
      //   lat: 0.0,
      //   lng: 0.0
      // },
      zoom: 11,
      mapStyles: {
        width: '100%',
        height: '100%'
      },
      center: {
        lat: '',
        lng: ''
      },
      loading: true,
      query: this.props.location.search,
      ownUpdate: false,
      checked: true
    }

    this.toggleChecked = this.toggleChecked.bind(this);
  }

  toggleChecked() {
    this.setState({
      checked: !this.state.checked
    })
  }

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.stores && this.props.location.state.center) {
      this.setState({
        stores: this.props.location.state.stores,
        center: this.props.location.state.center,
        loading: false
      })
    }
    else {
      let link = window.location.href.split("search")
      let query = ""

      if (link.length > 1) {
        query = link[1]
      }

      this.getResults(false, query);
    }
  }

  static getDerivedStateFromProps(nextProps, preState) {
    if (preState.ownUpdate) {
      return null
    }
    else {
      if(nextProps.location.search !== preState.query) {
        return {
          loading: true
        }
      } else {
        return null
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location) {
      if (this.props.location.search !== prevProps.location.search) {
        this.getResults(true, this.props.location.search);
      }
    }
  }

  getResults(update, query) {
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
          console.log("ERROR!", response)
        }
        else {
          return response.json();
        }
      })
      .then(data => {
        if (data) {
          this.setState({
            stores: data.stores,
            center: data.center,
            loading: false,
            ownUpdate: update
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
              <SearchDisplayLoader className={'d-none d-xl-block'}/>
              <SearchDisplayLoaderMobile className={'d-block d-xl-none'}/>
            </Col>
          </Row>
      } else if(this.state.stores.length > 0) {
        return( <div>
          <h3 className="text-left mb-0"> {this.state.stores.length} results </h3>
          <Row className="mx-0 justify-content-center search-cards-row">
            <RenderStoreCards/>
          </Row>
        </div>
        )
      } else {
        return <Row>
            <Col xs="12">
              <h5>No results!</h5>
            </Col>
          </Row>
      }
    }

    const DisplayMapDynamic = (props) => {
        return <MapContainer style={{position: 'relative'}}
        google={window.google}
        stores={this.state.stores}
        center={this.state.center}
        zoom={this.state.zoom}
        mapStyles={this.state.mapStyles} />
    }

    return (
      <div>
        <Row className="justify-content-center">
          <Col xs={12} className="d-block d-xl-none" style={{marginTop: 15, marginBottom: 15}}>
            <Switch color="primary" checked={this.state.checked} onChange={this.toggleChecked}/>
          </Col>
        </Row>
        <Row className="restrict-viewport mx-0">
          <Col xs={12} xl={6} className={"px-5 my-3 h-100" + (this.state.checked ? "" : " d-none d-xl-block")}>
            <DisplayWithLoading/>
          </Col>
          <Col id="map" xs={12} xl={6} style={{padding: 0}}>
            <div className={(this.state.checked ? " d-none d-xl-block" : "")}>
              <DisplayMapDynamic/>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}

export default SearchDisplay;

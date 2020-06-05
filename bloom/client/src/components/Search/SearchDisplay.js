import React from 'react';
import { Row, Col } from 'react-bootstrap';
import SearchCard from './SearchCard'
import './SearchDisplay.css'
import MapContainer from '../Map/MapContainer'
import SearchDisplayLoader from './SearchDisplayLoader'
import SearchDisplayLoaderMobile from './SearchDisplayLoaderMobile'
import {Switch} from '@material-ui/core'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getSearchResults } from './SearchHelper.js'
import { updateSelectedStore } from '../../redux/actions/search'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

class SearchDisplay extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      stores: this.props.stores,
      zoom: 11,
      mapStyles: {
        width: '100%',
        height: '100%'
      },
      center: this.props.center,
      query: this.props.location.search,
      checked: true
    }

    this.toggleChecked = this.toggleChecked.bind(this);
  }

  toggleChecked() {
    this.setState({
      checked: !this.state.checked
    })
  }

  componentDidUpdate(prevProps) {

      if (this.props.stores !== prevProps.stores) {

          this.setState({
            stores: this.props.stores,
            center: this.props.center,

          })
        }

    }

  onClickFunctionBook(store) {

    this.props.updateSelectedStore(store)
    this.props.history.push({
      pathname: '/book/' + store.id,
    })

  }

  onClickFunctionStore(store) {

    this.props.updateSelectedStore(store)
    this.props.history.push({
      pathname: '/stores/' + store.id,
    })

  }


  render() {
    const RenderStoreCards = (props) => {
      return this.state.stores.map(store => (
          <SearchCard key={"store-" + store.id} store={store}
            onClickFunctionBook={() => this.onClickFunctionBook(store)}
            onClickFunctionStore={() => this.onClickFunctionStore(store)}
          />
      ))
    }
    const DisplayWithLoading = (props) => {
      if (this.props.loading) {
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
        mapStyles={this.state.mapStyles}
        onClickFunctionBook={(store) => this.onClickFunctionBook(store)}
        onClickFunctionStore={(store) => this.onClickFunctionStore(store)}/>
    }

    return (
      <div>
        <Row className="justify-content-center">
          <Col xs={12} className="d-block d-xl-none" style={{marginTop: 15, marginBottom: 15}}>
            <Row className="justify-content-center">
              <p style={{marginTop: 5}}> Map View </p>
              <Switch color="primary" checked={this.state.checked} onChange={this.toggleChecked}/>
              <p style={{marginTop: 5}}> List View </p>
            </Row>
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

const mapDispatchToProps = dispatch => bindActionCreators({
  getSearchResults: (query) => getSearchResults(query),
  updateSelectedStore: (store) => updateSelectedStore(store)
}, dispatch)

const mapStateToProps = state => ({
  stores: state.searchReducer.stores,
  loading: state.searchReducer.isFetching,
  center: state.searchReducer.center
})


export default connect(mapStateToProps, mapDispatchToProps)(SearchDisplay);

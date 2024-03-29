import React from 'react';
import {Card, Col, Row, Container} from 'react-bootstrap'
import './CalendarPage.css';
import { Multiselect } from 'multiselect-react-dropdown';
import { FiSearch} from 'react-icons/fi';
import { withRouter } from "react-router"
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getServices } from '../Service/ServiceHelper.js'
import { getWorkers } from '../Worker/WorkerHelper.js'
import { getAppointments, getClients } from './CalendarHelper.js'
import { getStore } from '../Store/StoreHelper'
import CalendarComponent from './CalendarComponent'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

let service_map = {}
let worker_map = {}
let worker_to_services = {}
let app_to_worker = {}
let workerOptions = []
let serviceOptions = []
let clientOptions = {}
let store = {}

export function getArray(key) {

  switch(key) {
  case "service_map":
    return service_map
  case "worker_map":
    return worker_map
  case "serviceOptions":
    return serviceOptions
  case "workerOptions":
    return workerOptions
  case "app_to_worker":
    return app_to_worker
  case "worker_to_services":
    return worker_to_services
  case "clients":
    return clientOptions
  case "store":
    return store
  default:
    // code block
  }
}


class Calendar extends React.Component {
  constructor(props) {
    super(props);
       this.state = {
         store_id: (this.props.match.params.store_id) ? (this.props.match.params.store_id) : this.props.store_id,
         services: [],
         workers: [],
         clients: this.props.clients,
         selectedWorkers: [],
         selectedServices: [],
         selectedAppointments: [],
         appointments: [],
        loading: true
       }

       this.onSelectWorker = this.onSelectWorker.bind(this);
       this.onRemoveWorker = this.onRemoveWorker.bind(this);
       this.onSelectService = this.onSelectService.bind(this);
       this.onRemoveService = this.onRemoveService.bind(this);
       this.onSearch = this.onSearch.bind(this);
  }

  async componentDidMount() {

    store = this.props.store
    await this.props.getServices(this.state.store_id)
    await this.props.getWorkers(this.state.store_id)
    await this.props.getClients(this.state.store_id, this.props.store.clients)
    await this.props.getAppointments(this.state.store_id);

  }

  componentDidUpdate(prevProps) {

    if(this.props.appointments !== prevProps.appointments) {

      let appointments = []

      this.props.appointments.appointments.map((appointment, index) => {
        // if this is the store's calendar or if this is the worker's calendar and the worker's appointment

        // console.log(this.props.id)
        if((!this.props.id && !this.props.match.params.user_id) || (this.props.match.params.user_id && this.props.match.params.user_id == appointment.worker_id) || (this.props.id && appointment.worker_id === this.props.id)) {

          appointments.push({
            id: appointment.id,
            title: this.state.service_map[appointment.service_id].name + " with " + this.state.worker_map[appointment.worker_id].name,
            workers: appointment.worker_id,
            services: appointment.service_id,
            price: appointment.price,
            startDate: new Date(appointment.start_time),
            endDate: new Date(appointment.end_time),
            email: appointment.email,
            group_id: appointment.group_id,
            other_appointments: this.props.appointments.groups[appointment.group_id],
            first_name: appointment.first_name,
            last_name: appointment.last_name,
            notes: appointment.notes,
            deleted: [],
            added: [],
            warnings: [],
            clients: this.state.clients ? this.state.clients : []
          })

          let date = new Date(appointment.date)
          date = new Date(date.getFullYear(), date.getMonth(), date.getDate())
          let startTime = new Date(appointment.start_time).getHours()*60 + new Date(appointment.start_time).getMinutes()
          let endTime = new Date(appointment.end_time).getHours()*60 + new Date(appointment.end_time).getMinutes()

          if(app_to_worker[[date, appointment.worker_id]]) {
              app_to_worker[[date, appointment.worker_id]].push([startTime, endTime])
          }
          else {
              app_to_worker[[date, appointment.worker_id]] = [[startTime, endTime]]
          }

        return appointment
        }
      })


      this.setState({
        appointments: appointments,
        selectedAppointments: appointments,
        loading: false
      })
    }

    if(this.props.clients !== prevProps.clients) {

      clientOptions = this.props.clients
      this.setState({
        clients: clientOptions,
      })

    }

    if(this.props.services !== prevProps.services) {
      let services = this.props.services;

        services.map((service, indx) => {

            // if(!this.props.id) {
              serviceOptions.push({id: service.id, text: service.name})
              service_map[service.id] = {name: service.name, duration: service.duration, price: service.cost}
            // }
            // else {
            //   if(service.workers.includes(this.props.id)){
            //
            //     service_map[service.id] = {name: service.name, duration: service.duration, price: service.cost}
            //   }
            // }

        })

      this.setState({
        services: serviceOptions,
        service_map: service_map,
      })

      // this.props.getWorkers(this.state.store_id)
    }

    if(this.props.workers !== prevProps.workers) {
      let workers = this.props.workers;


        workers.map((worker, indx) => {
          workerOptions.push({id: worker.id, text: worker.first_name + ' ' + worker.last_name})

          // if(!this.props.id) {
            worker_map[worker.id] = {name: worker.first_name + ' ' + worker.last_name, workerHours: worker.workerHours}
            worker_to_services[worker.id] = worker.services
          // }
          // else {
          //   if(worker.id === this.props.id){
            //   worker_map[worker.id] = {name: worker.first_name + ' ' + worker.last_name, workerHours: worker.workerHours}
            //   worker_to_services[worker.id] = worker.services
            // }
          // }
        })


      this.setState({
        workers: workerOptions,
        worker_map: worker_map,
        worker_to_services: worker_to_services,
      })


      // this.props.getAppointments(this.state.store_id);
    }

  }

  // triggered when adding or deleting appointment

  onSearch() {
    let includeWorker;
    let includeService;
    let newSelected = [];

    this.state.appointments.map(appointment => {
      includeWorker = (this.state.selectedWorkers.length === 0) ? true : false;
      includeService = (this.state.selectedServices.length === 0) ? true : false;

      this.state.selectedWorkers.map(worker => {
        if(appointment.workers === worker.id) {
          includeWorker = true;
        }

        return worker
      })

      this.state.selectedServices.map(service => {
        if(appointment.services === service.id) {
          includeService = true;
        }

        return service
      })

      if(includeService && includeWorker) {
        newSelected.push(appointment);
      }

      return appointment
    })

    this.setState({ selectedAppointments: newSelected });
  }


  onSelectWorker(selectedList, selectedItem) {

    this.setState({ selectedWorkers: selectedList });
  }

  onRemoveWorker(selectedList, removedItem) {

    this.setState({ selectedWorkers: selectedList });
  }

  onSelectService(selectedList, selectedItem) {
    this.setState({ selectedServices: selectedList });
  }

  onRemoveService(selectedList, removedItem) {
    this.setState({ selectedServices: selectedList });
  }



  render() {

    console.log(this.props.role)
    let name = (this.props.role) ? this.props.role : "your";
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return (
      <Container fluid>
        {(!this.state.loading ) ? (
            <Row className="justify-content-center">
              <Col >
                <p className="title"> Manage {name} Appointments </p>
                {(!this.props.role) ? (
                  <Row className="justify-content-center">

                    <Multiselect
                      id="service-multiselect"
                      options={this.state.services}
                      avoidHighlightFirstOption={true}
                      onSelect={this.onSelectService}
                      onRemove={this.onRemoveService}
                      placeholder="Service"
                      closeIcon="cancel"
                      displayValue="text"
                      style={{multiselectContainer: {width: '35%'},  groupHeading:{width: 50, maxWidth: 50}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '20%', width: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                      />
                    <Multiselect
                        id="workers-multiselect"
                        options={this.state.workers}
                        avoidHighlightFirstOption={true}
                        onSelect={this.onSelectWorker}
                        onRemove={this.onRemoveWorker}
                        placeholder="Workers"
                        closeIcon="cancel"
                        displayValue="text"
                        style={{multiselectContainer: {marginLeft: '2%', width: '35%'}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '20%', width: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                      />
                      <FiSearch onClick={this.onSearch} size={35} style={{cursor: "pointer", marginLeft: 10, paddingRight:"10px"}}/>

                  </Row>

                ) : null}


                <CalendarComponent store_id={this.state.store_id} appointments={this.state.selectedAppointments} role={this.props.role}/>
              </Col>
            </Row>

          ): null }
      </Container>
    );
  }
}
// layoutComponent={AppointmentLayoutForm}

const mapDispatchToProps = dispatch => bindActionCreators({
  getAppointments: (store_id) => getAppointments(store_id),
  getServices: (store_id) => getServices(store_id),
  getWorkers: (store_id) => getWorkers(store_id),
  getStore: (store_id) => getStore(store_id),
  getClients: (store_id, clients) => getClients(store_id, clients)
}, dispatch)

const mapStateToProps = state => ({
  appointments: state.calendarReducer.appointments,
  workers: state.workerReducer.workers,
  services: state.serviceReducer.services,
  store: state.storeReducer.store,
  clients: state.calendarReducer.clients
})


export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Calendar));

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
import { getAppointments } from './CalendarHelper.js'
import { getStore } from '../Store/StoreHelper'
import CalendarComponent from './CalendarComponent'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

//
// const AppointmentLayoutForm = ({
//   appointmentData, onFieldChange, ...restProps }) => {
//     // console.log(restProps)
//     let date = new Date()
//
//     const handleSubmit = () => {
//
//     }
//     const handleChange = (value) => {
//         onFieldChange({ currentDate: value });
//     }
//
//     console.log(appointmentData)
//
//     return (
//
//         <Col xs={12} sm={9} lg={12} >
//           <Row >
//             <AppointmentForm.CommandButton  style={{marginTop: 5, marginLeft: 15}} id={"cancelButton"} getMessage={()=> null} onExecute={()=>null}>
//             </AppointmentForm.CommandButton>
//             <AppointmentForm.CommandButton style={{backgroundColor: 'black', marginTop: 15, marginLeft: '72%'}} getMessage={()=>"next"} id={"saveButton"} onExecute={()=>null}>
//             </AppointmentForm.CommandButton>
//
//           </Row>
//
//
//         </Col>
//     );
// };

// <AppointmentForm.Layout
//   // onFieldChange={onFieldChange}
//   appointmentData={appointmentData}
//   {...restProps}
// >
//
//
// </AppointmentForm.Layout>




    // <AppointmentForm.BasicLayout
    //   onFieldChange={onFieldChange}
    //   appointmentData={appointmentData}
    //   {...restProps}
    // >
    //
    // <AppointmentForm.Label
    //    text="Email"
    //    type="title"
    //  />
    //  <AppointmentForm.TextEditor
    //   style={{width: '50%'}}
    //    value={appointmentData.email}
    //    onValueChange={onCustomFieldChangeEmail}
    //    placeholder="Customer email"
    //  />
    //
    // <AppointmentForm.Label
    //    text="Price"
    //    type="title"
    //  />
    //
    //  <AppointmentForm.TextEditor
    //   style={{width: '50%'}}
    //    value={appointmentData.price}
    //    onValueChange={onCustomFieldChange}
    //    placeholder="Price, in dollars"
    //  />
    //
    // </AppointmentForm.BasicLayout>
//   );
// };


class Calendar extends React.Component {
  constructor(props) {
    super(props);
       this.state = {
         store_id: (this.props.match.params.store_id) ? (this.props.match.params.store_id) : this.props.store_id,
         services: [],
         workers: [],
         worker_map: {},
         service_map: {},
         selectedWorkers: [],
         selectedServices: [],
         selectedAppointments: [],
         appointments: [],
         // mainResourceName: 'workers',
         //  resources: [
         //    {
         //      fieldName: 'services',
         //      title: 'Service',
         //      allowMultiple: false,
         //      instances: [],
         //    },
         //    {
         //      fieldName: 'workers',
         //      title: 'Employee',
         //      allowMultiple: false,
         //      instances: [],
         //    },
         //  ],
        // currentDate: moment(new Date()).format('YYYY-MM-DD'),
        loading: true
       }

       this.onSelectWorker = this.onSelectWorker.bind(this);
       this.onRemoveWorker = this.onRemoveWorker.bind(this);
       this.onSelectService = this.onSelectService.bind(this);
       this.onRemoveService = this.onRemoveService.bind(this);
       this.onSearch = this.onSearch.bind(this);
  }

  componentDidMount() {

    this.props.getServices(this.state.store_id)

  }

  componentDidUpdate(prevProps) {

    if(this.props.appointments !== prevProps.appointments) {

      console.log(this.props.appointments)
      //
      let appointments = []
      // let appointment_groups = {}
      this.props.appointments.appointments.map((appointment, index) => {
        // if this is the store's calendar or if this is the worker's calendar and the worker's appointment
        // if(!this.props.id || (this.props.id && appointment.worker_id === this.props.id)) {

          console.log(appointment)
          appointments.push({
            id: appointment.id,
            title: this.state.service_map[appointment.service_id] + " with " + this.state.worker_map[appointment.worker_id],
            workers: appointment.worker_id,
            services: appointment.service_id,
            price: appointment.price,
            startDate: new Date(appointment.start_time),
            endDate: new Date(appointment.end_time),
            email: appointment.email,
            group_id: appointment.group_id,
            other_appointments: this.props.appointments.groups[appointment.group_id]
          })

        return appointment
      })


      this.setState({
        appointments: appointments,
        selectedAppointments: appointments,
        loading: false
      })
    }


    if(this.props.services !== prevProps.services) {
      let services = this.props.services;
      let service_instances = []
      let service_map = {}

      if(!this.props.id) {

        services.map((service, indx) => {
          service_instances.push({id: service.id, text: service.name})
          service_map[service.id] = service.name
        })

      }
      else{

        services.map((service, indx) => {
          if(service.workers.includes(this.props.id)){
            service_instances.push({id: service.id, text: service.name})
            service_map[service.id] = service.name
          }

        })

      }

      // this.setState(({resources}) => ({
      //   resources: [
      //       // ...resources.slice(0,1),
      //   {
      //       ...resources[0],
      //       instances: service_instances,
      //   },
      //   ...resources.slice(1)
      //   ]
      // }));

      this.setState({
        services: service_instances,
        service_map: service_map,
      })

      this.props.getWorkers(this.state.store_id)
    }

    if(this.props.workers !== prevProps.workers) {
      let workers = this.props.workers;
      let worker_to_services = []
      let worker_instances = []
      let worker_map = {}

      if(!this.props.id) {

        workers.map((worker, indx) => {
          worker_instances.push({id: worker.id, text: worker.first_name + ' ' + worker.last_name})
          worker_map[worker.id] = worker.first_name + ' ' + worker.last_name
          worker_to_services[worker.id] = worker.services

        })

      }
      else{

        workers.map((worker, indx) => {
          if(worker.id === this.props.id){
            worker_instances.push({id: worker.id, text: worker.first_name + ' ' + worker.last_name})
            worker_map[worker.id] = worker.first_name + ' ' + worker.last_name
            worker_to_services[worker.id] = worker.services
          }
        })
      }

      this.setState({
        workers: worker_instances,
        worker_map: worker_map,
        worker_to_services: worker_to_services,
      })

      // this.setState(({resources}) => ({
      //   resources: [
      //       ...resources.slice(0,1),
      //   {
      //       ...resources[1],
      //       instances: worker_instances,
      //   },
      //   // ...resources.slice(2)
      //   ]
      // }));
      this.props.getAppointments(this.state.store_id);
    }

  }

  // triggered when adding or deleting appointment

  onSearch() {
    let includeWorker;
    let includeService;
    let newSelected = [];

    this.state.appointments.map(appointment => {
      includeWorker = (this.state.selectedWorkers.length === 0) ? true : false;
      includeService= (this.state.selectedServices.length === 0) ? true : false;

      // console.log(this.state.selectedWorkers, this.state.selectedServices);

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
    // console.log(selectedList, selectedItem)
    this.setState({ selectedWorkers: selectedList });
  }

  onRemoveWorker(selectedList, removedItem) {
    // console.log("remove", selectedList, removedItem);
    this.setState({ selectedWorkers: selectedList });
  }

  onSelectService(selectedList, selectedItem) {
    this.setState({ selectedServices: selectedList });
  }

  onRemoveService(selectedList, removedItem) {
    this.setState({ selectedServices: selectedList });
  }



  render() {

    // let resources;
    // if(this.state.resources[1].instances.length>0) {
    //   resources = [this.state.resources[0], this.state.resources[1]]
    // }
    // else {
    //      resources = this.state.resources
    // }

    let name = (this.props.role) ? this.props.role : "your";
    name = name.charAt(0).toUpperCase() + name.slice(1);

    return (
      <Container fluid>
        <Row className="justify-content-center">
          <Col>
            <p className="title"> Manage {name} Appointments </p>
            {(!this.props.role) ? (
              <Row style={{marginBottom: 50, marginLeft: '22%', position: 'relative'}}>
                <Multiselect
                  id="service-multiselect"
                  options={this.state.services}
                  avoidHighlightFirstOption={true}
                  onSelect={this.onSelectService}
                  onRemove={this.onRemoveService}
                  placeholder="Service"
                  closeIcon="cancel"
                  displayValue="text"
                  style={{multiselectContainer: {marginLeft: '2%', width: '35%'},  groupHeading:{width: 50, maxWidth: 50}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: 250, width: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
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
                    style={{multiselectContainer: {marginLeft: '2%', width: '35%'},  optionContainer:{ zIndex: 10000000}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: 250, width: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                  />
                  <FiSearch onClick={this.onSearch} size={35} style={{cursor: "pointer", marginLeft: 10, paddingRight:"10px"}}/>

              </Row>

            ) : null}

            <CalendarComponent appointments={this.state.selectedAppointments}/>
          </Col>
        </Row>
      </Container>
    );
  }
}
// layoutComponent={AppointmentLayoutForm}

const mapDispatchToProps = dispatch => bindActionCreators({
  getAppointments: (store_id) => getAppointments(store_id),
  getServices: (store_id) => getServices(store_id),
  getWorkers: (store_id) => getWorkers(store_id),
  getStore: (store_id) => getStore(store_id)
}, dispatch)

const mapStateToProps = state => ({
  appointments: state.calendarReducer.appointments,
  workers: state.workerReducer.workers,
  services: state.serviceReducer.services,
  store: state.storeReducer.store
})

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Calendar));

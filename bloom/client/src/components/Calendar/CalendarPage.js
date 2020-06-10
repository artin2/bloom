import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import './CalendarPage.css';
import {  Resources, ConfirmationDialog, Scheduler, AppointmentForm, AppointmentTooltip, DateNavigator,TodayButton, DayView, WeekView, MonthView, Appointments, ViewSwitcher, Toolbar,  DragDropProvider} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import 'react-calendar/dist/Calendar.css';
import Paper from '@material-ui/core/Paper';
import { Multiselect } from 'multiselect-react-dropdown';
import { FiSearch} from 'react-icons/fi';
import { withRouter } from "react-router"
import moment from 'moment';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { getServices } from '../Service/ServiceHelper.js'
import { getWorkers } from '../Worker/WorkerHelper.js'
import { getAppointments } from './CalendarHelper.js'
import { getStore } from '../Store/StoreHelper'
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import classNames from 'clsx';
import store from '../../redux/store';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const isWeekEnd = (date) => {
  const state = store.getState();
  let start_time = state.storeReducer.store.storeHours[(date.getDay()+6)%7].open_time
  return start_time == null;
}

const isRestTime = (date) => {
    const state = store.getState();
    let start_time = state.storeReducer.store.storeHours[(date.getDay()+6)%7].open_time
    let end_time = state.storeReducer.store.storeHours[(date.getDay()+6)%7].close_time

    return start_time == null || date.getHours() < start_time/60 || date.getHours() >= end_time/60;
}




const BooleanEditor = ({
  ...restProps }) => {
  return null;
};


const TextEditor = (props) => {
    return null;
};

const styles = ({ palette }: Theme) => createStyles({
  weekEndCell: {
    backgroundColor: fade(palette.action.disabledBackground, 0.04),
    '&:hover': {
      backgroundColor: fade(palette.action.disabledBackground, 0.04),
    },
    '&:focus': {
      backgroundColor: fade(palette.action.disabledBackground, 0.04),
    },
  },
  weekEndDayScaleCell: {
    backgroundColor: fade(palette.action.disabledBackground, 0.06),
  },
});

const DayScaleCell = withStyles(styles)(({
  startDate, classes, ...restProps
}: DayScaleCellProps) => (
  <MonthView.DayScaleCell
    className={classNames({
      [classes.weekEndDayScaleCell]: isWeekEnd(startDate),
    })}
    startDate={startDate}
    {...restProps}
  />
));

const TimeTableCell = withStyles(styles, { name: 'TimeTableCell' })(({ classes, data, ...restProps }) => {
  const { startDate, onDoubleClick } = restProps;

  if (isWeekEnd(startDate)) {
    return <MonthView.TimeTableCell {...restProps} onDoubleClick={()=>null} className={classes.weekEndCell} />;
  }
  return <MonthView.TimeTableCell {...restProps} />;
});

const TimeTableCellWeek = withStyles(styles, { name: 'TimeTableCell' })(({ classes, ...restProps }) => {
  const { startDate, onDoubleClick } = restProps;

  if (isRestTime(startDate)) {
    return <WeekView.TimeTableCell {...restProps} onDoubleClick={()=>null} className={classes.weekEndCell} />;
  }
  return <WeekView.TimeTableCell {...restProps} />;
});

const DayScaleCellWeek = withStyles(styles, { name: 'DayScaleCell' })(({ classes, ...restProps }) => {
  const { startDate } = restProps;
  if (isWeekEnd(startDate)) {
    return <WeekView.DayScaleCell {...restProps} className={classes.weekEndDayScaleCell} />;
  }
  return <WeekView.DayScaleCell {...restProps} />;
});


const TimeTableCellDay = withStyles(styles, { name: 'TimeTableCell' })(({ classes, data, ...restProps }) => {
  const { startDate, onDoubleClick } = restProps;

  if (isRestTime(startDate)) {
    return <DayView.TimeTableCell {...restProps} onDoubleClick={()=>null} className={classes.weekEndCell} />;
  }
  return <DayView.TimeTableCell {...restProps} />;
});

const DayScaleCellDay = withStyles(styles, { name: 'DayScaleCell' })(({ classes, ...restProps }) => {
  const { startDate, onDoubleClick } = restProps;
  // Calendar.demoFunction()
  if (isWeekEnd(startDate)) {
    return <DayView.DayScaleCell {...restProps} onDoubleClick={()=>null} className={classes.weekEndDayScaleCell} />;
  }
  return <DayView.DayScaleCell {...restProps} />;
});


const BasicLayout = ({ appointmentData, onFieldChange,
   ...restProps }) => {
     // console.log(">>", appointmentData, restProps)

   const onCustomFieldChange = (nextValue) => {
     onFieldChange({ price: nextValue });
   };

  return (
    <AppointmentForm.BasicLayout
      onFieldChange={onFieldChange}
      appointmentData={appointmentData}
      {...restProps}
    >

    <AppointmentForm.Label
       text="Price"
       type="title"
     />
     <Row className="justify-content-center">
     <AppointmentForm.TextEditor
      style={{width: '50%'}}
       value={appointmentData.price}
       onValueChange={onCustomFieldChange}
       placeholder="Price"
     />
     <AppointmentForm.Label
        style={{marginTop: 15, marginLeft: 10, fontSize: 20}}
        text="$"
        type="text"
      />
      </Row>
    </AppointmentForm.BasicLayout>
  );
};

const messages = {
  allDayLabel : '',
  repeatLabel : '',
  moreInformationLabel: '',
  detailsLabel: 'Date'
}

const RecurrenceLayout = ({
  appointmentData,
  visible,
  ...restProps }) => {

  return  (
    <AppointmentForm.RecurrenceLayout
      appointmentData={appointmentData}
      visible={false}
      {...restProps}
    >

    </AppointmentForm.RecurrenceLayout>
  );

};


const Appointment = ({
  children, style,
  ...restProps
}) => {
  return (
    <Appointments.Appointment
      {...restProps}
      style={{
        ...style,
        backgroundColor: '#597096',
        borderRadius: '5px',

      }}

    >
      {children}
    </Appointments.Appointment>
  );
}

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
         mainResourceName: 'workers',
          resources: [
            {
              fieldName: 'services',
              title: 'Services',
              allowMultiple: false,
              instances: [],
            },
            {
              fieldName: 'workers',
              title: 'Workers',
              allowMultiple: false,
              instances: [],
            },
          ],
        currentDate: moment(new Date()).format('YYYY-MM-DD'),
        loading: true
       }

       this.commitChanges = this.commitChanges.bind(this);
       this.changeMainResource = this.changeMainResource.bind(this);
       this.onSelectWorker = this.onSelectWorker.bind(this);
       this.onRemoveWorker = this.onRemoveWorker.bind(this);
       this.onSelectService = this.onSelectService.bind(this);
       this.onRemoveService = this.onRemoveService.bind(this);
       this.onSearch = this.onSearch.bind(this);
       this.onAppointmentChanges = this.onAppointmentChanges.bind(this);
       // this.func = this.func.bind(this)
  }

  componentDidMount() {

    this.props.getServices(this.state.store_id)

  }

  componentDidUpdate(prevProps) {

    if(this.props.appointments !== prevProps.appointments) {

      let appointments = []
      this.props.appointments.map((appointment, index) => {
        // if this is the store's calendar or if this is the worker's calendar and the worker's appointment
        if(!this.props.id || (this.props.id && appointment.worker_id === this.props.id)) {

          appointments.push({
            id: appointment.id,
            title: this.state.service_map[appointment.service_id] + " with " + this.state.worker_map[appointment.worker_id],
            workers: appointment.worker_id,
            services: appointment.service_id,
            price: appointment.price,
            startDate: appointment.start_time,
            endDate: appointment.end_time,
            // users: appointment.user_id,
            group_id: appointment.group_id
          })
        }
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

      this.setState(({resources}) => ({
        resources: [
            // ...resources.slice(0,1),
        {
            ...resources[0],
            instances: service_instances,
        },
        ...resources.slice(1)
        ]
      }));

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

      this.setState(({resources}) => ({
        resources: [
            ...resources.slice(0,1),
        {
            ...resources[1],
            instances: worker_instances,
        },
        // ...resources.slice(2)
        ]
      }));
      this.props.getAppointments(this.state.store_id);
    }

  }

  // eventually should be users that were previously at the salon?
  // getUsers = async () => {
  //   let users = []
  //   await fetch(fetchDomain + '/allUsers', {
  //     method: "GET",
  //     headers: {
  //       'Content-type': 'application/json'
  //     },
  //     credentials: 'include'
  //   })
  //   .then(async function (response) {
  //     if (response.status !== 200) {
  //       // throw an error alert
  //       console.log("error")
  //     }
  //     else {
  //       return response.json();
  //     }
  //   })
  //   .then(async data => {
  //     if (data) {
  //       users = data;
  //
  //       let user_instances = []
  //
  //       users.map((user, indx) => {
  //         user_instances.push({id: user.id, text: user.first_name + ' ' + user.last_name})
  //
  //         return user
  //       })
  //
  //       this.setState({
  //         users: user_instances,
  //
  //       })
  //     }
  //   })
  // }

  // triggered when adding or deleting appointment
  onAppointmentChanges(key, string) {
    if(!key.hasOwnProperty("services")){
      return;
    }

    let resources = this.state.resources
    resources[1].instances = this.state.workers.filter(worker => this.state.worker_to_services[worker.id] && this.state.worker_to_services[worker.id].includes(key.services) ? worker : null);

    this.setState({
      resources: resources
    })
  }


  changeMainResource(mainResourceName) {
    this.setState({ mainResourceName });
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

  async commitChanges({ added, changed, deleted }) {
    let store_id = (this.props.match.params.store_id) ? (this.props.match.params.store_id) : this.props.store_id;
    let onSearch = this.onSearch

    if(deleted !== undefined) {
      let selectedAppointments = this.state.selectedAppointments;
      let appointment_id = null;

      selectedAppointments.map((appointment, indx) => {
        // id = deleted[appointment.id] ? appointment.id : id;
        appointment_id = deleted === appointment.id ? indx : appointment_id;
        return appointment
      });

      // console.log("appointment id", appointment_id, deleted)

      let group_id = selectedAppointments[appointment_id].group_id;

      fetch(fetchDomain + '/appointments/delete/' + group_id, {
        method: "GET",
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',

      })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          // store.dispatch(addAlert(response))
        }
        else {
          return response.json();
        }
      })
      .then(async data => {
        if (data) {
          // console.log("Before!", this.state.appointments)
          await this.setState({appointments: this.state.appointments.filter(function(appointment) {
            return appointment.id !== deleted
          })});

          onSearch()
        }
      });
    }

    await this.setState((state) => {
      let { selectedAppointments, /*appointments*/ } = state;
      if (added) {
        added.title = this.state.service_map[added.services] + " with " + this.state.worker_map[added.workers];
        const startingAddedId = selectedAppointments.length > 0 ? selectedAppointments[selectedAppointments.length - 1].id + 1 : 0;
        selectedAppointments = [...selectedAppointments, { id: startingAddedId, ...added }];
        // appointments = selectedAppointments
      }

      if (changed) {
        selectedAppointments = selectedAppointments.map(appointment => {
          if(changed[appointment.id]) {
            if(changed[appointment.id].hasOwnProperty("services") && !changed[appointment.id].hasOwnProperty("workers")) {
              changed[appointment.id].title = this.state.service_map[changed[appointment.id].services] + " with " + this.state.worker_map[appointment.workers];
            }
            if(changed[appointment.id].hasOwnProperty("workers") && !changed[appointment.id].hasOwnProperty("services")) {
              changed[appointment.id].title = this.state.service_map[appointment.services] + " with " + this.state.worker_map[changed[appointment.id].workers];
            }
            if(changed[appointment.id].hasOwnProperty("workers") && changed[appointment.id].hasOwnProperty("services")) {
              changed[appointment.id].title = this.state.service_map[changed[appointment.id].services] + " with " + this.state.worker_map[changed[appointment.id].workers];
            }

            return { ...appointment, ...changed[appointment.id] }
          }
          else {
            return appointment;
          }
        });

        // appointments = selectedAppointments
      }

      if (deleted !== undefined) {
        selectedAppointments = selectedAppointments.filter(appointment => appointment.id !== deleted);
        // appointments = selectedAppointments;
      }

      return { selectedAppointments };
    });

    if(added) {
      let values = {
        appointments: [{
          price: added.price,
          worker_id: added.workers,
          service_id: added.services,
          start_time: added.startDate.getHours()*60,
          end_time: added.endDate.getHours()*60,
          date: added.startDate
        }],
        // user_id: added.users,
      }

      fetch(fetchDomain + '/stores/' + store_id + '/appointments/new', {
        method: "POST",
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(values)
      })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          // store.dispatch(addAlert(response))
        }
        else {
          return response.json();
        }
      })
      .then(async data => {
        if (data) {

        }
      });
    }

    if(changed) {
      let selectedAppointments = this.state.selectedAppointments;
      let appointment_id = null, id = null;

      selectedAppointments.map((appointment, indx) => {
        id = changed[appointment.id] ? appointment.id : id;
        appointment_id = changed[appointment.id] ? indx : appointment_id;

        return appointment
      });

      let values = {
        appointment: [{
          price: selectedAppointments[appointment_id].price,
          worker_id: selectedAppointments[appointment_id].workers,
          service_id: selectedAppointments[appointment_id].services,
          start_time: (selectedAppointments[appointment_id].startDate.getHours()*60 + selectedAppointments[appointment_id].startDate.getMinutes()),
          end_time: (selectedAppointments[appointment_id].endDate.getHours()*60 + selectedAppointments[appointment_id].endDate.getMinutes()),
          date: selectedAppointments[appointment_id].startDate,
          id: id,
          store_id: parseInt(store_id)
        }],
        // user_id: selectedAppointments[appointment_id].users,
      }

      fetch(fetchDomain + '/stores/' + store_id + '/appointments/update', {
        method: "POST",
        headers: {
          'Content-type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(values)
      })
      .then(function (response) {
        if (response.status !== 200) {
          // throw an error alert
          // store.dispatch(addAlert(response))
        }
        else {
          return response.json();
        }
      })
      .then(async data => {
        if (data) {
          // update the appointments
          let date = new Date(data.date);
          let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), this.timeConvert(data.start_time)[0], this.timeConvert(data.start_time)[1]);
          let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), this.timeConvert(data.end_time)[0], this.timeConvert(data.end_time)[1]);

          await this.setState({
            appointments: this.state.appointments.map(appointment => (appointment.id === data.id ? Object.assign({}, appointment,
              {
                id: data.id,
                title: this.state.service_map[data.service_id] + " with " + this.state.worker_map[data.worker_id],
                workers: data.worker_id,
                services: data.service_id,
                price: data.price,
                startDate: startDate,
                endDate: endDate,
                // users: data.user_id,
                group_id: data.group_id
              }) : appointment))
          });

          onSearch()
        }
      });
    }
  }

  render() {

    let resources;
    if(this.state.resources[1].instances.length>0) {
      resources = [this.state.resources[0], this.state.resources[1]]
    }
    else {
         resources = this.state.resources
    }

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
                  options={this.state.resources[0]["instances"]}
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
                    options={this.state.resources[1]["instances"]}
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
           <Paper className="react-calendar">
          <Scheduler
            data={this.state.selectedAppointments}
            hours={this.state.selectedAppointments}
          >
          <ViewState
            defaultCurrentDate={this.state.currentDate}

          />
          <EditingState
           onCommitChanges={this.commitChanges}
           onAppointmentChangesChange={this.onAppointmentChanges}
           onAddedAppointmentChange={this.onAppointmentChanges}
         />
         <IntegratedEditing />

            <WeekView
             startDayHour={6}
             endDayHour={24}
             cellDuration={60}
             timeTableCellComponent={TimeTableCellWeek}
             dayScaleCellComponent={DayScaleCellWeek}
           />
           <MonthView
             dayScaleCellComponent={DayScaleCell}
             timeTableCellComponent={TimeTableCell}
          />
          <DayView
            startDayHour={8}
            endDayHour={24}
            cellDuration={60}
            dayScaleCellComponent={DayScaleCellDay}
            timeTableCellComponent={TimeTableCellDay}
          />


            <Toolbar />
            <ViewSwitcher />
            <DateNavigator/>
            <TodayButton />
            <ConfirmationDialog />
            <Appointments
            appointmentComponent={Appointment}/>
            <AppointmentTooltip
            showCloseButton
            showOpenButton
            />
            <AppointmentForm
            isRecurrence={false}
            basicLayoutComponent={BasicLayout}
            recurrenceLayoutComponent={RecurrenceLayout}
            textEditorComponent={TextEditor}
            messages={messages}
            booleanEditorComponent={BooleanEditor}
            />
            <Resources
              data={resources}
              // mainResourceName={this.state.mainResourceName}
            />
            <DragDropProvider/>
          </Scheduler>
          </Paper>
          </Col>
        </Row>
      </Container>
    );
  }
}


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

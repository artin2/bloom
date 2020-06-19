import React from 'react';
import {Card, Col, Row, Container, Collapse, Button} from 'react-bootstrap'
import {  Resources, ConfirmationDialog, Scheduler, AppointmentForm, AppointmentTooltip, DateNavigator,TodayButton, DayView, WeekView, MonthView, Appointments, ViewSwitcher, Toolbar,  DragDropProvider} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import 'react-calendar/dist/Calendar.css';
import './CalendarPage.css';
import Paper from '@material-ui/core/Paper';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import classNames from 'clsx';
import store from '../../redux/store';
import { useState, useEffect } from 'react'
import { convertMinsToHrsMins } from '../helperFunctions'
import Form from 'react-bootstrap/Form'
import { Multiselect } from 'multiselect-react-dropdown';
import moment from 'moment';
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const state = store.getState();


const isWeekEnd = (date) => {

  let start_time = state.storeReducer.store.storeHours[(date.getDay()+6)%7].open_time
  return start_time == null;
}

const isRestTime = (date) => {

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
  const { startDate } = restProps;

  if (isWeekEnd(startDate)) {
    return <MonthView.TimeTableCell {...restProps}  className={classes.weekEndCell} />;
  }
  return <MonthView.TimeTableCell {...restProps} />;
});

const TimeTableCellWeek = withStyles(styles, { name: 'TimeTableCell' })(({ classes, ...restProps }) => {
  const { startDate } = restProps;

  if (isRestTime(startDate)) {
    return <WeekView.TimeTableCell {...restProps} className={classes.weekEndCell} />;
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
  const { startDate } = restProps;

  if (isRestTime(startDate)) {
    return <DayView.TimeTableCell {...restProps} className={classes.weekEndCell} />;
  }
  return <DayView.TimeTableCell {...restProps} />;
});

const DayScaleCellDay = withStyles(styles, { name: 'DayScaleCell' })(({ classes, ...restProps }) => {
  const { startDate } = restProps;
  // Calendar.demoFunction()
  if (isWeekEnd(startDate)) {
    return <DayView.DayScaleCell {...restProps}  className={classes.weekEndDayScaleCell} />;
  }
  return <DayView.DayScaleCell {...restProps} />;
});


const CreateStartTimesForDay = (props) => {
   const state = store.getState();
   let start_time = state.storeReducer.store.storeHours

    let items = [];

     for (let i = 0; i < 1440; i += 15) {
       items.push(<option key={i} value={i}>{convertMinsToHrsMins(i)}</option>);

     }
     return items;
 }

 function timeConvert(n) {

     var num = n;
     var hours = (num / 60);
     var rhours = Math.floor(hours);
     var minutes = (hours - rhours) * 60;
     var rminutes = minutes;
     return [rhours, rminutes];
   }


function convertServices (service_map) {

  let services = state.serviceReducer.services
  let options = []
  services.map((service, indx) => {
    options.push({id: service.id, text: service.name})
    service_map[service.id] = {name: service.name, duration: service.duration, price: service.cost}

  })

  return options

}

function convertWorkers (worker_map, worker_to_services) {

  let workers = state.workerReducer.workers
  let options = []
  workers.map((worker, indx) => {
      options.push({id: worker.id, text: worker.first_name + ' ' + worker.last_name})
      worker_map[worker.id] = worker.first_name + ' ' + worker.last_name
      worker_to_services[worker.id] = worker.services
  })

  return options

}

function ifStoreOpen(time, duration) {

  let hours = state.storeReducer.store.storeHours
  let day = (time.getDay()-1)%7

  console.log(day, hours[day].close_time, (time.getHours()*60 + time.getMinutes() + duration))

  if(hours[day].open_time != null && hours[day].open_time <= (time.getHours()*60 + time.getMinutes()) &&
  hours[day].close_time != null && hours[day].close_time >= (time.getHours()*60 + time.getMinutes() + duration)) {
    return true
  }
  else {
    return false
  }

}

function ifTimeValid(time, duration, service, workers) {

    //if startTime or endTime (start_time + duration) outside of store hours
    if(!ifStoreOpen(time, duration)) {
      return false
    }

    //if time outside of selected worker hours


    //if double booking -- this worker has another appointment at the same time


    //if worker doesn't give this service


    return true
}


const BasicLayout = ({ appointmentData, onFieldChange, groups,
   ...restProps }) => {

     console.log(">>", appointmentData, state.workerReducer.workers)

   let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
   let date = appointmentData.startDate

   let service_map = []
   let worker_map = []
   let worker_to_services = []
   let services = convertServices(service_map)
   let workers = convertWorkers(worker_map, worker_to_services)

   let apps_len = appointmentData.other_appointments ? appointmentData.other_appointments.length : 0
   const [openCards, setOpen] = useState(new Array(apps_len).fill(false));
   const [openAddition, setOpenAddition] = useState(false);
   const multiselectWorkerRef = React.createRef()
   const multiselectServiceRef = React.createRef()

   const onServiceChange = (selectedList, selectedItem, index) => {

     if(index != null) {
       let new_apps = appointmentData.other_appointments
       new_apps[index].services = selectedItem.id
       onFieldChange({ other_appointments: new_apps });
     }
     else {
       onFieldChange({ services: selectedItem.id });
     }

   };

   // console.log(appointmentData.other_appointments[0].startDate)

   const onWorkerChange = (selectedList, selectedItem, index) => {

     if(index != null) {
       let new_apps = appointmentData.other_appointments
       new_apps[index].workers = selectedItem.id
       onFieldChange({ other_appointments: new_apps });
     }
     else {
       onFieldChange({ workers: selectedItem.id });
     }


   };

   const onCustomFieldChangeEmail = (nextValue) => {
     onFieldChange({ email: nextValue });
   };

   const updateCollapse = index => e => {

    let newArr = [...openCards];
    newArr[index] = !openCards[index];
    setOpen(newArr);
  }

  const addAppointment = (duration, price) => {

    let new_apps = appointmentData.other_appointments
    let added = {startDate: appointmentData.startDate, price: price, duration: duration, services: appointmentData.services, workers: appointmentData.workers}
    if(new_apps) {
      new_apps.push(added)
    }
    else {
      new_apps = [added]
    }
    onFieldChange({ other_appointments: new_apps, services: '', workers: '' });
    multiselectWorkerRef.current.resetSelectedValues();
    multiselectServiceRef.current.resetSelectedValues();
  }

  const deleteAppointment = (index) => {

    let new_apps = appointmentData.other_appointments
    new_apps.splice(index, 1);

    onFieldChange({ other_appointments: new_apps });
  }

   const handleTimeChange = (index, date, duration, service, worker) => e => {

     let value = e.target.value
     let new_apps = appointmentData.other_appointments
     let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(value)[0], timeConvert(value)[1])

     console.log(index)
     if(index != null) {


       new_apps[index].startDate = newDate
       onFieldChange({ other_appointments: new_apps });

       if(!ifTimeValid(newDate, duration, service, worker)) {
          console.log("BOOOOOO")
       }

     }

     else {

       onFieldChange({ startDate: newDate });

     }

   }


  return (

    <Container >
    <Col>
      <Col style={{marginBottom: '5%', marginTop: '5%'}}>
      <p style={{ fontSize: 18}}>Appointment Details</p>
      <b> {months[date.getMonth()]} {date.getDate()}, {date.getFullYear()} </b>
      </Col>


      {appointmentData.other_appointments ? appointmentData.other_appointments.map((appointment, indx) => (

        <Col style={{border: '0.5px solid #DCDCDC', borderRadius: 3}} key={indx}>
          <Col style={{height: 35}} onClick={updateCollapse(indx)}
            aria-controls="example-collapse-text"
            aria-expanded={openCards[indx]}>
              <h6 style={{padding: 8}}> {service_map[appointment.services].name} ({service_map[appointment.services].duration} minutes at ${appointment.price}) with {worker_map[appointment.workers]} </h6>
          </Col>
          <Collapse in={openCards[indx]} style={{margin: '3%', marginBottom: '5%'}}>

            <Form className="rounded">

              <Form.Group controlId="formHoursMonday">

                <p style={{marginBottom: 15}}><b>Time</b></p>
                <Form.Control as="select" value={new Date(appointment.startDate).getHours()*60 + new Date(appointment.startDate).getMinutes()} onChange={handleTimeChange(indx, date, service_map[appointment.services].duration, appointment.services, appointment.workers)}>
                  <CreateStartTimesForDay day={(date.getDay()-1)%7}/>
                </Form.Control>

                <p style={{marginBottom: 15, marginTop: 15}}><b>Service</b></p>
                <Multiselect
                  options={services}
                  singleSelect={true}
                  selectedValues={[{text: service_map[appointment.services].name, id: appointment.services}]}
                  onSelect={async (selectedList, selectedItem) => onServiceChange(selectedList, selectedItem, indx)}
                  placeholder="Choose a service..."
                  closeIcon="cancel"
                  displayValue="text"
                  avoidHighlightFirstOption={true}
                  style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { color: 'white', background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                />

                <p style={{marginBottom: 15, marginTop: 15}}><b>Stylist</b></p>
                <Multiselect
                  options={workers}
                  singleSelect={true}
                  selectedValues={[{text: worker_map[appointment.workers], id: appointment.workers}]}
                  onSelect={async (selectedList, selectedItem) => onWorkerChange(selectedList, selectedItem, indx)}
                  placeholder="Choose a stylist..."
                  closeIcon="cancel"
                  displayValue="text"
                  avoidHighlightFirstOption={true}
                  style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { color: 'white', background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                />
                <Button onClick={() => deleteAppointment(indx)}> Delete </Button>
                </Form.Group>
                </Form>
            </Collapse>
        </Col>

      )): null}

      <Col style={{border: '0.5px solid #DCDCDC', borderRadius: 3}} >
        <Col style={{height: 35}} onClick={() => setOpenAddition(!openAddition)}
          aria-controls="example-collapse-text"
          aria-expanded={openAddition}>
            <h6 style={{padding: 8}}> Add Appointment </h6>
        </Col>
        <Collapse in={openAddition} style={{margin: '3%', marginBottom: '5%'}}>

          <Form className="rounded">

            <Form.Group controlId="formHoursMonday">

              <p style={{marginBottom: 15}}><b>Time</b></p>
              <Form.Control as="select" value={appointmentData.startDate.getHours()*60 + appointmentData.startDate.getMinutes()} onChange={handleTimeChange(null, date)}>
                <CreateStartTimesForDay day={date.getDay()-1}/>
              </Form.Control>


              <p style={{marginBottom: 15, marginTop: 15}}><b>Service</b></p>
              <Multiselect
                options={services}
                singleSelect={true}
                ref={multiselectServiceRef}
                // selectedValues={[{text: service_map[appointmentData.services].name, id: appointmentData.services}]}
                onSelect={async (selectedList, selectedItem) => onServiceChange(selectedList, selectedItem)}
                placeholder="Choose a service..."
                closeIcon="cancel"
                displayValue="text"
                avoidHighlightFirstOption={true}
                style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { color: 'white', background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
              />

              <p style={{marginBottom: 15, marginTop: 15}}><b>Stylist</b></p>
              <Multiselect
                options={workers}
                singleSelect={true}
                ref={multiselectWorkerRef}
                // selectedValues={[{text: worker_map[appointmentData.workers], id: appointmentData.workers}]}
                onSelect={async (selectedList, selectedItem) => onWorkerChange(selectedList, selectedItem)}
                placeholder="Choose a stylist..."
                closeIcon="cancel"
                displayValue="text"
                avoidHighlightFirstOption={true}
                style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { color: 'white', background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
              />
              <Button onClick={() => addAppointment(service_map[appointmentData.services].duration, service_map[appointmentData.services].price)}> Add </Button>

              </Form.Group>
              </Form>

          </Collapse>
      </Col>

      <Card style={{marginTop: '5%'}}>
      <Card.Body>
        Client
      </Card.Body>
      </Card>
     </Col>
    </Container>
  )}

  const messages = {
    allDayLabel : '',
    repeatLabel : '',
    moreInformationLabel: '',
    detailsLabel: 'Appointment Date'
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

  const AppointmentTooltipContent = ({
    appointmentData,
    ...restProps }) => {

    // console.log(appointmentData)
    return  (
      <AppointmentTooltip.Content
        appointmentData={appointmentData}
        {...restProps}
      >

      </AppointmentTooltip.Content>
    );
  };



  class CalendarComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        appointments: [],
        // mainResourceName: 'workers',
        // currentDate: moment(new Date()).format('YYYY-MM-DD'),
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
      }
      this.commitChanges = this.commitChanges.bind(this);
      // this.changeMainResource = this.changeMainResource.bind(this);
      this.onAppointmentChanges = this.onAppointmentChanges.bind(this);
    }

    onAppointmentChanges(key, string) {
      // if(!key.hasOwnProperty("services")){
      //   return;
      // }
      //
      // let resources = this.state.resources
      // resources[1].instances = this.state.workers.filter(worker => this.state.worker_to_services[worker.id] && this.state.worker_to_services[worker.id].includes(key.services) ? worker : null);
      //
      // console.log(this.state.workers, resources[1].instances, key.services, this.state.worker_to_services)
      //
      // if(resources[1].instances.length == 0) {
      //   resources[1].instances = [{id: 0, text: "No available employees"}]
      // }
      //
      // this.setState({
      //   resources: resources
      // })
    }


    // changeMainResource(mainResourceName) {
    //   this.setState({ mainResourceName });
    // }

    // onSearch() {
    //   let includeWorker;
    //   let includeService;
    //   let newSelected = [];
    //
    //   this.state.appointments.map(appointment => {
    //     includeWorker = (this.state.selectedWorkers.length === 0) ? true : false;
    //     includeService= (this.state.selectedServices.length === 0) ? true : false;
    //
    //     // console.log(this.state.selectedWorkers, this.state.selectedServices);
    //
    //     this.state.selectedWorkers.map(worker => {
    //       if(appointment.workers === worker.id) {
    //         includeWorker = true;
    //       }
    //
    //       return worker
    //     })
    //
    //     this.state.selectedServices.map(service => {
    //       if(appointment.services === service.id) {
    //         includeService = true;
    //       }
    //
    //       return service
    //     })
    //
    //     if(includeService && includeWorker) {
    //       newSelected.push(appointment);
    //     }
    //
    //     return appointment
    //   })
    //
    //   this.setState({ selectedAppointments: newSelected });
    // }

    async commitChanges({ added, changed, deleted }) {

      if(deleted !== undefined) {

        let selectedAppointments = this.state.selectedAppointments;
        let appointment_id = null;

        selectedAppointments.map((appointment, indx) => {
          appointment_id = deleted === appointment.id ? indx : appointment_id;
          return appointment
        });

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

            this.onSearch()
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
          email: added.email,
        }

        this.props.addAppointment(this.state.store_id, values)
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
            store_id: parseInt(this.state.store_id)
          }],
          email: selectedAppointments[appointment_id].email,
        }

        fetch(fetchDomain + '/stores/' + this.state.store_id + '/appointments/update', {
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
                  email: data.email,
                  group_id: data.group_id
                }) : appointment))
            });

            this.onSearch()
          }
        });
      }
    }


    render() {

      // let resources;
      // if(this.state.resources[1].instances.length>0) {
      //   resources = [this.state.resources[0], this.state.resources[1]]
      // }
      // else {
      //      resources = this.state.resources
      // }
      return (

          <Paper className="react-calendar">
          <Scheduler
           data={this.props.appointments}

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
           <DateNavigator
           />
           <TodayButton />
           <ConfirmationDialog />
           <Appointments
           appointmentComponent={Appointment}/>

           <AppointmentTooltip
           showCloseButton
           showOpenButton
           contentComponent={AppointmentTooltipContent}
           />
           <AppointmentForm
           isRecurrence={false}
           basicLayoutComponent={BasicLayout}
           recurrenceLayoutComponent={RecurrenceLayout}
           textEditorComponent={TextEditor}
           messages={messages}
           booleanEditorComponent={BooleanEditor}

           />

           <DragDropProvider/>
          </Scheduler>
          </Paper>
        )
    }
}


export default CalendarComponent;

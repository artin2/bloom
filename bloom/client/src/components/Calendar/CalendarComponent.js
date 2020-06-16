import React from 'react';
import {Card, Col, Row, Container} from 'react-bootstrap'
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


const BasicLayout = ({ appointmentData, onFieldChange, groups,
   ...restProps }) => {

     console.log(">>", appointmentData, restProps, appointmentData.startDate)

   let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
   let date = appointmentData.startDate


   const onCustomFieldChange = (nextValue) => {
     onFieldChange({ price: nextValue });
   };

   const onCustomFieldChangeEmail = (nextValue) => {
     onFieldChange({ email: nextValue });
   };

   const handleSelectChange = (event) => {

     let value = event.target.value
        console.log(timeConvert(value))
     let oldDate = appointmentData.startDate
     let newDate = new Date(oldDate.getFullYear(), oldDate.getMonth(), oldDate.getDate(), timeConvert(value)[0], timeConvert(value)[1])

     onFieldChange({ startDate: newDate });
   }

  return (

    <Container >
    <Col>
      <p style={{marginTop: '5%', fontSize: 18}}>Appointment Details</p>
      <b> {months[date.getMonth()]} {date.getDate()}, {date.getFullYear()} </b>
      <Card className="mt-5">
        <Card.Body>
          <Form className="rounded">


            <Form.Group controlId="formHoursMonday">

              <p style={{marginBottom: 15}}><b>Time</b></p>
              <Form.Control as="select" value={appointmentData.startDate.getHours()*60 + appointmentData.startDate.getMinutes()} onChange={handleSelectChange}>
                <CreateStartTimesForDay day={date.getDay()-1}/>
              </Form.Control>


              <p style={{marginBottom: 15, marginTop: 15}}><b>Service</b></p>
              <Multiselect
                options={["boo"]}
                // onSelect={async (selectedList, selectedItem) => this.onChange(selectedList, selectedItem, setFieldValue)}
                // onRemove={async (selectedList, removedItem) => this.onChange(selectedList, removedItem, setFieldValue)}
                placeholder="Choose a service..."
                closeIcon="cancel"
                displayValue="name"
                avoidHighlightFirstOption={true}
                style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
              />

              <p style={{marginBottom: 15, marginTop: 15}}><b>Stylist</b></p>
              <Multiselect
                options={["boo"]}
                // onSelect={async (selectedList, selectedItem) => this.onChange(selectedList, selectedItem, setFieldValue)}
                // onRemove={async (selectedList, removedItem) => this.onChange(selectedList, removedItem, setFieldValue)}
                placeholder="Choose a stylist..."
                closeIcon="cancel"
                displayValue="name"
                avoidHighlightFirstOption={true}
                style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
              />
              </Form.Group>
              </Form>



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

    console.log(appointmentData)
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
      if(!key.hasOwnProperty("services")){
        return;
      }

      let resources = this.state.resources
      resources[1].instances = this.state.workers.filter(worker => this.state.worker_to_services[worker.id] && this.state.worker_to_services[worker.id].includes(key.services) ? worker : null);

      console.log(this.state.workers, resources[1].instances, key.services, this.state.worker_to_services)

      if(resources[1].instances.length == 0) {
        resources[1].instances = [{id: 0, text: "No available employees"}]
      }

      this.setState({
        resources: resources
      })
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

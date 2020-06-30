import React from 'react';
import {Card, Col, Row, Container, Collapse, Button} from 'react-bootstrap'
import {  Resources, ConfirmationDialog, Scheduler, AppointmentForm, AppointmentTooltip, DateNavigator,TodayButton, DayView, WeekView, MonthView, Appointments, ViewSwitcher, Toolbar,  DragDropProvider} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import 'react-calendar/dist/Calendar.css';
import './CalendarPage.css';
import Paper from '@material-ui/core/Paper';
import store from '../../redux/store';
import moment from 'moment';
import { TimeTableCell, TimeTableCellDay, TimeTableCellWeek, DayScaleCell, DayScaleCellDay, DayScaleCellWeek, Appointment, AppointmentTooltipContent } from './CalendarSubComponents'
import { BasicLayout } from './CalendarFormComponent'
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Multiselect } from 'multiselect-react-dropdown';
import { FiSearch} from 'react-icons/fi';
import { addNewAppointment, deleteAppointment, updateAppointment } from './CalendarHelper.js'
import {getArray} from './CalendarPage'
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;
const state = store.getState();


  class CalendarComponent extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        appointments: [],
      }
      this.commitChanges = this.commitChanges.bind(this);
    }


    async commitChanges({ added, changed, deleted }) {

      if(deleted !== undefined) {

        let selectedAppointments = this.props.appointments;
        let appointment_id = null;

        selectedAppointments.map((appointment, indx) => {
          appointment_id = deleted === appointment.id ? indx : appointment_id;
          return appointment
        });

        let group_id = selectedAppointments[appointment_id].group_id;

        this.props.deleteAppointment(group_id)


      }


      if(added) {

        let values = {
          store_id: this.props.store_id,
          email: added.email,
          appointments: [],
          user_id: null
        }

        added.other_appointments.map((appointment) => {
          values.appointments.push({
            price: appointment.price,
            worker_id: appointment.workers,
            service_id: appointment.services,
            start_time: appointment.startDate.getHours()*60 + appointment.startDate.getMinutes(),
            end_time: appointment.startDate.getHours()*60 + appointment.startDate.getMinutes() + appointment.duration,
            date: added.startDate
          })

        })

        this.props.addNewAppointment(this.props.store_id, values)
      }

      if(changed) {

        let selectedAppointments = this.props.appointments;
        let appointment_id = null, id = null;

        selectedAppointments.map((appointment, indx) => {
          id = changed[appointment.id] ? appointment.id : id;
          appointment_id = changed[appointment.id] ? indx : appointment_id;

          return appointment
        });


        let values = {
          store_id: parseInt(this.props.store_id),
          email: changed[id].email ? changed[id].email : selectedAppointments[appointment_id].email,
          appointments: [],
          user_id: null,
          group_id: selectedAppointments[appointment_id].group_id
        }

        let appointments = changed[id].other_appointments ? changed[id].other_appointments : selectedAppointments[appointment_id].other_appointments


            appointments.map((appointment) => {

              let startTime = new Date(appointment.startDate)
              let endTime = new Date(appointment.endDate)


              values.appointments.push({
                id: appointment.id,
                price: appointment.price,
                worker_id: appointment.workers,
                service_id: appointment.services,
                start_time: startTime.getHours()*60 + startTime.getMinutes(),
                end_time: (!appointment.duration) ? endTime.getHours()*60 + endTime.getMinutes() : startTime.getHours()*60 + startTime.getMinutes() + appointment.duration,
                date: appointment.startDate,
              })
            })

        this.props.updateAppointment(this.props.store_id, values)
      }

    }

    render() {

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

           <Toolbar
           // flexibleSpaceComponent={ToolbarComponent}
           />
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
           // contentComponent={AppointmentTooltipContent}
           />
           <AppointmentForm
           isRecurrence={false}
           basicLayoutComponent={BasicLayout}

           />

           <DragDropProvider/>
          </Scheduler>
          </Paper>
        )
    }
}

const mapDispatchToProps = dispatch => bindActionCreators({

  updateAppointment: (store_id, values) => updateAppointment(store_id, values),
  deleteAppointment: (group_id) => deleteAppointment(group_id),
  addNewAppointment: (store_id, values) => addNewAppointment(store_id, values)
}, dispatch)



export default connect(null, mapDispatchToProps)(CalendarComponent);

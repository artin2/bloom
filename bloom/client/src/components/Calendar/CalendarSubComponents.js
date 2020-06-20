
import React from 'react';
import {Card, Col, Row, Container, Collapse, Button} from 'react-bootstrap'
import {  Resources, ConfirmationDialog, Scheduler, AppointmentForm, AppointmentTooltip, DateNavigator,TodayButton, DayView, WeekView, MonthView, Appointments, ViewSwitcher, Toolbar,  DragDropProvider} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import store from '../../redux/store';
import { withStyles, Theme, createStyles } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import classNames from 'clsx';
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

export const DayScaleCell = withStyles(styles)(({
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

export const TimeTableCell = withStyles(styles, { name: 'TimeTableCell' })(({ classes, data, ...restProps }) => {
  const { startDate } = restProps;

  if (isWeekEnd(startDate)) {
    return <MonthView.TimeTableCell {...restProps}  className={classes.weekEndCell} />;
  }
  return <MonthView.TimeTableCell {...restProps} />;
});

export const TimeTableCellWeek = withStyles(styles, { name: 'TimeTableCell' })(({ classes, ...restProps }) => {
  const { startDate } = restProps;

  if (isRestTime(startDate)) {
    return <WeekView.TimeTableCell {...restProps} className={classes.weekEndCell} />;
  }
  return <WeekView.TimeTableCell {...restProps} />;
});

export const DayScaleCellWeek = withStyles(styles, { name: 'DayScaleCell' })(({ classes, ...restProps }) => {
  const { startDate } = restProps;
  if (isWeekEnd(startDate)) {
    return <WeekView.DayScaleCell {...restProps} className={classes.weekEndDayScaleCell} />;
  }
  return <WeekView.DayScaleCell {...restProps} />;
});


export const TimeTableCellDay = withStyles(styles, { name: 'TimeTableCell' })(({ classes, data, ...restProps }) => {
  const { startDate } = restProps;

  if (isRestTime(startDate)) {
    return <DayView.TimeTableCell {...restProps} className={classes.weekEndCell} />;
  }
  return <DayView.TimeTableCell {...restProps} />;
});

export const DayScaleCellDay = withStyles(styles, { name: 'DayScaleCell' })(({ classes, ...restProps }) => {
  const { startDate } = restProps;

  if (isWeekEnd(startDate)) {
    return <DayView.DayScaleCell {...restProps}  className={classes.weekEndDayScaleCell} />;
  }
  return <DayView.DayScaleCell {...restProps} />;
});


export const Appointment = ({
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

// export const AppointmentTooltipContent = ({
//   appointmentData,
//   ...restProps }) => {
//
//   // console.log(appointmentData)
//   return  (
//     <AppointmentTooltip.Content
//       appointmentData={appointmentData}
//       {...restProps}
//     >
//
//     </AppointmentTooltip.Content>
//   );
// };

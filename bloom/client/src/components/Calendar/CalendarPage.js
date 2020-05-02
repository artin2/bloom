import React from 'react';
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import './CalendarPage.css';
import {  Resources, ConfirmationDialog, Scheduler, AppointmentForm, AppointmentTooltip, DateNavigator,TodayButton, DayView, WeekView, MonthView, Appointments, ViewSwitcher, Toolbar,  DragDropProvider} from '@devexpress/dx-react-scheduler-material-ui';
import { ViewState, EditingState, IntegratedEditing } from '@devexpress/dx-react-scheduler';
import 'react-calendar/dist/Calendar.css';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Multiselect } from 'multiselect-react-dropdown';
import { FiSearch} from 'react-icons/fi';
import { withRouter } from "react-router"
const fetchDomain = process.env.NODE_ENV === 'production' ? process.env.REACT_APP_FETCH_DOMAIN_PROD : process.env.REACT_APP_FETCH_DOMAIN_DEV;

const today = new Date();

//new Date(2018, 6, 1, 10, 0) start and end dates

const isWeekEnd = (date: Date): boolean => date.getDay() === 0 || date.getDay() === 6;



const Root = ({
  children, style, ...restProps
}) => (
  <div
    {...restProps}
    style={{
      ...style,
      width: '1000px',
    }}
  >
    {children}
  </div>
);


const DayScaleCell = ({
  startDate, classes, ...restProps
}: DayScaleCellProps) => (
  <MonthView.DayScaleCell
    // className={classNames({
    //   [classes.weekEndDayScaleCell]: isWeekEnd(startDate),
    // })}
    className={isWeekEnd(startDate) ? 'weekend' : null}

    // style={isWeekEnd(startDate) ? 'background-color: grey' : 'background-color: white'}
    startDate={startDate}
    {...restProps}
  />
);

const TimeTableCell = (
  { startDate, classes, ...restProps }: TimeTableCellProps,
) => (
  <MonthView.TimeTableCell
    className={isWeekEnd(startDate) ? 'weekend' : null}

    startDate={startDate}
    {...restProps}
  />
);
const recurringIcon = () => <div />

const BasicLayout = ({ appointmentData, onFieldChange,
   ...restProps }) => {

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
  repeatLabel : ''
}

const BooleanEditor = ({
...restProps }) => {
  // eslint-disable-next-line react/destructuring-assignment
  // console.log(restProps);

return null;
  // if (restProps.type === 'endRepeat') {
  //   console.log("BO");
  //   return null;
  //
  // } else {console.log("HELO"); return <AppointmentForm.WeeklyRecurrenceSelectorComponent readOnly={true} {...restProps} />};
};

const ResourceSwitcher = ({ styles,
    mainResourceName, onChange, classes, resources,
  }) => (
    <div >
      <Row className="justify-content-center text-xs-center text-sm-left pl-2">
      <p style={{fontSize: 20, marginRight:10, marginTop:2}}>
        Filter By:
      </p>
      <Select
        value={mainResourceName}
        onChange={e => onChange(e.target.value)}
        style={{paddingLeft: 60, height: 35}}
      >
        {resources.map(resource => (
          <MenuItem key={resource.fieldName} value={resource.fieldName}>
            {resource.title}
          </MenuItem>
        ))}
      </Select>
      </Row>
    </div>

  );


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
  // console.log(restProps);
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
         services: [],
         workers: [],
         worker_map: {},
         service_map: {},
         selectedWorkers: [],
         selectedServices: [],
         selectedAppointments: [
           // { id: '0', startDate: '2020-04-19 15:00', endDate: '2020-04-19 16:00', title: 'Manicure', workers: [2],
           // services: [2], price: 50},
           // { id: '1', startDate: '2020-04-21 09:00', endDate: '2020-04-21 11:00', title: 'Hair Blowout', workers: [0, 1],
           // services: [1], price: 20},
         ],
         appointments: [
           // { id: '0', startDate: '2020-04-19 15:00', endDate: '2020-04-19 16:00', title: 'Manicure', workers: [2],
           // services: [2], price: 50},
           // { id: '1', startDate: '2020-04-21 09:00', endDate: '2020-04-21 11:00', title: 'Hair Blowout', workers: [0, 1],
           //  services: [1], price: 20},
         ],
         mainResourceName: 'workers',
          resources: [
            {
              fieldName: 'services',
              title: 'Services',
              allowMultiple: true,
              instances: [
                // { id: 1, text: 'Haircut' },
                // { id: 2, text: 'Manicure' },

              ],
            },
            {
              fieldName: 'workers',
              title: 'Workers',
              allowMultiple: true,
              instances: [
                // { id: 0, text: 'Artin Kasumyan' },
                // { id: 1, text: 'Arthur Kasumyan' },
                // { id: 2, text: 'Roula Sharqawe' },
                // { id: 3, text: 'George Clooney' },
                // { id: 4, text: 'Johnny Depp' },
              ],
            },
          ],
         currentDate: today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
       }
       this.commitChanges = this.commitChanges.bind(this);
       this.changeMainResource = this.changeMainResource.bind(this);
       this.onSelectWorker = this.onSelectWorker.bind(this);
       this.onRemoveWorker = this.onRemoveWorker.bind(this);
       this.onSelectService = this.onSelectService.bind(this);
       this.onRemoveService = this.onRemoveService.bind(this);
       this.onSearch = this.onSearch.bind(this);
  }

    getAppointments = () => {

        fetch('fetchDomain/stores/' + this.props.match.params.store_id + '/appointments' , {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(value => value.json())
        .then(data => {

          let appointments = []

          data.map((appointment, indx) => {

              let date = new Date(appointment.date);
              let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointment.start_time, 0);
              let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), appointment.end_time, 0);

              console.log(startDate)

              appointments.push({
                id: indx,
                title: appointment.title,
                workers: [this.state.worker_map[appointment.worker_id]],
                services: [this.state.service_map[appointment.service_id]],
                price: appointment.price,
                startDate: startDate,
                endDate: endDate
              })

              this.setState({
                appointments: appointments,
                selectedAppointments: appointments

              })

            })
        })
    }

    async componentDidMount() {
      let store_id = this.props.match.params.store_id
      let workers = []
      let services = []
      let new_workers = []
      let new_services = []

      //fetching  workers and services
      if(this.props.location.state && this.props.location.state.services) {
        let service_map = {}
        let service_instances = []

        this.props.location.state.services.map((service, indx) => {
          service_instances.push({id: indx, text: service.name})
          service_map[service.id] = service.name
        })

        this.setState({
          services: this.props.location.state.store.services,
          service_map: service_map
        })
      }
      else {

          await fetch('fetchDomain/stores/' + store_id + "/services", {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(function (response) {
            if (response.status !== 200) {
              // throw an error alert
              console.log("error")
            }
            else {
              return response.json();
            }
          })
          .then(async data => {
            if (data) {
              services = data;
              let service_instances = []
              let service_map = {}
              console.log("here!!", services);

              services.map((service, indx) => {
                    service_instances.push({id: indx, text: service.name})
                    service_map[service.id] = service.name
              })

              this.setState({
                  services: services,
                  service_map: service_map
              })

              // return new_services;
            }
          });

      }

      if(this.props.location.state && this.props.location.state.workers){
        let worker_instances = []
        let worker_map = {}
        this.props.location.state.workers.map((worker, indx) => {
            worker_instances.push({id: indx, text: worker.first_name + ' ' + worker.last_name})
            worker_map[worker.id] = worker.first_name + ' ' + worker.last_name
        })
        this.setState({
          workers: worker_instances,
          worker_map: worker_map
        })
      }
      else{


        await fetch('fetchDomain/stores/' + store_id + '/workers_list', {
          method: "GET",
          headers: {
            'Content-type': 'application/json'
          },
          credentials: 'include'
        }).then(function (response) {
            if (response.status !== 200) {
              // throw an error alert
              console.log("error")
            }
            else {
              return response.json();
            }
          })
          .then(async data => {
            if (data) {
              workers = data;
              console.log("here", workers);
              let worker_instances = []
              let worker_map = {}
              workers.map((worker, indx) => {
                  worker_instances.push({id: indx, text: worker.first_name + ' ' + worker.last_name})
                  worker_map[worker.id] = worker.first_name + ' ' + worker.last_name
              })
              this.setState({
                workers: worker_instances,
                worker_map: worker_map
              })
            }
          });

      }

      new_services = this.state.resources[0]
      new_services.instances = this.state.services;
      new_workers = this.state.resources[1]
      new_workers.instances = this.state.workers;

      this.setState({
        resources: [new_services, new_workers]
      })

      this.getAppointments();

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
      includeWorker = (this.state.selectedWorkers.length==0) ? true : false;
      includeService= (this.state.selectedServices.length==0) ? true : false;

      this.state.selectedWorkers.map(worker => {

        if(appointment.workers.includes(worker.id)) {
          includeWorker = true;
        }
      })
      this.state.selectedServices.map(service => {

        if(appointment.services.includes(service.id)) {
          includeService = true;
        }
      })

      if(includeService && includeWorker) {
        newSelected.push(appointment);
      }
    })
    this.setState({ selectedAppointments: newSelected });
  }


  commitChanges({ added, changed, deleted }) {
    this.setState((state) => {
      let { selectedAppointments } = state;
      let appointments = selectedAppointments;
      if (added) {
        const startingAddedId = appointments.length > 0 ? appointments[appointments.length - 1].id + 1 : 0;
        appointments = [...appointments, { id: startingAddedId, ...added }];
      }
      if (changed) {
        appointments = appointments.map(appointment => (
          changed[appointment.id] ? { ...appointment, ...changed[appointment.id] } : appointment));
      }
      if (deleted !== undefined) {
        appointments = appointments.filter(appointment => appointment.id !== deleted);
      }
      return { appointments };
    });
  }



  render() {

    console.log(this.state.selectedAppointments);
    return (
      <Container fluid>
        <Row className="justify-content-center">
          <Col>
            <p className="title"> Manage Your Appointments </p>
            <Row style={{marginBottom: 50, marginLeft: '22%', position: 'relative'}}>
            <Multiselect
              // isObject={false}
              options={this.state.resources[0]["instances"]}
              // selectedValues={this.state.selected}
              onSelect={this.onSelectService}
              onRemove={this.onRemoveService}
              placeholder="Service"
              closeIcon="cancel"
              displayValue="text"
              style={{multiselectContainer: {marginLeft: '2%', width: '35%'},  groupHeading:{width: 50, maxWidth: 50}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: 250, width: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
              />
            <Multiselect
                // isObject={false}
                options={this.state.resources[1]["instances"]}
                // selectedValues={this.state.selected}
                onSelect={this.onSelectWorker}
                onRemove={this.onRemoveWorker}
                placeholder="Workers"
                closeIcon="cancel"
                displayValue="text"
                style={{multiselectContainer: {marginLeft: '2%', width: '35%'},  optionContainer:{ zIndex: 10000000}, chips: { background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: 250, width: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
              />
              <FiSearch onClick={this.onSearch} size={35} style={{cursor: "pointer", marginLeft: 10, paddingRight:"10px"}}/>
            </Row>

           <Paper className="react-calendar">
          <Scheduler
            data={this.state.selectedAppointments}

          >
          <ViewState
            defaultCurrentDate={this.state.currentDate}

          />
          <EditingState
           onCommitChanges={this.commitChanges}
         />
         <IntegratedEditing />

            <WeekView
             startDayHour={8}
             endDayHour={24}
             cellDuration={60}
           />
           <MonthView
             dayScaleCellComponent={DayScaleCell}
             timeTableCellComponent={TimeTableCell}
          />
          <DayView
            startDayHour={8}
            endDayHour={24}
            cellDuration={60}
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
            showOpenButton/>
            <AppointmentForm
            isRecurrence={false}
            basicLayoutComponent={BasicLayout}
            recurrenceLayoutComponent={RecurrenceLayout}
            // textEditorComponent={TextEditor}
            messages={messages}
            booleanEditorComponent={BooleanEditor}
            />
            <Resources
              data={this.state.resources}
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

export default withRouter(Calendar);

// <ResourceSwitcher
//  resources={this.state.resources}
//  mainResourceName={this.state.mainResourceName}
//  onChange={this.changeMainResource}
// />

import React from 'react';
import {Card, Col, Row, Container, Collapse, Button} from 'react-bootstrap'
import store from '../../redux/store';
import { useState, useEffect } from 'react'
import { convertMinsToHrsMins } from '../helperFunctions'
import Form from 'react-bootstrap/Form'
import { Multiselect } from 'multiselect-react-dropdown';
import {getArray} from './CalendarPage'
import InputGroup from 'react-bootstrap/InputGroup'
import { FaEnvelope, FaUser, FaAngleDown, FaAngleUp} from 'react-icons/fa';
import {AiFillWarning} from 'react-icons/ai'
import { AppointmentForm, ConfirmationDialog } from '@devexpress/dx-react-scheduler-material-ui';
import { Typeahead } from 'react-bootstrap-typeahead';


function timeConvert(n) {

     var num = n;
     var hours = (num / 60);
     var rhours = Math.floor(hours);
     var minutes = (hours - rhours) * 60;
     var rminutes = minutes;
     return [rhours, rminutes];
}


function ifStoreOpen(time, duration) {

  let hours = getArray("store").storeHours
  let day = (time.getDay()-1)%7

  if(hours[day].open_time != null && hours[day].open_time <= (time.getHours()*60 + time.getMinutes()) &&
  hours[day].close_time != null && hours[day].close_time >= (time.getHours()*60 + time.getMinutes() + duration)) {
    return true
  }
  else {
    return false
  }

}

function ifWorkerFree(time, duration, workers) {

  let hours = getArray("worker_map")[workers].workerHours
  let day = (time.getDay()-1)%7

  if(hours[day].start_time != null && hours[day].start_time <= (time.getHours()*60 + time.getMinutes()) &&
  hours[day].end_time != null && hours[day].end_time >= (time.getHours()*60 + time.getMinutes() + duration)) {
    return true
  }
  else {
    return false
  }

}

function ifDoubleBooked(time, workers, current_apps, index, duration) {

  let date = new Date(time.getFullYear(), time.getMonth(), time.getDate())
  let startTime = (time.getHours()*60 + time.getMinutes())
  let appointments = getArray("app_to_worker")[[date, workers]]

  if(appointments) {

    for(let i = 0; i < appointments.length; i++) {

      if((appointments[i][0] == startTime) || (appointments[i][0] < startTime && appointments[i][1] > startTime)) {
        return true
      }
    }

  }

  console.log(current_apps, startTime)

  if(current_apps) {
    for(let i=0; i<current_apps.length; i++) {

      let current_start = new Date(current_apps[i].startDate)
      let converted_start = current_start.getHours()*60 + current_start.getMinutes()
      let current_end = new Date(current_apps[i].endDate)
      let converted_end = current_end.getHours()*60 + current_end.getMinutes()

      console.log(converted_start, converted_end, startTime+duration, index, index, i)
      if(index!=null && index == i) {
        continue
      }


      if((converted_start == startTime) || (converted_start < startTime && converted_end > startTime)
          || (startTime < converted_start && startTime+duration > converted_start)) {
        return true
      }

    }
  }

  return false

}



function matchingService(service, worker) {

  if(!getArray("worker_to_services")[worker].includes(service)) {
    return false
  }
  return true
}

function ifTimeValid(time, duration, service, worker, current_apps, index) {

    let warnings = []
       //if startTime or endTime (start_time + duration) outside of store hours
    if(!ifStoreOpen(time, duration)) {
      warnings.push(0)
    }

    //if time outside of selected worker hours
    if(!ifWorkerFree(time, duration, worker)) {
      warnings.push(1)
    }


    //if double booking -- this worker has another appointment at the same time
    if(ifDoubleBooked(time,  worker, current_apps, index, duration)) {
      warnings.push(2)
    }

    //if worker doesn't give this service
    if(!matchingService(service, worker)) {
      warnings.push(3)
    }

  return warnings
}


export const CommandComponent = ({ appointmentData, getMessage, disableSaveButton,
  children,
   ...restProps }) => {

     console.log(appointmentData, disableSaveButton, children)
     return (
       <AppointmentForm.CommandLayout
        getMessage={() => "save"}
        {...restProps}


      >

      </AppointmentForm.CommandLayout>

     )

}

// export const CommandButtonComponent = ({ getMessage,  children,
//    ...restProps }) => {
//
//      // console.log(appointmentData)
//      return (
//        <AppointmentForm.CommandButtonLayout
//         getMessage={() => "save"}
//         {...restProps}
//
//
//       >
//
//       </AppointmentForm.CommandButtonLayout>
//
//      )
//
// }

export const ConfirmationComponent = ({ appointmentData, handleConfirm, isDeleting,
   ...restProps }) => {

     console.log(appointmentData)
     return (
       <ConfirmationDialog.Layout

        {...restProps}
        handleConfirm={() => {
          if(!isDeleting) {
            appointmentData.other_appointments = []

          }
          console.log(isDeleting)
          handleConfirm()
        }
      }

      >

      </ConfirmationDialog.Layout>

     )

}

export const BasicLayout = ({ appointmentData, onFieldChange,
   ...restProps }) => {

   let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
   let date = appointmentData.startDate

   // console.log(Object.keys(appointmentData.clients))

   let apps_len = appointmentData.other_appointments ? appointmentData.other_appointments.length : 0
   let clients = getArray("clients")
   const [openCards, setOpen] = useState(new Array(apps_len).fill(false));
   const [openAddition, setOpenAddition] = useState(false);
   const [openClient, setOpenClient] = useState(false);
   const [first_name, setFirstName] = useState()
   const [last_name, setLastName] = useState()
   const [new_email, setNewEmail] = useState()
   const [email, setEmail] = useState([(appointmentData.email) ? appointmentData.email : '' ]);
   const multiselectWorkerRef = React.createRef()
   const multiselectServiceRef = React.createRef()
   const [emailOptions, addEmailOption] = useState(Object.keys(clients))
   const onServiceChange = (selectedList, selectedItem, index, date, worker) => {

     if(index != null) {
       let new_apps = appointmentData.other_appointments
       new_apps[index].services = selectedItem.id
       new_apps[index].duration = getArray("service_map")[selectedItem.id].duration
            console.log(date)
       new_apps[index].warnings = ifTimeValid(date, new_apps[index].duration, selectedItem.id, worker, new_apps, index)
       onFieldChange({ other_appointments: new_apps });
     }
     else {
       onFieldChange({ services: selectedItem.id });
     }

   };


   const onWorkerChange = (selectedList, selectedItem, index, date, duration, service) => {

     if(index != null) {
       let new_apps = appointmentData.other_appointments
       new_apps[index].workers = selectedItem.id
       new_apps[index].warnings = ifTimeValid(date, duration, service, selectedItem.id, new_apps, index)
       onFieldChange({ other_appointments: new_apps });
     }
     else {
       onFieldChange({ workers: selectedItem.id });
     }


   };

   const updateCollapse = index => e => {

    let newArr = [...openCards];
    newArr[index] = !openCards[index];
    setOpen(newArr);
  }

  const addAppointment = (duration, price) => {

    let new_apps = appointmentData.other_appointments
    let warnings = ifTimeValid(appointmentData.startDate, duration, appointmentData.services, appointmentData.workers, new_apps)
    let endDate = new Date(appointmentData.startDate.getFullYear(), appointmentData.startDate.getMonth(), appointmentData.startDate.getDate(), appointmentData.startDate.getHours(), appointmentData.startDate.getMinutes() + parseInt(duration))


    let added = {startDate: appointmentData.startDate, price: price, duration: duration, services: appointmentData.services, workers: appointmentData.workers, warnings: warnings, endDate: endDate}
    let added_id = appointmentData.added
    let len = new_apps ? new_apps.length : 0;

    if(added_id) {
      added_id.push(len)
    }
    else {
      added_id = [len]
    }

    if(new_apps) {
      new_apps.push(added)
    }
    else {
      new_apps = [added]
    }

    onFieldChange({ other_appointments: new_apps, services: '', workers: '', added: added_id, startDate: appointmentData.startDate});
    multiselectWorkerRef.current.resetSelectedValues();
    multiselectServiceRef.current.resetSelectedValues();

  }

  const deleteAppointment = (index) => {

    let new_apps = appointmentData.other_appointments
    new_apps.splice(index, 1);
    let deleted_id = appointmentData.deleted
    if(deleted_id) {
      deleted_id.push(appointmentData.id)
    }
    else {
      deleted_id = [appointmentData.id]
    }

    onFieldChange({ other_appointments: new_apps, deleted: deleted_id});
  }

  const handleFirstName = e => {
    // onFieldChange({ first_name: e.target.value });
    setFirstName(e.target.value)
  }

  const handleLastName = e => {
    // onFieldChange({ last_name: e.target.value });
    setLastName(e.target.value)
  }

  const handleNotes = e => {
    onFieldChange({ notes: e.target.value });
  }

  const updateEmail = email => {

    setEmail(email)
    let client = getArray("clients")[email[0]]

    if(client) {
      onFieldChange({ email: email[0], first_name: client.first_name, last_name: client.last_name });
    }


  }

  const handleNewEmailChange = e => {
    setNewEmail(e.target.value)
  }

  const addNewClient = () => {

    console.log(first_name)
    onFieldChange({ first_name: first_name });
    onFieldChange({ last_name: last_name });
    onFieldChange({ email: new_email });
    setEmail([new_email])
    setFirstName([])
    setLastName([])
    setNewEmail([])
    let newOptions = emailOptions
    newOptions.push(new_email)
    addEmailOption(newOptions)

  }

   const handleTimeChange = (index, date, duration, service, worker) => e => {

     let value = e.target.value
     let new_apps = appointmentData.other_appointments
     let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(value)[0], timeConvert(value)[1])

     if(index != null) {

       console.log(newDate)
       new_apps[index].startDate = newDate
       let endTime = timeConvert(parseInt(value) + parseInt(duration))
       new_apps[index].endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime[0], endTime[1])
       new_apps[index].warnings = ifTimeValid(newDate, duration, service, worker, new_apps, index)
       onFieldChange({ other_appointments: new_apps });

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
          <Col style={{height: 35, color: (appointment.warnings && appointment.warnings.length>0) ? '#ffcc00' : 'black'}} onClick={updateCollapse(indx)}
            aria-controls="example-collapse-text"
            aria-expanded={openCards[indx]}
            >

              <h6 style={{padding: 8, cursor: 'pointer'}}>
              {(appointment.warnings && appointment.warnings.length>0) ? (<AiFillWarning style={{position: 'absolute', left:  '1%'}}/>) : null}
               <b>{getArray("service_map")[appointment.services].name}</b> ({getArray("service_map")[appointment.services].duration} minutes at ${appointment.price}) with <b>{getArray("worker_map")[appointment.workers].name}</b>

                {(openCards[indx]) ?  (<FaAngleUp style={{position: 'absolute', right:  '1%'}}/>) :  (<FaAngleDown style={{position: 'absolute', right:  '1%'}}/>)}

              </h6>

          </Col>
          <Collapse in={openCards[indx]} style={{margin: '3%', marginBottom: '5%'}}>

            <Form className="rounded">

              <Form.Group controlId="formHoursMonday">

                <p style={{marginBottom: 15}}><b>Time</b></p>
                <Form.Control as="select" value={new Date(appointment.startDate).getHours()*60 + new Date(appointment.startDate).getMinutes()} onChange={handleTimeChange(indx, date, getArray("service_map")[appointment.services].duration, appointment.services, appointment.workers)}>
                  <CreateStartTimesForDay day={(date.getDay()-1)%7}/>
                </Form.Control>

                <p style={{marginBottom: 15, marginTop: 15}}><b>Service</b></p>
                <Multiselect
                  options={getArray("serviceOptions")}
                  singleSelect={true}
                  selectedValues={[{text: getArray("service_map")[appointment.services].name, id: appointment.services}]}
                  onSelect={async (selectedList, selectedItem) => onServiceChange(selectedList, selectedItem, indx, appointment.startDate, appointment.workers)}
                  placeholder="Choose a service..."
                  closeIcon="cancel"
                  displayValue="text"
                  avoidHighlightFirstOption={true}
                  style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { color: 'white', background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                />

                <p style={{marginBottom: 15, marginTop: 15}}><b>Stylist</b></p>
                <Multiselect
                  options={getArray("workerOptions")}
                  singleSelect={true}

                  selectedValues={[{text: getArray("worker_map")[appointment.workers].name, id: appointment.workers}]}
                  onSelect={async (selectedList, selectedItem) => onWorkerChange(selectedList, selectedItem, indx, appointment.startDate, getArray("service_map")[appointment.services].duration, appointment.services)}
                  placeholder="Choose a stylist..."
                  closeIcon="cancel"
                  displayValue="text"
                  avoidHighlightFirstOption={true}
                  style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { color: 'white', background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                />
                <Col style={{marginTop: '5%', color: '#ffcc00'}}>
                {(appointment.warnings && appointment.warnings.includes(0)) ? (<p> This appointment is outside of your store hours. Please pick another time/day. </p>) : null}
                {(appointment.warnings && appointment.warnings.includes(1)) ? (<p> {getArray("worker_map")[appointment.workers].name} does not work during this time, please pick another stylist. </p>) : null}
                {(appointment.warnings && appointment.warnings.includes(2)) ? (<p> This appointment conflicts with another appointment. Change the time or stylist to avoid the double-booking. </p>) : null}
                {(appointment.warnings && appointment.warnings.includes(3)) ? (<p> {getArray("worker_map")[appointment.workers].name} does not offer {getArray("service_map")[appointment.services].name} please pick another stylist or service. </p>) : null}
                </Col>
                <Button  style={{width: 100, marginTop: '5%', color: '#5A7096',  border: 'solid 2px #5A7096', backgroundColor: 'white'}} onClick={() => deleteAppointment(indx)}> Delete </Button>
                </Form.Group>
                </Form>
            </Collapse>
        </Col>

      )): null}

      <Col style={{border: '0.5px solid #DCDCDC', borderRadius: 3}} >
        <Col style={{height: 35}} onClick={() => setOpenAddition(!openAddition)}
          aria-controls="example-collapse-text"
          aria-expanded={openAddition}>
            <h6 style={{padding: 8}}> + Appointment </h6>
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
                options={getArray("serviceOptions")}
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
                options={getArray("workerOptions")}
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
              <Button style={{width: 100, marginTop: '5%', color: '#5A7096', border: 'solid 2px #5A7096', backgroundColor: 'white'}} onClick={() => addAppointment(getArray("service_map")[appointmentData.services].duration, getArray("service_map")[appointmentData.services].price)}> Add </Button>

              </Form.Group>
              </Form>

          </Collapse>
      </Col>
      <Col style={{border: '0.5px solid #DCDCDC', borderRadius: 3, marginTop: '5%', padding: '5%'}}>
          <b> Client </b>

          <Typeahead
            id="basic-typeahead-single"
            style={{width: '90%', marginTop:'5%', marginLeft: '5%'}}
            labelKey="email"
            onChange={updateEmail}
            options={emailOptions}
            placeholder="Email"
            selected={email}
            // onBlur={handleBlur}
            // className={touched.email && errors.email ? "error" : null}
          />

          <Col style={{border: '0.5px solid #DCDCDC', borderRadius: 3, marginTop: '5%'}} >
          <Col style={{height: 35}} onClick={() => setOpenClient(!openClient)}
            aria-controls="example-collapse-text"
            aria-expanded={openClient}>
              <h6 style={{padding: 8}}> + New Client </h6>
          </Col>
          <Collapse in={openClient} style={{margin: '3%', marginBottom: '5%'}}>

            <Col >

            <Row className="justify-content-md-center">

              <Form.Group controlId="formFirstName">
                <InputGroup>
                  <InputGroup.Prepend>
                      <InputGroup.Text>
                          <FaUser/>
                      </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control
                    type="text"
                    name="first_name"
                    value={first_name}
                    placeholder="First Name"
                    onChange={handleFirstName}
                     style={{width: 150}}
                    // onBlur={handleBlur}
                    // className={touched.first_name && errors.first_name ? "error" : null}
                    />
                </InputGroup>

              </Form.Group>


              <Form.Group controlId="formLastName">
                <InputGroup>
                  <InputGroup.Prepend>
                      <InputGroup.Text>
                          <FaUser/>
                      </InputGroup.Text>
                  </InputGroup.Prepend>
                  <Form.Control type="text"
                  value={last_name}
                  placeholder="Last Name"
                  name="last_name"
                  style={{width: 150}}
                  onChange={handleLastName}
                  // onBlur={handleBlur}
                  // className={touched.last_name && errors.last_name ? "error" : null}
                  />
                </InputGroup>

              </Form.Group>

              </Row>
            <Form.Group controlId="formEmail">
              <InputGroup>
                <InputGroup.Prepend>
                  <InputGroup.Text>
                    <FaEnvelope />
                  </InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control type="email"
                value={new_email}
                placeholder="Email"
                name="new_email"
                style={{width: 150}}
                onChange={handleNewEmailChange}
                // onBlur={handleBlur}
                // className={touched.last_name && errors.last_name ? "error" : null}
                />


              </InputGroup>
            </Form.Group>
            <Button style={{width: 100, color: '#5A7096', border: 'solid 2px #5A7096', backgroundColor: 'white'}} onClick={() => addNewClient()}> Add </Button>
            </Col>
            </Collapse>
          </Col>

      </Col>



      <Card style={{marginTop: '5%', marginBottom: '15%'}}>
      <Card.Body>

       <b> Notes </b>
       <Col style={{marginTop: '5%'}}>
       <Form.Group controlId="formNotes">
         <InputGroup>

           <Form.Control
             type="notes"
             value={appointmentData.notes}
             placeholder="Leave a note..."
             name="note"
             style={{height: 80}}
             onChange={handleNotes}

             // onBlur={handleBlur}
             // className={touched.email && errors.email ? "error" : null}
           />
         </InputGroup>
       </Form.Group>
       </Col>
      </Card.Body>
      </Card>
     </Col>
    </Container>
  )}

  const CreateStartTimesForDay = (props) => {

     let start_time = getArray("store").storeHours

      let items = [];

       for (let i = 0; i < 1440; i += 15) {
         items.push(<option key={i} value={i}>{convertMinsToHrsMins(i)}</option>);

       }
       return items;
}

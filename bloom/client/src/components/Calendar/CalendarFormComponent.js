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

const state = store.getState();

function timeConvert(n) {

     var num = n;
     var hours = (num / 60);
     var rhours = Math.floor(hours);
     var minutes = (hours - rhours) * 60;
     var rminutes = minutes;
     return [rhours, rminutes];
}


function ifStoreOpen(time, duration) {

  let hours = state.storeReducer.store.storeHours
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

function ifDoubleBooked(time, workers) {

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

  return false

}



function matchingService(service, worker) {

  if(!getArray("worker_to_services")[worker].includes(service)) {
    return false
  }
  return true
}

function ifTimeValid(time, duration, service, worker) {

    //if startTime or endTime (start_time + duration) outside of store hours
    if(!ifStoreOpen(time, duration)) {
      return false
    }

    //if time outside of selected worker hours
    if(!ifWorkerFree(time, duration, worker)) {
      return false
    }


    //if double booking -- this worker has another appointment at the same time
    if(ifDoubleBooked(time,  worker)) {
      return false
    }

    //if worker doesn't give this service
    if(!matchingService(service, worker)) {
        return false
    }


    return true
}


export const BasicLayout = ({ appointmentData, onFieldChange, groups,
   ...restProps }) => {

   let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
   let date = appointmentData.startDate

   let apps_len = appointmentData.other_appointments ? appointmentData.other_appointments.length : 0
   const [openCards, setOpen] = useState(new Array(apps_len).fill(false));
   const [openAddition, setOpenAddition] = useState(false);
   const multiselectWorkerRef = React.createRef()
   const multiselectServiceRef = React.createRef()

   const onServiceChange = (selectedList, selectedItem, index) => {

     if(index != null) {
       let new_apps = appointmentData.other_appointments
       new_apps[index].services = selectedItem.id
       new_apps[index].duration = getArray("service_map")[selectedItem.id].duration
       onFieldChange({ other_appointments: new_apps });
     }
     else {
       onFieldChange({ services: selectedItem.id });
     }

   };


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

    if(!ifTimeValid(appointmentData.startDate, duration, appointmentData.services, appointmentData.workers)) {
       console.log("Show warning!")
    }

  }

  const deleteAppointment = (index) => {

    let new_apps = appointmentData.other_appointments
    new_apps.splice(index, 1);

    onFieldChange({ other_appointments: new_apps });
  }

  const handleEmailChange = e => {

    onFieldChange({ email: e.target.value });
  }

   const handleTimeChange = (index, date, duration, service, worker) => e => {

     let value = e.target.value
     let new_apps = appointmentData.other_appointments
     let newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), timeConvert(value)[0], timeConvert(value)[1])

     if(index != null) {

       new_apps[index].startDate = newDate
       let endTime = timeConvert(parseInt(value) + parseInt(duration))
       new_apps[index].endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endTime[0], endTime[1])
       onFieldChange({ other_appointments: new_apps });

       if(!ifTimeValid(newDate, duration, service, worker)) {
          console.log("Show warning")
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
              <h6 style={{padding: 8, cursor: 'pointer'}}> <b>{getArray("service_map")[appointment.services].name}</b> ({getArray("service_map")[appointment.services].duration} minutes at ${appointment.price}) with <b>{getArray("worker_map")[appointment.workers].name}</b>

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
                  onSelect={async (selectedList, selectedItem) => onServiceChange(selectedList, selectedItem, indx)}
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
                  onSelect={async (selectedList, selectedItem) => onWorkerChange(selectedList, selectedItem, indx)}
                  placeholder="Choose a stylist..."
                  closeIcon="cancel"
                  displayValue="text"
                  avoidHighlightFirstOption={true}
                  style={{multiselectContainer: { width: '100%'},  groupHeading:{width: 100, maxWidth: 100}, chips: { color: 'white', background: "#587096", height: 35 }, inputField: {color: 'black'}, searchBox: { minWidth: '100%', height: '30', backgroundColor: 'white', borderRadius: "5px" }} }
                />
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

      <Card style={{marginTop: '5%'}}>
      <Card.Body>
        <b> Client </b>

        <Col style={{marginTop: '5%'}}>

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
                value={''}
                placeholder="First Name"

                // onChange={handleChange}
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
              value={''}
              placeholder="Last Name"
              name="last_name"

              // onChange={handleChange}
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
            <Form.Control
              type="email"
              value={appointmentData.email}
              placeholder="Email"
              name="email"
              onChange={handleEmailChange}

              // onBlur={handleBlur}
              // className={touched.email && errors.email ? "error" : null}
            />
          </InputGroup>
        </Form.Group>
        </Col>

      </Card.Body>
      </Card>

      <Card style={{marginTop: '5%', marginBottom: '15%'}}>
      <Card.Body>

       <b> Notes </b>
       <Col style={{marginTop: '5%'}}>
       <Form.Group controlId="formNotes">
         <InputGroup>

           <Form.Control
             type="notes"
             value={''}
             placeholder="Leave a note..."
             name="note"
             style={{height: 80}}
             // onChange={handleEmailChange}

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
     const state = store.getState();
     let start_time = state.storeReducer.store.storeHours

      let items = [];

       for (let i = 0; i < 1440; i += 15) {
         items.push(<option key={i} value={i}>{convertMinsToHrsMins(i)}</option>);

       }
       return items;
}

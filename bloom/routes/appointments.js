const helper = require('../helper.js')
const db = require('../db.js');
const auth = require('../auth.js');

async function getAppointmentsForUser(req, res) {
  console.log("about to get appointments for user")
  console.log("user_id is: ", req.params.user_id)

  db.client.connect((err, client, done) => {
    let query = 'SELECT store_id, date, start_time, end_time, price, group_id, service_id FROM appointments WHERE user_id=$1 ORDER BY group_id DESC'
    let values = [req.params.user_id]
    console.log("values is: ", values)
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the appointments
        if (result && result.rows.length > 0) {
          console.log("first query was successful")
          console.log(result.rows)

          let stores = []
          let dates =[]
          let start_times = []
          let end_times = []
          let costs = []
          let group_ids = []
          let service_ids = []
          let curr_group_services = []
          let grouped_service_ids = []
          let i = 1
          let group_id = result.rows[0].group_id
          let earliest_start_time = result.rows[0].start_time
          let latest_end_time = result.rows[0].end_time
          let cost = result.rows[0].price
          curr_group_services.push(result.rows[0].service_id)
          service_ids.push(result.rows[0].service_id)
          while(i < result.rows.length) {
            if(result.rows[i].group_id != group_id) {
              stores.push(result.rows[i-1].store_id)
              dates.push(result.rows[i-1].date)
              group_ids.push(group_id)
              start_times.push(earliest_start_time)
              end_times.push(latest_end_time)
              costs.push(cost)
              grouped_service_ids.push(curr_group_services)
              curr_group_services = []
              group_id = result.rows[i].group_id
              earliest_start_time = result.rows[i].start_time
              latest_end_time = result.rows[i].end_time
              cost = result.rows[i].price
            } else {
              if(result.rows[i].start_time < earliest_start_time) {
                earliest_start_time = result.rows[i].start_time
              }
              if(result.rows[i].end_time > latest_end_time) {
                latest_end_time = result.rows[i].end_time
              }
              cost += result.rows[i].price
            }
            curr_group_services.push(result.rows[i].service_id)
            service_ids.push(result.rows[i].service_id)
            i += 1
          }
          stores.push(result.rows[i-1].store_id)
          dates.push(result.rows[i-1].date)
          start_times.push(earliest_start_time)
          end_times.push(latest_end_time)
          costs.push(cost)
          group_ids.push(group_id)
          grouped_service_ids.push(curr_group_services)

          console.log("stores are: ", stores)
          console.log("dates are: ", dates)
          console.log("start times are: ", start_times)
          console.log("end_times are: ", end_times)
          console.log("costs are: ", costs)
          console.log("group_ids are: ", group_ids)
          console.log("service_ids are: ", service_ids)
          getServiceMappings(res, service_ids, (service_name_mappings) => {
            console.log("service mappings are: ", service_name_mappings)
            getStoreNameMappings(res, stores, (store_name_mappings) => {
              let response = {
                store_name_mappings: store_name_mappings,
                store_ids: stores,
                dates: dates,
                start_times: start_times,
                end_times: end_times,
                costs: costs,
                group_ids: group_ids,
                service_name_mappings: service_name_mappings,
                grouped_service_ids: grouped_service_ids
              }
              console.log("everything sucessful, sending: ", response)
              helper.querySuccess(res, response, 'Successfully got appointment display info!');
            })
          })
        }
        else if(result) {
          helper.querySuccess(res, {}, 'No appointments exist for user!');
        }
        else {
          helper.queryError(res, "Could not retrieve appointments!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
}

async function getServiceMappings(res, service_ids, callback) {
  console.log("about to get service mappings")

  db.client.connect((err, client, done) => {
    var params = [];
    for(var i = 1; i <= service_ids.length; i++) {
      params.push('$' + i);
    }
    //get the service mappings for our appointment
    query = 'SELECT id, name FROM services WHERE id IN (' + params.join(',') + ')'
    values = service_ids
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the service mappings
        if (result) {
          console.log("got results: ", result)
          callback(result.rows)
        }
        else {
          helper.queryError(res, "Could not retrieve service mappings!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
}

function getStoreNameMappings(res, stores, callback) {
  console.log("about to get store name mappings")

  db.client.connect((err, client, done) => {
    //get the store name mappings
    var params = [];
    for(var i = 1; i <= stores.length; i++) {
      params.push('$' + i);
    }
    query = 'SELECT id, name FROM stores WHERE id IN (' + params.join(',') + ')'
    values = stores
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the store name
        if (result && result.rows.length > 0) {
          callback(result.rows)
        }
        else {
          helper.queryError(res, "Could not retrieve the store name mappings!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
}

//REFACTOR BELOW IN THE FUTURE TO USE CALLBACKS.
async function getAppointmentsForDisplay(req, res) {
  console.log("about to get appointment info")
  console.log("group_id is: ", req.params.group_id)
  let service_ids = []
  let worker_ids = []
  let store_id = 0
  let cost = 0
  let start_time = 0
  let end_time = 0
  let user_id = 0

  db.client.connect((err, client, done) => {
    let query = 'SELECT user_id, store_id, worker_id, service_id, date, start_time, end_time, price FROM appointments WHERE group_id=$1 ORDER BY start_time ASC'
    let values = [req.params.group_id]
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the appointments
        if (result) {
          console.log("first query was successful")
          start_time = result.rows[0].start_time
          end_time = result.rows[result.rows.length - 1].end_time
          store_id = result.rows[0].store_id
          for (let i = 0; i < result.rows.length; i++) {
            cost += result.rows[i].price
            service_ids.push(result.rows[i].service_id)
            worker_ids.push(result.rows[i].worker_id)
          }
          user_id = result.rows[0].user_id
          getWorkerNames(res, result.rows, user_id, start_time, end_time, store_id, cost, service_ids, worker_ids)
        }
        else {
          helper.queryError(res, "Could not retrieve appointments!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
};

function getWorkerNames(res, appointment, user_id, start_time, end_time, store_id, cost, service_ids, worker_ids) {
  let worker_names = []
  console.log("about to get names")
  console.log("previous results go us: ")
  console.log("appointment: ", appointment)
  console.log("start_time: ", start_time)
  console.log("end_time: ", end_time)
  console.log("store_id: ", store_id)
  console.log("cost: ", cost)
  console.log("service_ids: ", service_ids)
  console.log("worker_ids: ", worker_ids)

  db.client.connect((err, client, done) => {
    var params = [];
    for(var i = 1; i <= worker_ids.length; i++) {
      params.push('$' + i);
    }
    //get the worker names that serve our appointment
    query = 'SELECT first_name, last_name FROM workers WHERE id IN (' + params.join(',') + ')'
    values = worker_ids
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the worker names
        if (result) {
          worker_names = result.rows.map(name => name.first_name+ ' ' + name.last_name)
          getServiceNames(res, appointment, user_id, start_time, end_time, store_id, cost, service_ids, worker_names)
        }
        else {
          helper.queryError(res, "Could not retrieve worker names!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
}

function getServiceNames(res, appointment, user_id, start_time, end_time, store_id, cost, service_ids, worker_names) {
  console.log("about to get service names")
  console.log("previous results go us: ")
  console.log("worker_names: ", worker_names)
  let service_names = []

  db.client.connect((err, client, done) => {
    var params = [];
    for(var i = 1; i <= service_ids.length; i++) {
      params.push('$' + i);
    }
    //get the service names for our appointment
    query = 'SELECT name FROM services WHERE id IN (' + params.join(',') + ')'
    values = service_ids
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the service names
        if (result) {
          service_names = result.rows.map(service => service.name)
          getStoreName(res, appointment, user_id, start_time, end_time, store_id, cost, service_names, worker_names)
        }
        else {
          helper.queryError(res, "Could not retrieve service names!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
}

function getStoreName(res, appointment, user_id, start_time, end_time, store_id, cost, service_names, worker_names) {
  console.log("about to get store name")
  console.log("previous results go us: ")
  console.log("service_names: ", service_names)
  let store_name = ''

  db.client.connect((err, client, done) => {
    //get the store name
    query = 'SELECT name FROM stores WHERE id=$1'
    values = [store_id]
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to retrieve the store name
        if (result) {
          store_name = result.rows[0].name
          let response = {
            appointment: appointment,
            user_id: user_id,
            start_time: start_time,
            end_time: end_time,
            store_name: store_name,
            cost: cost,
            service_names: service_names,
            workers: worker_names
          }
          console.log("everything sucessful, sending: ", response)
          helper.querySuccess(res, response, 'Successfully got appointment display info!');
        }
        else {
          helper.queryError(res, "Could not retrieve the store name!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
}

async function deleteAppointment(req, res) {
  console.log("about to delete appointments")
  console.log("group_id is: ", req.params.group_id)

  db.client.connect((err, client, done) => {
    let query = 'DELETE FROM appointments where group_id=$1'
    let values = [req.params.group_id]
    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to delete the appointment
        if (result) {
          console.log("delete query was successful", result)
          helper.querySuccess(res, req.params.group_id, 'Successfully deleted appointment')
        }
        else {
          helper.queryError(res, "Could not retrieve appointments!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
};

async function updateAppointment(req, res) {
  let appointment = req.body.appointment[0];

  db.client.connect((err, client, done) => {

    let query = 'UPDATE appointments SET user_id=$1, worker_id=$2, service_id=$3, store_id=$4, date=$5, start_time=$6, end_time=$7, price=$8 WHERE id=$9 RETURNING *'
    let values = [req.body.user_id, appointment.worker_id, appointment.service_id, appointment.store_id, appointment.date, appointment.start_time, appointment.end_time, appointment.price, appointment.id]

    db.client.query(query, values, (err, result) => {
      done()
        if (err) {
          helper.queryError(res, err);
        }
        // we were able to delete the appointment
        if (result && result.rows.length > 0) {
          console.log("update appointment was successful", result)
          helper.querySuccess(res, result.rows[0], 'Successfully updated appointment')
        }
        else {
          console.log("error!!!!", res)
          helper.queryError(res, "Could not update appointments!");
        }
      }
    );

    if (err) {
      helper.dbConnError(res, err);
    }
  });
};

async function getUsersPreviousStoreAppointmentsInternal(email, store_id) {
  console.log("about to get appointments for user")
  console.log("email is: ", email)

  try{
    let query = 'SELECT * FROM appointments WHERE email=$1 AND store_id=$2 AND CAST(date as DATE) < CAST($3 as DATE)'
    console.log("query is:", query)
    let values = [email, store_id, new Date().toUTCString()]
    console.log("values are", values)
    
    return new Promise(function(resolve, reject) {
      db.client.connect((err, client, done) => {
        db.client.query(query, values, (err, result) => {
          console.log("2,")
          done()
          if (err) {
            console.log("3 error,", err)
            reject(err)
          }
    
          console.log("results,", result.rows)
          resolve(result.rows)
        });
    
        if (err) {
          console.log("4 error,", err)
          reject(err)
        }
      });
    })
  }
  catch(err){
    console.log("Some sort of error!", err);
    reject(err)
  }
}

module.exports = {
  getAppointmentsForUser: getAppointmentsForUser,
  getAppointmentsForDisplay: getAppointmentsForDisplay,
  deleteAppointment: deleteAppointment,
  updateAppointment: updateAppointment,
  getUsersPreviousStoreAppointmentsInternal: getUsersPreviousStoreAppointmentsInternal
};

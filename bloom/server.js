const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require("path")
const passport = require('passport');
const db = require('./db.js');
const auth = require('./auth.js');
const helper = require('./helper.js')
const stores = require('./routes/stores.js');
const appointments = require('./routes/appointments.js')
const users = require('./routes/users.js');
const jwt = require('jsonwebtoken');
const s3 = require('./routes/s3');
const fileUpload = require('express-fileupload')


require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'client/build')));
app.use(fileUpload())

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGIN_PROD : process.env.ALLOWED_ORIGIN_DEV);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Access-Control-Allow-Origin, Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

// //CITATION https://medium.com/@faizanv/authentication-for-your-react-and-express-application-w-json-web-tokens-923515826e0
const secret = process.env.JWT_SECRET;
const withAuth = function(req, res, next) {
const token = req.cookies.token;


  if (!token) {
    console.log("No token")
    res.status(401).send('Unauthorized: No token provided');
  } else {
    jwt.verify(token, secret, function(err, decoded) {
      if (err) {
        res.status(401).send('Unauthorized: Invalid token');
      } else {
        req.email = decoded.email;
        // console.log("verified, email is: ", decoded.email)  //why is this printing undefined?
        next();
      }
    });
  }
}
module.exports = withAuth;

app.post('/signUp', async (req, res) => {
  console.log('hit the user signup route')
  await users.signup(req, res);
});

app.post('/login', async (req, res) => {
  console.log('hit the users.login route')
  await users.login(req, res);
});

app.post('/users/:id', withAuth, async (req, res, next) => {
  console.log('hit the users.edit route')
  await users.edit(req, res, next);
});

app.get('/allUsers', withAuth, async (req, res, next) => {
  console.log('hit the all users route')
  await users.getUsers(req, res, next);
});

app.get('/checkToken', withAuth, function(req, res) {
  console.log("hit the check token route")
  //if it gets in here, that means withAuth passed and your token is valid
  res.sendStatus(200);
});

app.post('/checkTokenAndPermissions', withAuth, async(req, res, next) => {
  console.log("hit the check token with permissions route")
  try{
    let store = await stores.getStoreInfo(req.body.store_id)

    if(store.owners.includes(req.body.user_id)){
      res.sendStatus(200)
    }
    else if(req.body.worker_id){
      let worker = await stores.getWorkerInfo(req.body.worker_id)

      if(worker.user_id == req.body.user_id){
        res.sendStatus(200)
      }
      else{
        res.status(401).send('Unauthorized: You are not allowed access!');
      }
    }
    else{
      res.status(401).send('Unauthorized: You are not allowed access!');
    }
  }catch{
    res.status(401).send('Unable to verify!');
  }
});

// app.get('/workerByUserId/:user_id', withAuth, function(req, res) {
//   console.log('hit the all users route')
//   await users.getUsers(req, res, next);
// });


//**** STORE ROUTES ****//

app.get('/stores/users/:user_id', withAuth, async (req, res, next) => {
  console.log("hit the getUserStores route")
  await stores.getUserStores(req, res, next);
});

//should this be a patch?
app.post('/stores/edit/:store_id', withAuth, async (req, res, next) => {
  console.log("hit the editStore route")
  await stores.editStore(req, res, next);
});

// store services
app.post('/stores/addService/:store_id', withAuth, async (req, res, next) => {
  console.log("hit the addService route")
  await stores.addService(req, res, next);
});

app.post('/stores/:store_id/services/:service_id', withAuth, async (req, res, next) => {
  console.log("hit the edit store service route")
  await stores.editService(req, res, next);
});

app.get('/stores/:store_id/services/:item_id', async (req, res, next) => {
  console.log("hit the getStoreItem route")
  await stores.getStoreItem(req, res, next, "services");
});

app.get('/stores/:store_id/services', async (req, res, next) => {
  console.log("hit the getStoreItems route")
  await stores.getStoreItems(req, res, next, "services");
});

// store workers
app.post('/stores/addWorker/:store_id', withAuth, async (req, res, next) => {
  console.log("hit the check token route")
  await stores.addWorker(req, res, next);
});

app.post('/stores/:store_id/workers/:item_id', withAuth, async (req, res, next) => {
  console.log("hit the check token route")
  await stores.editWorker(req, res, next);
});

app.get('/stores/:store_id/workers/schedules', async (req, res, next) => {
  console.log("hit the check token route")
  await stores.getWorkersSchedules(req, res, next);
});

app.get('/stores/:store_id/workers/:item_id', async (req, res, next) => {
  console.log("hit the getStoreItem route")
  await stores.getStoreItem(req, res, next, "workers");
});

app.get('/stores/:store_id/workers', async (req, res, next) => {
  console.log("hit the getStoreItems route")
  await stores.getStoreItems(req, res, next, "workers");
});


app.get('/stores/:store_id/workers/:worker_id/hours', async (req, res, next) => {
  console.log("hit the getIndividualWorkerHours route")
  await stores.getIndividualWorkerHours(req, res, next);
});

//stores
app.get('/stores/:store_id/categories', async (req, res, next) => {
  await stores.getCategories(req, res, next);
});

app.get('/stores/:store_id', async (req, res, next) => {
  console.log("hit the getStore")
  await stores.getStore(req, res, next);
});

app.get('/stores', async (req, res, next) => {
  console.log("hit the getStores route")
  await stores.getStores(req, res, next);
});

app.post('/addStore', withAuth, async (req, res, next) => {
  console.log("hit the addStore route")
  await stores.addStore(req, res, next);
});

app.get('/stores/:store_id/storeHours', async (req, res, next) => {
  console.log("hit the getStoreHours route")
  await stores.getStoreHours(req, res, next);
});

//appointments
app.post('/stores/:store_id/appointments/new', withAuth, async(req, res, next) => {
  console.log("hit the addAppointment route")
  await stores.addAppointment(req, res, next);
})

app.get('/stores/:store_id/appointments/month/:month', async(req, res, next) => {
  console.log("hit the getAppointmentsByMonth route")
  await stores.getAppointmentsByMonth(req, res, next);
})

app.get('/stores/:store_id/appointments', withAuth, async(req, res, next) => {
  await stores.getAllAppointments(req, res, next);
})

app.post('/stores/:store_id/appointments/update', withAuth, async(req, res, next) => {
  console.log("hit the updateAppointment route")
  await appointments.updateAppointment(req, res, next);
})

app.get('/appointments/display/:group_id', withAuth, async(req, res, next) => {
  console.log("hit the getAppointmentsForDisplay route")
  await appointments.getAppointmentsForDisplay(req, res, next);
})

app.get('/appointments/:user_id', withAuth, async(req, res, next) => {
  console.log("hit the getAppointmentsForUser route")
  await appointments.getAppointmentsForUser(req, res, next);
})

app.get('/appointments/delete/:group_id', withAuth, async(req, res, next) => {
  console.log("hit the deleteAppointment route")
  await appointments.deleteAppointment(req, res, next);
})



//s3
app.post('/getPresignedUrl', withAuth, async (req, res) => {
  console.log("hit the getPresignedUploadUrl route")
  await s3.getPresignedUploadUrl(req, res);
});

app.post('/getImages', async (req, res) => {
  console.log("hit the getImages route")
  await s3.getImages(req, res);
});

app.post('/deleteImages', withAuth, async (req, res) => {
  console.log("hit the deleteImages route")
  await s3.deleteImages(req, res);
});

app.post('/profiles/:user_id', async(req, res) => {
  console.log("hit the post profile pic route")
  console.log("req.body is: ", req.body)
  console.log("req.files is: ", req.files)
  helper.querySuccess(res, 'okay', "Successfuly got profile")
  // await s3.getImageObject(req, res)
})

app.delete('/profiles/:user_id', async(req, res) => {
  console.log("hit the delete profile pic route")
  console.log("req.body is: ", req.body)
  console.log("req.files is: ", req.files)
  helper.querySuccess(res, 'np', "Successfuly got profile")
  // await s3.getImageObject(req, res)
})

app.get('/profiles/:user_id', async(req, res) => {
  console.log("hit the get profile pic route")
  // console.log("req is: ", req)
  console.log("req.body is: ", req.body)
  console.log("req.files is: ", req.files)
  // let uploadFile = req.files.filepond
  // const fileName = req.files.filepond.name
  // console.log(uploadFile)
  // console.log(fileName)
  helper.querySuccess(res, 'sucess', "Successfuly got profile")
  // await s3.getProfilePic(req, res);
})


//Need to fix this: not sure what name of cookie is
// EDIT: don't think we even need this..
app.get('/clearCookie', (req, res) => {
  console.log("about to clear cookie")
  res.clearCookie('jwt_token').end();
  console.log('success')
  res.send('User Logged Out Successfully');
});

// Handles any requests that don't match the ones above
app.get('*', (req,res) =>{
  console.log("patch not matched, let react handle it")
  console.log("request is: ", req)
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});


let port = process.env.PORT || 8081;

app.listen(port, function () {
    console.log('Updated node Server is listening at port', port);
});

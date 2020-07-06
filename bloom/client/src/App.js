import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";
import Registration from './components/User/Registration';
import MainNavbar from './components/Navbar/MainNavbar';
import Homepage from './components/Home/Homepage';
import StaticPage from './components/StaticPages/StaticPage';
import SearchDisplay from './components/Search/SearchDisplay';
import ReservationPage from './components/Reservation/ReservationPage'
import './App.css';
import StoreSignupForm from './components/Store/StoreSignupForm';
import Calendar from './components/Calendar/CalendarPage';
import StoreDisplay from './components/Store/StoreDisplay';
import StoreEditForm from './components/Store/StoreEditForm';
import redirectWithoutAuth from './components/redirectWithoutAuth';
import redirectWithAuth from './components/redirectWithAuth';
import redirectWithPreviousReviewOrNoAppt from './components/redirectWithPreviousReviewOrNoAppt';
import EditProfileForm from './components/User/EditProfileForm';
import Profile from './components/User/Profile';
import UserStoresDashboard from './components/Store/UserStoresDashboard';
import AddWorkerForm from './components/Worker/AddWorkerForm';
import WorkerDashboard from './components/Worker/WorkerDashboard';
import WorkerDisplay from './components/Worker/WorkerDisplay';
import AddServiceForm from './components/Service/AddServiceForm';
import ServiceDashboard from './components/Service/ServiceDashboard';
import ServiceDisplay from './components/Service/ServiceDisplay';
import ServiceEditForm from './components/Service/ServiceEditForm';
import ReviewForm from './components/Review/ReviewForm';
import AppointmentDisplay from './components/Appointments/AppointmentDisplay';
import { handleLogout } from '../src/components/helperFunctions';
import UserAppointments from './components/Appointments/UserAppointments';
import NotFoundPage from './components/StaticPages/NotFoundPage';
import ResetPasswordPage from './components/User/ResetPasswordPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <div className="App">
      <Router>
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover />
        <MainNavbar/>
        <div className="App-body">
          <Switch>
            <Route exact path="/" component={Homepage} />
            <Route exact path="/about" component={StaticPage} />
            <Route path="/search" component={SearchDisplay} />

            <Route exact path="/login" component={redirectWithAuth(Registration)} />
            <Route exact path="/logout" component={handleLogout}/>
            <Route exact path="/signup" component={Registration} />
            <Route path="/users/edit/:user_id" component={redirectWithoutAuth(EditProfileForm)}/>
            <Route path="/users/:user_id/stores" component={redirectWithoutAuth(UserStoresDashboard)}/>
            <Route path="/users/:user_id/appointments" component={redirectWithoutAuth(UserAppointments)}/>
            <Route path="/users/:user_id" component={redirectWithoutAuth(Profile)}/>
            <Route path="/resetPassword/:email/:token" component={ResetPasswordPage}/>

            <Route exact path="/storeCalendar/:store_id" component={redirectWithoutAuth(Calendar)} />
            <Route path="/book/:store_id" component={ReservationPage} />
            <Route exact path="/store/signup" component={redirectWithoutAuth(StoreSignupForm)} />
            <Route path="/stores/edit/:store_id" component={redirectWithoutAuth(StoreEditForm)}/>

            <Route path="/stores/addService/:store_id" component={redirectWithoutAuth(AddServiceForm)}/>
            <Route path="/stores/:store_id/services/:service_id/edit" component={redirectWithoutAuth(ServiceEditForm)}/>
            <Route path="/stores/:store_id/services/:service_id" component={ServiceDisplay}/>
            <Route path="/stores/:store_id/services" component={redirectWithoutAuth(ServiceDashboard)}/>

            <Route path="/stores/addWorker/:store_id" component={redirectWithoutAuth(AddWorkerForm)}/>
            <Route path="/stores/:store_id/workers/:worker_id" component={WorkerDisplay}/>
            <Route path="/stores/:store_id/workers" component={redirectWithoutAuth(WorkerDashboard)}/>
            <Route path="/stores/:store_id/review" component={redirectWithPreviousReviewOrNoAppt(ReviewForm)}/>
            <Route path="/stores/:store_id" component={StoreDisplay}/>

            <Route path="/appointments/:group_id" component={redirectWithoutAuth(AppointmentDisplay)}/>

            <Route component={NotFoundPage}/>

          </Switch>
        </div>
      </Router>
    </div>
  );
}

export default App;

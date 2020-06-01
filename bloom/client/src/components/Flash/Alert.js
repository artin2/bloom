import React from 'react';
import store from '../../redux/store';
import {
  removeAlert
} from '../../redux/actions/alert'
import { connect } from 'react-redux';
import './Flash.css';

class Alert extends React.Component {
  constructor(props) {
    super(props);

    this.removeAlert = this.removeAlert.bind(this);
    this.alertClass = this.alertClass.bind(this);
  }

  alertClass (status) {
    let classes = {
      400: 'alert-danger',
      300: 'alert-warning',
      500: 'alert-info',
      200: 'alert-success'
    };
    return classes[status] || classes.success;
  }

  removeAlert() {
    store.dispatch(removeAlert())
  }

  render() {
    let alert = this.props.alert;
    let alertTag = null
    if(!(Object.keys(alert).length === 0 && alert.constructor === Object) && !(alert.status === "")){
      let alertClassName = `alert ${ this.alertClass(alert.status) } mb-0`;
      alertTag = <div className={ alertClassName }>
                <button className='close'
                  onClick={ this.removeAlert }>
                  &times;
                </button>
                { alert.statusText }
              </div>
    }

    return(
      <div className="alert-fixed" style={{ zIndex: 1}}>
        {alertTag}
      </div>
    );
  }
}

const mapStateToProps = state => ({
  alert: state.alertReducer.alert,
})

export default connect(mapStateToProps)(Alert);

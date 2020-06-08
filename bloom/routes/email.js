// Node.js SDK: https://github.com/sendinblue/APIv3-nodejs-library
var SibApiV3Sdk = require('sib-api-v3-sdk');
var defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key authorization: api-key
var apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.sibApi;

function bookingConfirmation(params) {
  var apiInstance = new SibApiV3Sdk.SMTPApi();

  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  sendSmtpEmail = {
      to: [{
          email: params.email,
          name: params.first_name + ' ' + params.last_name
      }],
      templateId: 1,
      params: {
        group_id: params.group_id,
        first_name: params.first_name,
        user_id: params.user_id,
        store_name: params.store_name,
        address: params.address, 
        start_time: params.start_time, 
        end_time: params.end_time,
        services: params.services,
        price: params.price
      },
  };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
  }, function(error) {
    console.error("Error in sending booking confirmation email", error);
  });
}

function signupConfirmation(params) {
  var apiInstance = new SibApiV3Sdk.SMTPApi();

  var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

  sendSmtpEmail = {
    to: [{
        email: params.email,
        name: params.first_name + ' ' + params.last_name
    }],
    templateId: 2,
    params: {
      first_name: params.first_name,
      user_id: params.user_id
    }
  };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
    console.log('API called successfully. Returned data: ' + data);
  }, function(error) {
    console.error("Error in sending user signup confirmation", error);
  });
}

module.exports = {
  bookingConfirmation: bookingConfirmation,
  signupConfirmation: signupConfirmation
};

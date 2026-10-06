const promClient = require('@prometheus-io/client');

promClient.collectDefaultMetrics();
// logger.info('Created new metrics register');

const loginSuccessCounter = new promClient.Counter({
  name: 'sgar_login_success',
  help: 'Increments each time a user succesfully logs into the service',
});

const newRegistrationCounter = new promClient.Counter({
  name: 'sgar_new_registration_success',
  help: 'Increments each time a user creates an account on SGAR',
});

promClient.register.registerMetric(loginSuccessCounter);

function CountLoginSuccess() {
  loginSuccessCounter.inc();
}

function NewRegistrationSuccess() {
  newRegistrationCounter.inc();
}

module.exports = {
  CountLoginSuccess,
  NewRegistrationSuccess,
  promClient,
};

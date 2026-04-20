const logger = require('../utils/logger')(__filename);
const promClient = require('prom-client');

module.exports = {
  createCounter({ name, help }) {
    const counter = new promClient.Counter({ name, help });
    promClient.register.registerMetric(counter);
    logger.info(`Created new counter ${name}`);
    return counter;
  },

  loginSuccess() {
    const name = 'sgar_login_success';
    const help = 'Increments each time a user successfully logs into the service';
    return this.createCounter({ name, help });
  },
  loginError() {
    const name = 'sgar_login_error';
    const help = 'Increments each time a user fails to log into the service';
    return this.createCounter({ name, help });
  },
  invalidLogin() {
    const name = 'sgar_invalid_login';
    const help = 'Increments each time a user logs in with an invalid username or password';
    return this.createCounter({ name, help });
  },
};

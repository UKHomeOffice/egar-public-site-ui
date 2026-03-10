const metrics = require('./metrics');

module.exports = {
  CountLoginSuccess() {
    metrics.loginSuccess.inc();
  },

  CountLoginError() {
    metrics.loginError.inc();
  },

  CountInvalidLogin() {
    metrics.invalidLogin.inc();
  },
};

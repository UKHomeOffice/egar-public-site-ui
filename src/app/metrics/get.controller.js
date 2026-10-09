const service = require('../../common/services/metrics');

module.exports = (req, res) => {
  res.set('Content-Type', service.promClient.register.contentType);
  service.promClient.register.metrics().then((data) => res.status(200).send(data));
};

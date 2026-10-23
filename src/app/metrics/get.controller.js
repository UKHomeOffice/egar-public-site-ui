const service = require('../../common/services/metrics');

module.exports = (_req, res) => {
  res.set('Content-Type', service.promClient.register.contentType);
  service.promClient.register
    .metrics()
    .then((data) => res.status(200).send(data))
    .catch((err) => res.status(500).send(err));
};

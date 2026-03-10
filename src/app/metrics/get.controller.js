const promClient = require('prom-client');

module.exports = async (req, res) => {
  res.setHeader('Content-Type', promClient.register.contentType);
  await promClient.register.metrics().then((data) => res.status(200).send(data));
};

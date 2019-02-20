const logger = require('../../common/utils/logger');
const personApi = require('../../common/services/personApi');

module.exports = (req, res) => {
  logger.debug('In people get controller');
  personApi.getPeople('')
};

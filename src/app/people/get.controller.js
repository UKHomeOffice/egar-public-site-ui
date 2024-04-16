const logger = require('../../common/utils/logger')(__filename);
const personApi = require('../../common/services/personApi');
const CookieModel = require('../../common/models/Cookie.class');
const { Manifest } = require("../../common/models/Manifest.class");

module.exports = async (req, res) => {
  logger.debug('In people get controller');
  const cookie = new CookieModel(req);
  const errMSg = { message: 'Failed to get saved people' };
  
  try {
    const response = await personApi.getPeople(cookie.getUserDbId(), 'individual')
    const people = JSON.parse(response);
    const manifest = new Manifest(JSON.stringify({ items: people }));

    logger.info(`people: ${JSON.stringify(people)}`)
    
    if (people.message) {
      logger.info('Failed to get saved people');
      logger.info(people.message);
      return res.render('app/people/index', { cookie, errors: [errMSg] });
    }
    if (req.session.errMsg) {
      const { errMsg } = req.session;
      delete req.session.errMsg;
      return res.render('app/people/index', { cookie, people, errors: [errMsg] });
    }

    const isValidPeople = await manifest.validate();

    if (!isValidPeople) {
      logger.error(`User ${cookie.getUserDbId()} users are invalid`);
      logger.info('Manifest validation failed, redirecting with error msg');
      req.session.manifestErr = manifest.genErrValidations();

      return res.render('app/people/index', { 
        cookie, 
        people, 
        errors: req.session.manifestErr, 
        manifestInvalidPeople: manifest.invalidPeople
      });
  
    } 

    logger.info("gods of war")

    if (req.session.successMsg) {
      logger.info("gods of war 0")

      const { successMsg, successHeader } = req.session;
      delete req.session.successHeader;
      delete req.session.successMsg;
      logger.info("gods of war 1")

      return res.render('app/people/index', {
        cookie, people, successHeader, successMsg,
      });
    }
    return res.render('app/people/index', { cookie, people });
  } catch (err) {
    logger.info('Failed to get saved people');
    logger.info(err);
    return res.render('app/people/index', { cookie, errors: [errMSg] });
  };
};

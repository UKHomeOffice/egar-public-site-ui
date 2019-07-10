const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const craftApi = require('../../../common/services/craftApi');
const validationList = require('./validations');

module.exports = (req, res) => {
  logger.debug('In garfile / craft post controller');

  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();

  if (req.body.addCraft) {
    craftApi.getDetails(userId, req.body.addCraft)
      .then((apiResponse) => {
        const craft = JSON.parse(apiResponse);
        // Overwrite GAR craft info if a user has clicked on a craft
        cookie.setGarCraft(craft.registration, craft.craftType, craft.craftBase);
        res.redirect('/garfile/craft');
      })
      .catch((err) => {
        logger.error(err);
        res.redirect('/garfile/craft');
      });
  } else {
    const craftObj = {
      registration: req.body.craftReg,
      craftType: req.body.craftType,
      craftBase: req.body.craftBase,
    };

    const { buttonClicked } = req.body;

    cookie.setGarCraft(craftObj.registration, craftObj.craftType, craftObj.craftBase);

    const validations = validationList.validations(craftObj);

    validator.validateChains(validations)
      .then(() => {
        garApi.patch(cookie.getGarId(), cookie.getGarStatus(), craftObj)
          .then((apiResponse) => {
            const parsedResponse = JSON.parse(apiResponse);
            if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              // API returned error
              logger.debug(`Api returned: ${parsedResponse}`);
              res.render('app/garfile/craft/index', { cookie, errors: [parsedResponse] });
            } else {
              // Successful
              cookie.setGarCraft(craftObj.registration, craftObj.craftType, craftObj.craftBase);
              return buttonClicked === 'Save and continue' ? res.redirect('/garfile/manifest') : res.redirect('/home');
            }
          })
          .catch((err) => {
            logger.error('Api failed to update GAR');
            logger.error(err);
            res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'Failed to add to GAR' }] });
          });
      })
      .catch((err) => {
        logger.info('Validation failed');
        logger.info(err);
        res.render('app/garfile/craft/index', { cookie, errors: err });
      });
  }
};

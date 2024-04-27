const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const craftApi = require('../../../common/services/craftApi');
const validationList = require('./validations');
const pagination = require('../../../common/utils/pagination');

module.exports = (req, res) => {
  logger.debug('In garfile / craft post controller');

  const { buttonClicked } = req.body;
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();

  if (req.body.nextPage) {
    pagination.setCurrentPage(req, '/garfile/craft', req.body.nextPage);
    req.session.save(() => res.redirect('/garfile/craft#saved_aircraft'));
    return;
  }

  if (req.body.addCraft && buttonClicked === 'Add to GAR') {
    craftApi.getDetails(userId, req.body.addCraft)
      .then((apiResponse) => {
        const craft = JSON.parse(apiResponse);
        // Overwrite GAR craft info if a user has clicked on a craft
        cookie.setGarCraft(craft.registration, craft.craftType, craft.craftBase);
        req.session.save(() => res.redirect('/garfile/craft'));
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
      portChoice: req.body.portChoice,
    };

    cookie.setGarCraft(craftObj.registration, craftObj.craftType, craftObj.craftBase);

    const validations = validationList.validations(craftObj);

    validator.validateChains(validations)
      .then(() => {
        garApi.patch(cookie.getGarId(), cookie.getGarStatus(), craftObj)
          .then((apiResponse) => {
            const parsedResponse = JSON.parse(apiResponse);
            if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              // API returned error
              logger.error(`Patch GAR API returned: ${apiResponse}`);
              res.render('app/garfile/craft/index', { cookie, errors: [parsedResponse] });
              return;
            }
            // Successful
            cookie.setGarCraft(craftObj.registration, craftObj.craftType, craftObj.craftBase);
            if (buttonClicked === 'Save and continue') {
              res.redirect('/garfile/manifest');
            } else {
              res.redirect(307, '/garfile/view');
            }
          })
          .catch((err) => {
            logger.error('Api failed to update GAR');
            logger.error(err);
            res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'Failed to add aircraft to GAR' }] });
          });
      })
      .catch((err) => {
        logger.info('GAR aircraft validation failed');
        logger.debug(JSON.stringify(err));
        res.render('app/garfile/craft/index', { cookie, errors: err });
      });
  }
};

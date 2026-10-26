const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const dataAccessApi = require('../../../common/services/dataAccessApi');
const validationList = require('./validations');
const pagination = require('../../../common/utils/pagination');

module.exports = (req, res) => {
  const { buttonClicked } = req.body;
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();

  if (req.body.nextPage) {
    pagination.setCurrentPage(req, '/garfile/craft', req.body.nextPage);
    req.session.save(() => res.redirect('/garfile/craft#saved_aircraft'));
    return;
  }

  if (req.body.addCraft && buttonClicked === 'Add to GAR') {
    return dataAccessApi.craftApi
      .getDetails(userId, req.body.addCraft)
      .then((craft) => {
        // Overwrite GAR craft info if a user has clicked on a craft
        cookie.setGarCraft(craft.registration, craft.craftType, craft.craftBase);
        req.session.save(() => res.redirect('/garfile/craft'));
      })
      .catch((err) => {
        logger.error('Failed to add craft to GAR', { userId, errorMessage: err?.message, stack: err?.stack });
        res.redirect('/garfile/craft');
      });
  } else {
    const craftObj = {
      registration: req.body.registration,
      craftType: req.body.craftType,
      portChoice: req.body.portChoice,
    };

    if (craftObj.portChoice === 'Yes') {
      craftObj.craftBasePort = req.body.craftBasePort;
    } else {
      craftObj.craftBaseLat = req.body.craftBaseLat;
      craftObj.craftBaseLong = req.body.craftBaseLong;
    }

    craftObj.craftBase = cookie.reduceCraftBase(craftObj.craftBasePort, craftObj.craftBaseLat, craftObj.craftBaseLong);
    cookie.setGarCraft(craftObj.registration, craftObj.craftType, craftObj.craftBase, craftObj.portChoice);
    const validations = validationList.validations(craftObj);

    return validator
      .validateChains(validations)
      .then(() => {
        return dataAccessApi.garApi
          .patch(res.locals.gar.garId, cookie.getGarStatus(), {
            registration: craftObj.registration,
            craftType: craftObj.craftType,
            craftBase: craftObj.craftBase,
          })
          .then((apiResponse) => {
            if (Object.prototype.hasOwnProperty.call(apiResponse, 'message')) {
              // API returned error
              logger.error('Patch GAR API returned an error', { garId: res.locals.gar.garId });
              res.render('app/garfile/craft/index', { cookie, errors: [apiResponse] });
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
            logger.error('Failed to update GAR', {
              garId: cookie.getGarId(),
              errorMessage: err?.message,
              stack: err?.stack,
            });
            res.render('app/garfile/craft/index', {
              cookie,
              errors: [
                err?.type === 'http_error' && typeof err.body?.message === 'string'
                  ? err.body
                  : { message: 'Failed to add aircraft to GAR' },
              ],
            });
          });
      })
      .catch((err) => {
        logger.warn('GAR aircraft validation failed', { garId: cookie.getGarId() });
        res.render('app/garfile/craft/index', { cookie, errors: err });
      });
  }
};

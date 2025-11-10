const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const utils = require('../../../common/utils/utils');
const validator = require('../../../common/utils/validator');
const validations = require('../../resperson/validations');
const resPersonApi = require('../../../common/services/resPersonApi');
const garApi = require('../../../common/services/garApi');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;
  const resPersonId = req.body.addResponsiblePerson;
  if (resPersonId && buttonClicked === 'Add to GAR') {
    try {
      res.redirect('/garfile/resperson?resPersonId=' + resPersonId);
    } catch (err) {
      logger.error('API failed to retrieve gar responsible person');
      logger.error(err);
      res.render(
        'app/garfile/resperson/index',
        {},
        {
          errors: [
            {
              message: 'Problem retrieving GAR',
            },
          ],
        }
      );
    }
  } else {
    const responsiblePerson = utils.getResponsiblePersonFromReq(req);
    const resPersonsResponse = await resPersonApi.getResPersons(cookie.getUserDbId());
    const responsiblePersons = await JSON.parse(resPersonsResponse);
    validator
      .validateChains(validations.validations(req))
      .then(() => {
        garApi
          .patch(cookie.getGarId(), cookie.getGarStatus(), responsiblePerson)
          .then((apiResponse) => {
            const parsedResponse = JSON.parse(apiResponse);
            if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              res.render('app/garfile/resperson/index', {
                cookie,
                fixedBasedOperatorOptions,
                errors: [parsedResponse],
              });
              return;
            }
            // Successful api response
            cookie.setGarResponsiblePerson(responsiblePerson);
            if (buttonClicked === 'Save and continue') {
              res.redirect('/garfile/customs');
            } else {
              res.redirect(307, '/garfile/view');
            }
          })
          .catch((err) => {
            logger.error('API failed to update GAR');
            logger.error(err);
            res.render('app/garfile/resperson/index', {
              cookie,
              responsiblePerson,
              responsiblePersons,
              fixedBasedOperatorOptions,
              errors: [{ message: 'Failed to add to GAR' }],
            });
          });
      })
      .catch((err) => {
        logger.info('GAR responsible person validation failed', err);
        cookie.setGarResponsiblePerson(responsiblePerson);
        res.render('app/garfile/resperson/index', {
          cookie,
          responsiblePerson,
          responsiblePersons,
          fixedBasedOperatorOptions,
          errors: err,
        });
      });
  }
};

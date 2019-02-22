const logger = require('../../../common/utils/logger');
const validator = require('../../../common/utils/validator');
const validations = require('./validations');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  const responsiblePerson = {
    responsibleGivenName: req.body.responsibleGivenName,
    responsibleSurname: req.body.responsibleSurname,
    responsibleContactNo: req.body.responsibleContactNo,
    responsibleAddressLine1: req.body.responsibleAddressLine1,
    responsibleAddressLine2: req.body.responsibleAddressLine2,
    responsibleTown: req.body.responsibleTown,
    responsibleCounty: req.body.responsibleCounty,
    responsiblePostcode: req.body.responsiblePostcode,
  };

  const {
    buttonClicked,
  } = req.body;

  validator.validateChains(validations.validations(req))
    .then(() => {
      garApi.patch(cookie.getGarId(), cookie.getGarStatus(), responsiblePerson)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            // API returned error
            res.render('app/garfile/responsibleperson/index', {
              errors: [parsedResponse],
              cookie,
            });
          } else {
            // successful api response
            cookie.setGarResponsiblePerson(responsiblePerson);
            return buttonClicked === 'Save and continue' ? res.redirect('/garfile/customs') : res.redirect('/home');
          }
        })
        .catch((err) => {
          logger.error('API failed to update GAR');
          logger.error(JSON.stringify(err));
          res.render('app/garfile/responsibleperson/index', {
            cookie,
            errors: [{
              message: 'Failed to add to GAR'
            }],
          });
        });
    })
    .catch((err) => {
      logger.info('Validation failed');
      cookie.setGarResponsiblePerson(responsiblePerson);
      res.render('app/garfile/responsibleperson/index', {
        cookie,
        errors: err,
        req,
      });
    });
};

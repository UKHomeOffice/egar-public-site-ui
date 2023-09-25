const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const validations = require('./validations');
const CookieModel = require('../../../common/models/Cookie.class');
const garApi = require('../../../common/services/garApi');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');
const autoCompleteUtil = require('../../../common/utils/autocomplete')


module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  req.body.fixedBasedOperatorAnswer = _.trim(req.body.fixedBasedOperatorAnswer);
  const responsibleCountry = autoCompleteUtil.countryList
    .find(country => country.code === req.body.responsibleCounty)

  const responsiblePerson = {
    responsibleGivenName: req.body.responsibleGivenName,
    responsibleSurname: req.body.responsibleSurname,
    responsibleContactNo: req.body.responsibleContactNo,
    responsibleEmail: req.body.responsibleEmail,
    responsibleAddressLine1: req.body.responsibleAddressLine1,
    responsibleAddressLine2: req.body.responsibleAddressLine2,
    responsibleTown: req.body.responsibleTown,
    responsibleCounty: req.body.responsibleCounty,
    responsibleCountryLabel: responsibleCountry === undefined ? '' : responsibleCountry.label,
    responsiblePostcode: req.body.responsiblePostcode,
    fixedBasedOperator: req.body.fixedBasedOperator,
    fixedBasedOperatorAnswer: (req.body.fixedBasedOperator === 'Other' ? req.body.fixedBasedOperatorAnswer : ''),
    fixedBasedOperatorOptions,
  };

  const { buttonClicked } = req.body;

  validator.validateChains(validations.validations(req))
    .then(() => {
      garApi.patch(cookie.getGarId(), cookie.getGarStatus(), responsiblePerson)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            // API returned error
            res.render('app/garfile/responsibleperson/index', {
              cookie, fixedBasedOperatorOptions, errors: [parsedResponse],
            });
            return;
          }
          // Successful api response
          cookie.setGarResponsiblePerson(responsiblePerson);
          if (buttonClicked === 'Save and continue') {
            res.redirect('/garfile/customs');
          } else {
            // Temporary redirect (307) so this POST also becomes a POST for garfile/view
            res.redirect(307, '/garfile/view');
          }
        })
        .catch((err) => {
          logger.error('API failed to update GAR');
          logger.error(JSON.stringify(err));
          res.render('app/garfile/responsibleperson/index', {
            cookie, fixedBasedOperatorOptions, errors: [{ message: 'Failed to add to GAR' }],
          });
        });
    })
    .catch((err) => {
      logger.info('GAR responsible person validation failed');
      cookie.setGarResponsiblePerson(responsiblePerson);
      res.render('app/garfile/responsibleperson/index', {
        req, cookie, fixedBasedOperatorOptions, errors: err,
      });
    });
};

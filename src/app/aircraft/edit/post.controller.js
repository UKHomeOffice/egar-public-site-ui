const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');

module.exports = (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  const { craftReg } = req.body;
  const { craftType } = req.body;
  const craftBase = _.toUpper(req.body.craftBase);
  const { craftId } = req.body;

  cookie.updateEditCraft(craftReg, craftType, craftBase);

  // Define a validation chain for user registeration fields
  const craftRegChain = [
    new ValidationRule(validator.notEmpty, 'craftReg', craftReg, 'Enter the registration deatils of the craft'),
  ];
  const craftTypeChain = [
    new ValidationRule(validator.notEmpty, 'craftType', craftType, 'Enter the craft type'),
  ];
  const craftBaseChain = [
    new ValidationRule(validator.notEmpty, 'craftBase', craftBase, 'Enter the base of the craft'),
  ];


  // Validate chains
  validator.validateChains([craftRegChain, craftTypeChain, craftBaseChain])
    .then(() => {
      // call the API to update craft
      craftApi.update(craftReg, craftType, craftBase, cookie.getUserDbId(), craftId)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            // API returned failure
            res.render('app/aircraft/edit/index', { cookie, errors: [parsedResponse] });
          } else {
            // API returned successful
            res.redirect('/aircraft');
          }
        }).catch((err) => {
          logger.error('Unexpected error updating aircraft');
          logger.error(err);
          res.render('app/aircraft/edit/index', { cookie, errors: [{ message: 'An error has occurred. Try again later' }] });
        });
    })
    .catch((err) => {
      logger.info('Edit SavedCraft postcontroller - There was a problem with editing the saved craft');
      logger.info(JSON.stringify(err));
      res.render('app/aircraft/edit/index', { cookie, errors: err });
    });
};

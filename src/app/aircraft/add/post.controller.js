const _ = require('lodash');
const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');

module.exports = (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);
  const originalPage = req.body.currentPage;

  const craftReg = req.body.craftreg;
  const craftType = req.body.crafttype;
  const craftBase = _.toUpper(req.body.craftbase);

  // Define a validation chain for user registeration fields
  const craftRegChain = [
    new ValidationRule(validator.notEmpty, 'craftreg', craftReg, 'Enter the registration details of the craft'),
  ];
  const craftTypeChain = [
    new ValidationRule(validator.notEmpty, 'crafttype', craftType, 'Enter the craft type'),
  ];
  const craftBaseChain = [
    new ValidationRule(validator.notEmpty, 'craftbase', craftBase, 'Enter the base of the craft'),
  ];

  // Validate chains
  validator.validateChains([craftRegChain, craftTypeChain, craftBaseChain])
    .then(() => {
      // call the API to update the data base and then
      craftApi.create(craftReg, craftType, craftBase, cookie.getUserDbId())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
            res.render('app/aircraft/add/index', { errors: [parsedResponse], cookie });
          } else {
            console.log('Response form API');
            console.log(apiResponse);
            res.redirect('/aircraft?page=1000000');
          }
        });
    })
    .catch((err) => {
      logger.info('Add craft postcontroller - There was a problem with adding the saved craft');
      // logger.info(JSON.stringify(err));
      res.render('app/aircraft/add/index', { cookie, errors: err, query: { page: originalPage } });
    });
};

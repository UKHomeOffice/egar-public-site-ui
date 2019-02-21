const logger = require('../../../common/utils/logger');
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');

module.exports = (req, res) => {
  const orgname = req.body.Orgname;

  // Get the ip address
  const ip = req.header('x-forwarded-for');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  const craftReg = req.body.craftReg;
  const craftType = req.body.craftType;
  const craftBase = req.body.craftBase;
  const craftId = req.body.craftId;

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
    .then((response) => {
      // call the API to update craft
      craftApi.update(craftReg, craftType, craftBase, cookie.getUserDbId(), craftId)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.hasOwnProperty('message')) {
            // API returned failure
            res.render('app/aircraft/edit/index', { cookie, errors: [parsedResponse] });
          } else {
            // API returned successful
            res.redirect('/aircraft');
            // res.render('app/user/viewDetails/index', { cookie });
          }
        });
    })
    .catch((err) => {
      logger.info('Edit SavedCraft postcontroller - There was a problem with editing the saved craft');
      logger.info(err);
      res.render('app/aircraft/edit/index', { cookie, errors: err });
    });
};

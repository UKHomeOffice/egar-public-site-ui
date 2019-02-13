const logger = require('../../../../common/utils/logger');
const ValidationRule = require('../../../../common/models/ValidationRule.class');
const validator = require('../../../../common/utils/validator');
const CookieModel = require('../../../../common/models/Cookie.class');
const craftApi = require('../../../../common/services/craftApi');

module.exports = (req, res) => {
  let orgname = req.body.Orgname;

  // Get the ip address
  const ip = req.header('x-forwarded-for');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  const { craftreg, crafttype, craftbase } = req.body;

  // Define a validation chain for user registeration fields
  const craftregChain = [
    new ValidationRule(validator.notEmpty, 'craftreg', craftreg, 'Enter the registration details of the craft'),
  ];
  const crafttypeChain = [
    new ValidationRule(validator.notEmpty, 'crafttype', crafttype, 'Enter the craft type'),
  ];
  const ccraftbaserafttypeChain = [
    new ValidationRule(validator.notEmpty, 'craftbase', craftbase, 'Enter the base of the craft'),
  ];


  // Validate chains
  validator.validateChains([craftregChain, crafttypeChain, ccraftbaserafttypeChain])
    .then(() => {
      craftApi.create(craftreg, crafttype, craftbase, cookie.getUserDbId())
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.hasOwnProperty('message')) {
            // API returned error
            res.render('app/organisation/savedcraft/add/index', { errors: [parsedResponse], cookie });
          } else {
            // Successful
            cookie.setSavedCraft({}); // Clear the craft on successful submission
            res.redirect('/organisation/manage');
          }
        });
    })
    .catch((err) => {
      logger.info('Edit SavedCraft postcontroller - There was a problem with editing the saved craft');
      logger.info(err);
      cookie.setSavedCraft({ registration: craftreg, craftType: crafttype, craftBase: craftbase });
      res.render('app/organisation/savedcraft/add/index', { cookie, errors: err });
    });
};

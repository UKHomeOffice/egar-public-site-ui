const logger = require('../../../../common/utils/logger');
const ValidationRule = require('../../../../common/models/ValidationRule.class');
const validator = require('../../../../common/utils/validator');
const CookieModel = require('../../../../common/models/Cookie.class');
const craftApi = require('../../../../common/services/craftApi');

module.exports = (req, res) => {
  const orgname = req.body.Orgname;

  // Get the ip address
  const ip = req.header('x-forwarded-for');

  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  const craftreg = req.body.craftreg;
  const crafttype = req.body.crafttype;
  const craftbase = req.body.craftbase;
  const craftId = req.body.craftId;

  cookie.updateEditCraft(craftreg, crafttype, craftbase);


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
      // call the API to update the data base and then
      craftApi.update(craftreg, crafttype, craftbase, cookie.getUserDbId(), craftId)
        .then((apiResponse) => {
          const parsedResponse = JSON.parse(apiResponse);
          if (parsedResponse.hasOwnProperty('message')) {
            // API returned failure
            res.render('app/organisation/savedcraft/edit/index', { cookie, errors: [parsedResponse] })
          } else {
            // API returned successful
            res.redirect('/organisation/manage');
            // res.render('app/organisation/manage/index', { cookie });
          }
        });
    })
    .catch((err) => {
      logger.info('Edit SavedCraft postcontroller - There was a problem with editing the saved craft');
      logger.info(err);
      res.render('app/organisation/savedcraft/edit/index', { cookie, errors: err });
    });
};

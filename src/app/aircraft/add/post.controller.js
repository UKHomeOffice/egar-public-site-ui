/* eslint-disable no-underscore-dangle */

const _ = require('lodash');

const logger = require('../../../common/utils/logger')(__filename);
const validator = require('../../../common/utils/validator');
const CookieModel = require('../../../common/models/Cookie.class');
const craftApi = require('../../../common/services/craftApi');
const pagination = require('../../../common/utils/pagination');
const craftValidations = require('../../../app/garfile/craft/validations');

module.exports = (req, res) => {
  // Start by clearing cookies and initialising
  const cookie = new CookieModel(req);

  const { craftReg, craftType } = req.body;
  const craftBase = _.toUpper(req.body.craftBase);

  // Define a validation chain for user registeration fields
  const craftObj = {
    registration: req.body.craftReg,
    craftType,
    craftBase,
  };

  const validationChain = craftValidations.validations(craftObj);

  // Validate chains
  validator.validateChains(validationChain)
    .then(() => {
      // call the API to update the data base and then
      craftApi.create(craftReg, craftType, craftBase, cookie.getUserDbId())
        .then((apiResponse) => {
          try {
            const parsedResponse = JSON.parse(apiResponse);
            if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
              res.render('app/aircraft/add/index', { errors: [parsedResponse], cookie });
            } else {
              // Set the page to a large number and expect the page to redirect back to
              // the correct last page (two calls in exchange for less logic to calculate the last page)
              pagination.setCurrentPage(req, '/aircraft', 1000000);
              req.session.save(() => res.redirect('/aircraft'));
            }
          } catch (err) {
            // Until the back end corrects the issue with indexing (preventing duplicate registrations)
            // this catch and return should at least prevent the application from hanging
            logger.error('Parsing attempt from API caused error, was not JSON');
            let errMsg = { message: 'There was a problem saving the aircraft. Try again later' };
            if (_.toString(apiResponse).includes('DETAIL:  Key (registration)')) {
              errMsg = { message: 'Craft already exists' };
            }
            res.render('app/aircraft/add/index', {
              cookie, craftType, craftReg, craftBase, errors: [errMsg],
            });
          }
        });
    })
    .catch((err) => {
      logger.info('Add craft postcontroller - There was a problem with adding the saved craft');
      res.render('app/aircraft/add/index', {
        cookie, craftType, craftReg, craftBase, errors: err,
      });
    });
};

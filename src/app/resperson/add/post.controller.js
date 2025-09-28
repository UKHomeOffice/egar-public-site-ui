import _ from 'lodash';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import validator from '../../../common/utils/validator.js';
import validations from '../validations.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};
import resPersonApi from '../../../common/services/resPersonApi.js';
import utils from '../../../common/utils/utils.js';

export default (req, res) => {

  const cookie = new CookieModel(req);
  req.body.fixedBasedOperatorAnswer = _.trim(req.body.fixedBasedOperatorAnswer);
  const responsiblePerson = utils.getResponsiblePersonFromReq(req);

  validator.validateChains(validations(req))
  .then(() => {
    resPersonApi.create(cookie.getUserDbId(), responsiblePerson).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        res.render('app/resperson/add/index', {
          cookie, fixedBasedOperatorOptions, errors: [parsedResponse], responsiblePerson
        });
      } else {
        res.redirect('/resperson');
      }
    }).catch((err) => {
      logger.error('There was a problem adding person to saved people');
      logger.error(err);
      res.render('app/resperson/add/index', {
        cookie, fixedBasedOperatorOptions, errors: [{ message: 'There was a problem creating the responsible person. Please try again' }],
      });
    });
  })
  .catch((err) => {
    res.render('app/resperson/add/index', {
      cookie, req,  fixedBasedOperatorOptions, errors: err, responsiblePerson
    });
  });
};

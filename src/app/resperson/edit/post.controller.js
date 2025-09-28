import _ from 'lodash';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import validator from '../../../common/utils/validator.js';
import validations from '../validations.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};
import utils from '../../../common/utils/utils.js';
import resPersonApi from '../../../common/services/resPersonApi.js';

export default (req, res) => {
  const cookie = new CookieModel(req);

  req.body.fixedBasedOperatorAnswer = _.trim(req.body.fixedBasedOperatorAnswer);

  const responsiblePerson = utils.getResponsiblePersonFromReq(req);
  const resPersonId = req.session.editResponsiblePersonId;
  validator.validateChains(validations(req))
  .then(() => {
    resPersonApi.updateResPerson(cookie.getUserDbId(), resPersonId, responsiblePerson).then((apiResponse) => {
      const parsedResponse = JSON.parse(apiResponse);
      if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
        res.render('app/resperson/edit/index', {
          cookie, responsiblePerson, fixedBasedOperatorOptions, errors: [parsedResponse],
        });
      } else {
        res.redirect('/resperson');
      }
    }).catch((err) => {
      logger.error('There was a problem adding person to saved people');
      logger.error(err);
      res.render('app/resperson/edit/index', {
        cookie, responsiblePerson, fixedBasedOperatorOptions, errors: [{ message: 'There was a problem updating responsible person. Please try again' }],
      });
    });
  })
  .catch((err) => {
    logger.info('Validation errors creating a new responsible person');
      logger.debug(JSON.stringify(err));
      res.render('app/resperson/edit/index', {
        cookie, req, responsiblePerson, fixedBasedOperatorOptions, errors: err,
      });
  });
};
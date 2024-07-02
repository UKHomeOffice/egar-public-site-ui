const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const resPersonApi = require('../../../common/services/resPersonApi');
const fixedBasedOperatorOptions = require('../../../common/seeddata/fixed_based_operator_options.json');

module.exports = (req, res) => {
    logger.debug('In responsible person edit get controller');
    const cookie = new CookieModel(req);
    const responsiblePersonId = req.session.editResponsiblePersonId;
    if (responsiblePersonId === undefined) {
      res.redirect('/resperson');
      return;
    }
    resPersonApi.getResPersonDetails(cookie.getUserDbId(), responsiblePersonId)
      .then((apiResponse) => {
        const responsiblePerson = JSON.parse(apiResponse);
        cookie.setEditCraft(responsiblePerson);
        return res.render('app/resperson/edit/index', { cookie, responsiblePerson, fixedBasedOperatorOptions });
      })
      .catch((err) => {
        logger.error(err);
        return res.redirect('/resperson');
      });
  };
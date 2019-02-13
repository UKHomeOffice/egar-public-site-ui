const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger');
const craftApi = require('../../../common/services/craftApi');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  logger.debug('In garfile/craft get controller');

  // Clear existing editcraft
  const cookie = new CookieModel(req);

  const userRole = cookie.getUserRole();
  const userId = cookie.getUserDbId();
  const crafts = userRole === 'Individual' ? craftApi.getCrafts(userId) : craftApi.getOrgCrafts(cookie.getOrganisationId());

  garApi.get(cookie.getGarId())
    .then((values) => {
      const gar = JSON.parse(values);
      if ((gar.registration !== null || gar.registration !== 'Undefined') && req.headers.referer.indexOf('garfile/craft') < 0) {
        cookie.setGarCraft(gar.registration, gar.craftType, gar.craftBase);
      }
      if (userRole === 'Individual') {
        craftApi.getCrafts(userId)
          .then((values) => {
            let garCraft = (JSON.parse(values));
            if (garCraft.items.length > 0) {
              cookie.setSavedCraft(JSON.parse(values));
              return res.render('app/garfile/craft/index', { cookie });
            } else {
              return res.render('app/garfile/craft/index', { cookie });
            }
          })
          .catch((err) => {
            logger.error('Failed to get Saved Crafts from API');
            logger.error(err);
            res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting GAR information' }] });
          });
      } else {
        craftApi.getOrgCrafts(cookie.getOrganisationId())
          .then((values) => {
            let garCraft = (JSON.parse(values));
            if (garCraft.items.length > 0) {
              cookie.setSavedCraft(JSON.parse(values));
              return res.render('app/garfile/craft/index', { cookie });
            } else {
              return res.render('app/garfile/craft/index', { cookie });
            }
          })
          .catch((err) => {
            logger.error('Failed to get Saved Crafts from API');
            logger.error(err);
            res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting GAR information' }] });
          });
      }
    })
    .catch((err) => {
      logger.error('Failed to get GAR from API');
      logger.error(err);
      res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting GAR information' }] });
    });
};

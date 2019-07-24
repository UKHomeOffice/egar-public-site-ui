/* eslint-disable no-underscore-dangle */
const CookieModel = require('../../../common/models/Cookie.class');
const logger = require('../../../common/utils/logger')(__filename);
const craftApi = require('../../../common/services/craftApi');
const garApi = require('../../../common/services/garApi');
const pagination = require('../../../common/utils/pagination');

module.exports = (req, res) => {
  logger.debug('In garfile/craft get controller');

  // Clear existing editcraft
  const cookie = new CookieModel(req);
  const currentPage = pagination.getCurrentPage(req, '/garfile/craft');

  const userRole = cookie.getUserRole();
  const userId = cookie.getUserDbId();

  garApi.get(cookie.getGarId())
    .then((garApiResponse) => {
      const gar = JSON.parse(garApiResponse);
      if ((gar.registration !== null || gar.registration !== 'Undefined') && req.headers.referer.indexOf('garfile/craft') < 0) {
        cookie.setGarCraft(gar.registration, gar.craftType, gar.craftBase);
      }
      if (userRole === 'Individual') {
        craftApi.getCrafts(userId, currentPage)
          .then((values) => {
            const garCraft = (JSON.parse(values));

            if (garCraft.items.length > 0) {
              const { totalPages, totalItems } = garCraft._meta;
              const paginationData = pagination.build(req, totalPages, totalItems);
              cookie.setSavedCraft(JSON.parse(values));

              res.render('app/garfile/craft/index', { cookie, pages: paginationData });
              return;
            }
            res.render('app/garfile/craft/index', { cookie });
          })
          .catch((err) => {
            logger.error('Failed to get Saved Crafts from API');
            logger.error(err);
            res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting aircraft information' }] });
          });
      } else {
        craftApi.getOrgCrafts(cookie.getOrganisationId())
          .then((values) => {
            const garCraft = (JSON.parse(values));
            if (garCraft.items.length > 0) {
              cookie.setSavedCraft(JSON.parse(values));
              res.render('app/garfile/craft/index', { cookie });
              return;
            }
            res.render('app/garfile/craft/index', { cookie });
          })
          .catch((err) => {
            logger.error('Failed to get Saved Crafts from API');
            logger.error(err);
            res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting aircraft information' }] });
          });
      }
    })
    .catch((err) => {
      logger.error('Failed to get GAR from API');
      logger.error(err);
      res.render('app/garfile/craft/index', { cookie, errors: [{ message: 'There was a problem getting GAR information' }] });
    });
};

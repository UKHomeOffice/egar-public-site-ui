const logger = require('../../../common/utils/logger');
const CookieModel = require('../../../common/models/Cookie.class');
const manifestFields = require('../../../common/seeddata/gar_manifest_fields.json');
const garApi = require('../../../common/services/garApi');

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / review get controller');

   garApi.getPeople(cookie.getGarId() )
   .then((apiResponse) => {
    const parsedResponse = JSON.parse(apiResponse);
    if (parsedResponse.hasOwnProperty('message')) {
    // API returned error
      logger.debug(`Api returned Error: ${parsedResponse}`);
    }
    else{
      const garpeople = JSON.parse(apiResponse);
      garApi.get(cookie.getGarId())//get the gar
      .then((apiResponse) => {
        const parsedResponse = JSON.parse(apiResponse);
        if (parsedResponse.hasOwnProperty('message')) {
        // API returned error
          logger.debug(`Api returned Error: ${parsedResponse}`);
        }
        else{
          const garfile = JSON.parse(apiResponse);
          garApi.getSupportingDocs(cookie.getGarId())
          .then((apiResponse) => {
            const parsedResponse = JSON.parse(apiResponse);
            if (parsedResponse.hasOwnProperty('message')) {
              // API returned error
                logger.debug(`Api returned Error: ${parsedResponse}`);
              }
              else{
                const supportingdocs = JSON.parse(apiResponse);
                if (req.session.submiterrormessage) {
                  let msg = req.session.submiterrormessage;
                  delete req.session.submiterrormessage
                  res.render('app/garfile/review/index', {cookie,
                    errors: msg,
                    showChangeLinks: true,
                    manifestFields, garfile,garpeople, supportingdocs});
                  }
                  else{
                    res.render('app/garfile/review/index', {cookie,
                      showChangeLinks: true,
                      manifestFields,
                      garfile,garpeople,
                      supportingdocs});
                  }
              }
            });
          }
        });
      }
    });
  }

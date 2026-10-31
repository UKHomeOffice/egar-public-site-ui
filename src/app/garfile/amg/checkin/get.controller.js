const logger = require('../../../../common/utils/logger')(__filename);
const CookieModel = require('../../../../common/models/Cookie.class');
const manifestFields = require('../../../../common/seeddata/gar_manifest_fields.json');
const { garApi } = require('../../../../common/services/dataAccessApi');
const { getDurationBeforeDeparture } = require('../../../../common/utils/utils');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const garId = res.locals.gar.garId;
  const resubmitted = req.query.resubmitted || 'no';
  const template = req.query.template === 'pane' ? 'app/garfile/amg/checkin/pane' : 'app/garfile/amg/checkin/index';
  const initialSubmit = req.query.initialSubmit ? '&initialSubmit=yes' : '';
  const currentPage = req.query.page ? req.query.page : 1;

  try {
    const progress = await garApi.getGarCheckinProgress(garId);
    if (progress?.statusCode >= 400) {
      throw new Error('GAR check-in progress lookup failed');
    }
    if ('poll' in req.query) {
      logger.info(`User GAR ${garId}: Checkin progress status is ${progress}`);
      res.json(progress);
      return;
    }
    return Promise.all([garApi.get(garId), garApi.getPeople(garId, currentPage), garApi.getSupportingDocs(garId)])
      .then(async (apiResponse) => {
        if (apiResponse.some((response) => response?.statusCode >= 400)) {
          throw new Error('GAR check-in lookup failed');
        }
        const [garfile, garpeople, garsupportingdocs] = apiResponse;

        const statusCheckComplete = garpeople.items.every((x) => x.amgCheckinStatus.name === 'Complete');

        const durationInDeparture = getDurationBeforeDeparture(garfile.departureDate, garfile.departureTime);
        const numberOf0TResponseCodes = (await garApi.getPeople(garId, '', '0T')).items.length;
        const numberOf0BResponseCodes = (await garApi.getPeople(garId, '', '0B')).items.length;
        const showImportantBanner = resubmitted === 'no' && numberOf0TResponseCodes > 0 && durationInDeparture > 125;

        const renderObj = {
          cookie,
          manifestFields,
          garfile,
          garpeople,
          garsupportingdocs,
          showChangeLinks: true,
          statusCheckComplete,
          numberOf0TResponseCodes,
          resubmitted,
          durationInDeparture,
          pages: garpeople._meta,
          currentPage: currentPage,
          showImportantBanner,
          numberOf0BResponseCodes,
          initialSubmit,
        };

        if (progress === 'Incomplete' && resubmitted === 'yes') {
          return res.render('app/garfile/amg/checkin/resubmit', renderObj);
        }

        res.render(template, renderObj);
      })
      .catch((err) => {
        logger.error('Failed to retrieve GAR for AMG check-in', {
          garId,
          errorMessage: err?.message,
          stack: err?.stack,
        });
        res.render('app/garfile/amg/checkin/index', {
          cookie,
          errors: [{ message: 'There was an error retrieving the GAR. Try again later' }],
        });
      });
  } catch (err) {
    logger.error('Failed to retrieve GAR for AMG check-in', {
      garId,
      errorMessage: err?.message,
      stack: err?.stack,
    });
    res.render('app/garfile/amg/checkin/index', {
      cookie,
      errors: [{ message: 'There was an error retrieving the GAR. Try again later' }],
    });
  }
};

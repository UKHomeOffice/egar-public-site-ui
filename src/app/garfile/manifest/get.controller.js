const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const personApi = require('../../../common/services/personApi');
const garApi = require('../../../common/services/garApi');
const  {
  flagDuplicatePeopleIn,
  flagInvalidPeopleIn,
  isAllPeopleUnableToAdd
} = require("../../../common/utils/people.utils");

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  logger.debug('In garfile / manifest get controller');

  const userId = cookie.getUserDbId();
  const garId = cookie.getGarId();

  const getSavedPeople = personApi.getPeople(userId, 'individual');
  const getManifest = garApi.getPeople(garId);

  try {
    const [savedPeopleJson, garpeopleJson] = await Promise.all([getSavedPeople, getManifest]);

    const initialSavedPeople = JSON.parse(savedPeopleJson);
    const savedPeopleManifest = new Manifest(JSON.stringify({ items: initialSavedPeople }));

    const garpeople = JSON.parse(garpeopleJson);
    const garPeopleManifest = new Manifest(garpeopleJson);

    const isValidSavedPeople = await savedPeopleManifest.validate();
    const isValidGarPeople = await garPeopleManifest.validate();
    const flaggedDuplicateSavedPeople = flagDuplicatePeopleIn(
      initialSavedPeople, 
      garpeople.items
    );
    const savedPeople = flagInvalidPeopleIn(
      flaggedDuplicateSavedPeople, 
      savedPeopleManifest.invalidPeople
    );
    const isInvalidSavedPeople = savedPeople.filter((savedPerson) => savedPerson.isInvalid).length > 0;
    const isUnableToAddPeople = isAllPeopleUnableToAdd(savedPeople);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople, 
          isInvalidSavedPeople,
          isUnableToAddPeople,
          manifest: garpeople, 
          errors: [errMsg] 
        });
      }

      if (req.session.manifestErr) {
        const { manifestErr, manifestInvalidPeople } = req.session;
        delete req.session.manifestErr;
        delete req.session.manifestInvalidPeople;
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople, 
          isInvalidSavedPeople,
          manifest: garpeople, 
          manifestInvalidPeople, 
          isUnableToAddPeople,
          errors: manifestErr 
        });
      }

      if (!isValidGarPeople || !isValidSavedPeople) {
        logger.info('Manifest validation failed, redirecting with error msg');
        const invalidGarPeople = garPeopleManifest.genErrValidations();
    
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople,
          isInvalidSavedPeople,
          isUnableToAddPeople,
          manifest: garpeople, 
          manifestInvalidPeople: garPeopleManifest.invalidPeople, 
          errors: invalidGarPeople.length ? invalidGarPeople : undefined
        });
      }

      if (req.session.successMsg) {
        const { successMsg } = req.session;
        delete req.session.successMsg;
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople,
          isInvalidSavedPeople,
          isUnableToAddPeople,
          manifest: garpeople, 
          successMsg 
        });
      }
      return res.render('app/garfile/manifest/index', { 
        cookie, 
        savedPeople,
        isInvalidSavedPeople, 
        isUnableToAddPeople,
        manifest: garpeople 
      });
    } catch(err) {
      // Get savedpeople / manifest failed
      logger.error('Failed to add person to GAR');
      logger.error(err);
      res.render('app/garfile/manifest/index', { 
        cookie, 
        errors: [{ message: 'Failed to get manifest data' }] 
      });
    };
};

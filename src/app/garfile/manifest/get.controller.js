const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const personApi = require('../../../common/services/personApi');
const garApi = require('../../../common/services/garApi');

function flagDuplicatesInSavedPeople(savedPeople, garPeople) {
  logger.info(JSON.stringify({ y: savedPeople }));
  if (garPeople === undefined) return savedPeople;

  const result = savedPeople.map((savedPerson) => {
    const duplicatePersonInGar = garPeople.filter((garPerson) => {
      logger.info(JSON.stringify({
        gfn: garPerson.firstName,
        sfn: savedPerson.firstName,
        gln: garPerson.lastName,
        sln: savedPerson.lastName,
        gdn: garPerson.documentNumber,
        sgn: savedPerson.documentNumber,
        gis: garPerson.issuingState,
        sis: savedPerson.issuingState,
        isDuplicate: (garPerson.firstName === savedPerson.firstName
        && garPerson.lastName === savedPerson.lastName
        && garPerson.documentNumber === savedPerson.documentNumber
        && garPerson.issuingState === savedPerson.issuingState)
      }, 4))
      return (
        garPerson.firstName === savedPerson.firstName
        && garPerson.lastName === savedPerson.lastName
        && garPerson.documentNumber === savedPerson.documentNumber
        && garPerson.issuingState === savedPerson.issuingState
      )
    });

    return { 
      ...savedPerson,
      isDuplicate: duplicatePersonInGar.length > 0 
    };
  })

  logger.info(JSON.stringify(result))
  return result;
}


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
    const savedPeople = flagDuplicatesInSavedPeople(initialSavedPeople, garpeople.items);

      if (req.session.errMsg) {
        const { errMsg } = req.session;
        delete req.session.errMsg;
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople, 
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
          manifestInvalidSavedPeople: savedPeopleManifest.invalidPeople,
          manifest: garpeople, 
          manifestInvalidPeople, 
          errors: manifestErr 
        });
      }

      if (!isValidGarPeople || !isValidSavedPeople) {
        logger.info('Manifest validation failed, redirecting with error msg');
        const invalidGarPeople = garPeopleManifest.genErrValidations();
    
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople, 
          manifest: garpeople, 
          manifestInvalidPeople: garPeopleManifest.invalidPeople, 
          manifestInvalidSavedPeople: savedPeopleManifest.invalidPeople,
          errors: invalidGarPeople.length ? invalidGarPeople : undefined
        });
      }

      if (req.session.successMsg) {
        const { successMsg } = req.session;
        delete req.session.successMsg;
        return res.render('app/garfile/manifest/index', { 
          cookie, 
          savedPeople, 
          manifest: garpeople, 
          successMsg 
        });
      }
      return res.render('app/garfile/manifest/index', { 
        cookie, 
        savedPeople, 
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

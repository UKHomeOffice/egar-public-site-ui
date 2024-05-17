const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const personApi = require('../../../common/services/personApi');
const garApi = require('../../../common/services/garApi');

function flagDuplicatesInSavedPeople(savedPeople, garPeople) {
  if (garPeople === undefined) return savedPeople;

  const result = savedPeople.map((savedPerson) => {
    const duplicatePersonInGar = garPeople.filter((garPerson) => {
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

  return result;
}

function flagInvalidSavedPeople(savedPeople, manifestInvalidSavedPeople) {
  return savedPeople.map((savedPerson, index) => {
    return {
      ...savedPerson,
      isInvalid: manifestInvalidSavedPeople.includes(`person-${index}`)
    }
  })
}

function isAllPeopleUnableToAdd(savedPeople) {
  const peopleUnableToAdd = savedPeople.filter((savedPerson) => {
    return savedPerson.isDuplicate || savedPerson.isInvalid;
  })

  return savedPeople.length === peopleUnableToAdd.length;
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
    const flaggedDuplicateSavedPeople = flagDuplicatesInSavedPeople(
      initialSavedPeople, 
      garpeople.items
    );
    const savedPeople = flagInvalidSavedPeople(
      flaggedDuplicateSavedPeople, 
      savedPeopleManifest.invalidPeople
    );
    const isInvalidSavedPeople = savedPeople.filter((savedPerson) => savedPerson.isInvalid).length > 0;
    const isUnableToAddPeople = isAllPeopleUnableToAdd(savedPeople);

    logger.info(JSON.stringify({ savedPeople }, 4))

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

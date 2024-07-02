const logger = require('../../../common/utils/logger')(__filename);
const CookieModel = require('../../../common/models/Cookie.class');
const { Manifest } = require('../../../common/models/Manifest.class');
const garApi = require('../../../common/services/garApi');
const personApi = require('../../../common/services/personApi');
const manifestUtil = require('./bulkAdd');

module.exports = async (req, res) => {
  const cookie = new CookieModel(req);
  const { buttonClicked } = req.body;

  logger.debug('In garfile / manifest post controller');
  if (req.body.editSavedPerson) {
    req.session.editPersonId = req.body.editSavedPerson;
    req.session.save(() => res.redirect('/people/edit'));
  } else if (req.body.editPersonId) {
    req.session.editPersonId = req.body.editPersonId;
    req.session.save(() => res.redirect('/garfile/manifest/editperson'));
  }  else if (req.body.personId && buttonClicked === 'Add to GAR') {
    logger.debug('Found people to add to manifest');
    manifestUtil.getDetailsByIds(req.body.personId, cookie.getUserDbId())
      .then((selectedPeople) => {
        garApi.patch(cookie.getGarId(), 'Draft', { people: selectedPeople })
          .then(() => {
            console.debug({ people: selectedPeople })
            res.redirect('/garfile/manifest');
          })
          .catch((err) => {
            logger.error(err);
            logger.error(`user_id: ${cookie.getUserDbId()}, gar_id: ${cookie.getGarId()} > Failed to patch GAR with updated manifest`);
            req.session.manifestErr = [{ 
              message: 'Failed to patch GAR with updated manifest',
              identifier: ''
            }];
            res.redirect('/garfile/manifest');
          });
      })
      .catch(() => {
        logger.error(`user_id: ${cookie.getUserDbId()}, gar_id: ${cookie.getGarId()} > Failed to retrieve manifest ids`);
        req.session.manifestErr = [{ 
          message: 'Failed to patch GAR with updated manifest',
          identifier: ''
        }];
        res.redirect('/garfile/manifest');
      });
  } else if (req.body.garPeopleId && buttonClicked === 'Add to PEOPLE') {
    logger.debug('Found person(s) to add to people');

    const addPeopleToGarIds = typeof req.body.garPeopleId === 'string' 
      ? [req.body.garPeopleId]
      : req.body.garPeopleId;
      
    manifestUtil.getgarPeopleIds(addPeopleToGarIds, cookie.getGarId())
      .then((selectedPeople) => {
        const people = selectedPeople.map(function (element) {
          return ({ 
            firstName: element.firstName,
            lastName: element.lastName,
            dateOfBirth: element.dateOfBirth,
            documentNumber: element.documentNumber,
            documentExpiryDate: element.documentExpiryDate,
            documentType: element.documentType,
            documentDesc: element.documentDesc,
            nationality: element.nationality,
            gender: element.gender,
            issuingState: element.issuingState,
            placeOfBirth: element.placeOfBirth,
            peopleType: element.peopleType
          });
        });
        personApi.create(cookie.getUserDbId(), { people })
          .then(() => {
            req.session.successMsg = 'Person successfully added to people!';
            res.redirect('/garfile/manifest');
          })
          .catch(() => {
            logger.info('Failed to create People with updated manifest');
            res.redirect('/garfile/manifest');
          });
      })
      .catch(() => {
        logger.info('Failed to retrieve manifest ids');
        res.redirect('/garfile/manifest');
      });
  } else if (req.body.buttonClicked === 'Save and Exit') {
    res.redirect('/garfile/manifest');
  } else if (req.body.buttonClicked === 'Continue') {
    
    const isMilitaryFlight = Boolean(req.body.isMilitaryFlight);
    cookie.setIsMilitaryFlight(isMilitaryFlight);
    
    try {
      await garApi.patch(cookie.getGarId(), cookie.getGarStatus(), { isMilitaryFlight })
    } catch(err) {
      logger.error('Failed to update GAR');
      logger.error(err);
      req.session.manifestErr = [{
        message: 'Failed to update GAR',
        identifier: ''
      }];
      return res.redirect('/garfile/manifest');
    }

    let apiResponse;

    try {
      apiResponse = await garApi.getPeople(cookie.getGarId())
    } catch (err) {
      logger.error('Failed to get manifest');
      logger.error(err);
      req.session.manifestErr = [{
        message: 'Failed to get manifest',
        identifier: ''
      }];
      return res.redirect('/garfile/manifest');
    }
    
    try {
      const manifest = new Manifest(apiResponse);

      if (!isMilitaryFlight && !manifest.validateCaptainCrew()) {
        logger.error(`user ${cookie.getUserDbId()}, gar ${cookie.getGarId()}: Manifest validation no crew`);
        req.session.manifestInvalidPeople = [];
        req.session.manifestErr = [{
          message: __('has_no_crew_or_captains'),
          identifier: 'manifestTable_row'
        }];
        return res.redirect('/garfile/manifest');
      }

      const isValid = await manifest.validate();
      
      if (isValid) {
        return res.redirect('/garfile/resperson');
      } 

      logger.info('Manifest validation failed, redirecting with error msg');
      req.session.manifestErr = manifest.genErrValidations();
      req.session.manifestInvalidPeople = manifest.invalidPeople;
      return res.redirect('/garfile/manifest');

    } catch (err) {
      
      logger.error(`user ${cookie.getUserDbId()}, gar ${cookie.getGarId()} > ${JSON.stringify(err)}`);
      req.session.manifestErr = [{
        message: 'Failed to submit manifest',
        identifier: ''
      }];
      return res.redirect('/garfile/manifest');
    }
  } else {
    res.redirect('/garfile/manifest');
  }
};

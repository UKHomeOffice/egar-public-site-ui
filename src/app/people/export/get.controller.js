const CookieModel = require('../../../common/models/Cookie.class');
const { personApi } = require('../../../common/services/dataAccessApi');
const logger = require('../../../common/utils/logger')(__filename);
const createArrayCsvStringifier = require('csv-writer').createArrayCsvStringifier;

const writePeopleAsCSVtoResponse = (res, people) => {
  const csvStringifier = createArrayCsvStringifier({
    header: [
      'Id',
      'First Name',
      'Last Name',
      'Gender',
      'DoB',
      'Nationality',
      'Doc Type',
      'Doc Number',
      'Doc Expiry',
      'Doc Issuing State',
      'Type',
    ],
  });

  const dateSlug = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-disposition', 'attachment; filename=people-' + dateSlug + '.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.write(csvStringifier.getHeaderString());
  res.write(csvStringifier.stringifyRecords(people));
  res.end();
};

module.exports = (req, res) => {
  const cookie = new CookieModel(req);
  const userId = cookie.getUserDbId();
  logger.debug(`In people export get controller, user ${userId} is exporting data.`);

  return personApi
    .getPeople(userId, 'individual')
    .then((values) => {
      const people = values.map((person) => {
        return [
          person.personId,
          person.firstName,
          person.lastName,
          person.gender,
          person.dateOfBirth,
          person.nationality,
          person.documentType,
          person.documentNumber,
          person.documentExpiryDate,
          person.issuingState,
          person.peopleType.name,
        ];
      });

      writePeopleAsCSVtoResponse(res, people);
    })
    .catch((err) => {
      logger.error('Failed to export saved people', { errorMessage: err?.message, stack: err?.stack });
      req.session.errMsg = { message: 'Failed to export saved people. Try again' };
      return req.session.save(() => res.redirect('/people'));
    });
};

const CookieModel = require('../../../common/models/Cookie.class');
const { organisationApi } = require('../../../common/services/dataAccessApi');
const logger = require('../../../common/utils/logger')(__filename);
const createArrayCsvStringifier = require('csv-writer').createArrayCsvStringifier;

const writeUsersAsCSVtoResponse = (res, orgUsers, orgName) => {
  const csvStringifier = createArrayCsvStringifier({
    header: ['Id', 'First Name', 'Last Name', 'Email', 'Role', 'State'],
  });

  const orgSlug = orgName.replace(/[^A-z]/, '-');
  const dateSlug = new Date().toISOString().slice(0, 10);

  res.setHeader('Content-disposition', 'attachment; filename=' + orgSlug + '-users-' + dateSlug + '.csv');
  res.setHeader('Content-Type', 'text/csv');

  res.write(csvStringifier.getHeaderString());
  res.write(csvStringifier.stringifyRecords(orgUsers));
  res.end();
};

module.exports = (req, res) => {
  const cookie = new CookieModel(req);

  // to retrieve all rows, the 1st to the last row from the users table
  // set the offset up to the end of the result set (a large number for the second parameter).
  return organisationApi
    .getUsers(cookie.getOrganisationId(), 1, 999999999999999)
    .then((values) => {
      const orgUsers = values.items.map((orgUser) => {
        return [orgUser.userId, orgUser.firstName, orgUser.lastName, orgUser.email, orgUser.role.name, orgUser.state];
      });

      writeUsersAsCSVtoResponse(res, orgUsers, cookie.getOrganisationName());
    })
    .catch((err) => {
      logger.error('Failed to export organisation users', { errorMessage: err?.message, stack: err?.stack });
      req.session.errMsg = { message: 'Failed to export organisation users. Try again' };
      return req.session.save(() => res.redirect('/organisation'));
    });
};

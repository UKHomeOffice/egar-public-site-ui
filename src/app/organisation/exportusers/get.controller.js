const CookieModel = require('../../../common/models/Cookie.class');
const orgApi = require('../../../common/services/organisationApi');
const logger = require('../../../common/utils/logger')(__filename);
const createArrayCsvStringifier = require('csv-writer').createArrayCsvStringifier;



const writeUsersAsCSVtoResponse = (res, orgUsers, orgName) => {
    const csvStringifier = createArrayCsvStringifier({
        header: ['Id', 'First Name', 'Last Name', 'Email', 'Role', 'State']
    });

    const orgSlug = orgName.replace(/[^A-z]/, '-')
    const dateSlug = new Date().toISOString().slice(0,10);

    res.setHeader('Content-disposition', 'attachment; filename=' + orgSlug + '-users-' + dateSlug + '.csv');
    res.setHeader('Content-Type', 'text/csv');
    
    res.write(csvStringifier.getHeaderString());
    res.write(csvStringifier.stringifyRecords(orgUsers));
    res.end();
}

module.exports = (req, res) => {
    logger.debug('In organisation export users get controller');
    const cookie = new CookieModel(req);

    orgApi.getUsers(cookie.getOrganisationId())
        .then((values) => {
            
            const orgUsers = JSON.parse(values).items.map((orgUser) => {

                return [orgUser.userId, orgUser.firstName, orgUser.lastName, orgUser.email, orgUser.role.name, orgUser.state];
            });

            writeUsersAsCSVtoResponse(res, orgUsers, cookie.getOrganisationName());
        }
        )
}
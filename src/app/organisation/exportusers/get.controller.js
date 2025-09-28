import CookieModel from '../../../common/models/Cookie.class.js';
import orgApi from '../../../common/services/organisationApi.js';
import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import { createArrayCsvStringifier } from 'csv-writer';


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

export default (req, res) => {
    logger.debug('In organisation export users get controller');
    const cookie = new CookieModel(req);

    // to retrieve all rows, the 1st to the last row from the users table
    // set the offset up to the end of the result set (a large number for the second parameter).
    orgApi.getUsers(cookie.getOrganisationId(), 1, 999999999999999)
        .then((values) => {

            const orgUsers = JSON.parse(values).items.map((orgUser) => {

                return [orgUser.userId, orgUser.firstName, orgUser.lastName, orgUser.email, orgUser.role.name, orgUser.state];
            });

            writeUsersAsCSVtoResponse(res, orgUsers, cookie.getOrganisationName());
        }
        )
};

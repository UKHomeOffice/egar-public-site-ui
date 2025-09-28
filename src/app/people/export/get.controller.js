import { getPeople } from '../../../common/config/endpoints.js';
import CookieModel from '../../../common/models/Cookie.class.js';
import personApi from '../../../common/services/personApi.js';
import loggerFactory from '../../../common/utils/logger.js';
const logger = loggerFactory(import.meta.url);
import { createArrayCsvStringifier } from 'csv-writer';

const writePeopleAsCSVtoResponse = (res, people) => {
    const csvStringifier = createArrayCsvStringifier({
        header: ['Id', 'First Name', 'Last Name', 'Gender', 'DoB', 'Nationality', 'Doc Type', 'Doc Number', 'Doc Expiry', 'Doc Issuing State', 'Type']
    });

    const dateSlug = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-disposition', 'attachment; filename=people-' + dateSlug + '.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.write(csvStringifier.getHeaderString());
    res.write(csvStringifier.stringifyRecords(people));
    res.end();
}

export default (req, res) => {
    const cookie = new CookieModel(req);
    const userId = cookie.getUserDbId();
    logger.debug(`In people export get controller, user ${userId} is exporting data.`);

    personApi.getPeople(userId, 'individual')
        .then((values) => {

            const people = JSON.parse(values).map((person) => {

                return [person.personId, person.firstName, person.lastName, person.gender, person.dateOfBirth, person.nationality, person.documentType, person.documentNumber, person.documentExpiryDate, person.issuingState, person.peopleType.name];
            });

            writePeopleAsCSVtoResponse(res, people);
        }
        )
};
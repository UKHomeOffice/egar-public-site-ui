import loggerFactory from '../../../common/utils/logger.js';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const logger = loggerFactory(__filename);
import CookieModel from '../../../common/models/Cookie.class.js';
import fixedBasedOperatorOptions from '../../../common/seeddata/fixed_based_operator_options.json' with { type: "json"};
import utils from '../../../common/utils/utils.js';
import validator from '../../../common/utils/validator.js';
import validations from '../../resperson/validations.js';
import resPersonApi from '../../../common/services/resPersonApi.js';
import garApi from '../../../common/services/garApi.js';

export default async (req, res) => {
    const cookie = new CookieModel(req);
    const { buttonClicked } = req.body;
    const resPersonId = req.body.addResponsiblePerson;
    if (resPersonId && buttonClicked === 'Add to GAR') {
        try {
            res.redirect('/garfile/resperson?resPersonId=' + resPersonId);
        } catch (err) {
            logger.error('API failed to retrieve gar responsible person');
            logger.error(err);
            res.render('app/garfile/resperson/index', context, {
                errors: [{
                    message: 'Problem retrieving GAR',
                }],
            });
        };
    } else {

        const responsiblePerson = utils.getResponsiblePersonFromReq(req);
        const resPersonsResponse = await resPersonApi.getResPersons(cookie.getUserDbId());
        const responsiblePersons = await JSON.parse(resPersonsResponse);
        validator.validateChains(validations(req))
            .then(() => {
                garApi.patch(cookie.getGarId(), cookie.getGarStatus(), responsiblePerson)
                    .then((apiResponse) => {
                        const parsedResponse = JSON.parse(apiResponse);
                        if (Object.prototype.hasOwnProperty.call(parsedResponse, 'message')) {
                            res.render('app/garfile/resperson/index', {
                                cookie, fixedBasedOperatorOptions, errors: [parsedResponse],
                            });
                            return;
                        }
                        // Successful api response
                        cookie.setGarResponsiblePerson(responsiblePerson);
                        if (buttonClicked === 'Save and continue') {
                            res.redirect('/garfile/customs');
                        } else {
                            res.redirect(307, '/garfile/view');
                        }
                    })
                    .catch((err) => {
                        logger.error('API failed to update GAR');
                        logger.error(err);
                        res.render('app/garfile/resperson/index', {
                            cookie, responsiblePerson, responsiblePersons, fixedBasedOperatorOptions, errors: [{ message: 'Failed to add to GAR' }],
                        });
                    });
            })
            .catch((err) => {
                logger.info('GAR responsible person validation failed', err);
                cookie.setGarResponsiblePerson(responsiblePerson);
                res.render('app/garfile/resperson/index', {
                    cookie, responsiblePerson, responsiblePersons, fixedBasedOperatorOptions, errors: err,
                });
            });

    }
};
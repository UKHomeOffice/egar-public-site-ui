const {
    WORKFLOW_STEPS,
    PHASE_GIVEN_NAME,
    PHASE_CONFIRM_NAME,
    PHASE_REGISTRATION_COMPLETE
} = require("./constants");
const CookieModel = require("../../../common/models/Cookie.class");
const {decodeToken} = require("../../../common/utils/oneLoginAuth");
const oneLoginApi = require('../../../common/services/oneLoginApi');
const userApi = require('../../../common/services/userManageApi');
const logger = require('../../../common/utils/logger')(__filename);
const ValidationRule = require('../../../common/models/ValidationRule.class');
const validator = require("../../../common/utils/validator");
const {USER_GIVEN_NAME_CHARACTER_COUNT, USER_SURNAME_CHARACTER_COUNT} = require("../../../common/config");
const e = require("express");
const sendEmail = require("../../../common/services/sendEmail");
const config = require("../../../common/config");
const {getUserInviteToken} = require("../../../common/services/verificationApi");

const Outcome = {
    SUCCESS: 'success',
    VALIDATION_FAILED: 'validation_failed',
    ERROR: 'error',
    DECLARATION_NOT_CHECKED: 'declaration_not_checked'
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<[string,{firstName: *, lastName: *, email: *}]>}
 */
async function handleGivenNameSubmission(req, res) {
    let {userFname: firstName, userLname: lastName} = req.body;

    firstName = firstName.trim();
    lastName = lastName.trim();

    const fnameChain = [
      new ValidationRule(validator.validFirstNameLength, 'userFname', firstName, `Enter given names of at most ${USER_GIVEN_NAME_CHARACTER_COUNT} characters`),
      new ValidationRule(validator.nameHasNoNumbers, 'userFname', firstName, 'Your given names cannot include numbers'),
      new ValidationRule(validator.validName, 'userFname', firstName, 'Your given names cannot include special characters or numbers'),
        new ValidationRule(validator.notEmpty, 'userFname', firstName, 'Enter your given names'),
    ];
    const lnameChain = [
      new ValidationRule(validator.nameHasNoNumbers, 'userLname', lastName, 'Your family name cannot include numbers'),
      new ValidationRule(validator.validName, 'userLname', lastName, 'Your family name cannot include special characters or numbers'),
      new ValidationRule(validator.validSurnameLength, 'userLname', lastName, `Please enter a family name of at most ${USER_SURNAME_CHARACTER_COUNT} characters`),
      new ValidationRule(validator.notEmpty, 'userLname', lastName, 'Enter your family name'),
    ];

    let errors = [];

    try {
      await validator.validateChains([fnameChain, lnameChain])

      try {
        const {access_token: accessToken} = req.session;
        const {email, sub} = await oneLoginApi.getUserInfoFromOneLogin(accessToken)

        const step_data = {
          firstName,
          lastName,
          email,
          sub,
        }

        logger.info("Validating user Given Names submission");

        return [Outcome.SUCCESS, step_data, null]
      } catch (apiError) {
        logger.error("API error when getting user info");
        logger.error(apiError);
        return [Outcome.ERROR, apiError.message || 'API error', null];
      }
    } catch (validationError) {
      errors = validationError
      logger.error("Validation error");

      return [Outcome.VALIDATION_FAILED, {firstName, lastName, errors}, null];
    }
}

async function handleConfirmNameSubmission(req, res) {
    if (!req.body.nameConfirmDeclaration) {
        logger.info("Declaration not checked in name confirmation");
        return [Outcome.DECLARATION_NOT_CHECKED, 'Declaration not checked', '/onelogin/register'];
    }
    const {email, firstName, lastName, sub, tokenId} = req.session.step_data;
    let resp = {};

    try {
        const {tokenId} = await getUserInviteToken(email)

        resp = await userApi.createUser(email, firstName, lastName, sub, 'verified', tokenId);

   } catch (error) {
        logger.error("Exception when creating user");
        logger.error(error);
        return [Outcome.ERROR, error.message || 'Error creating user', null];
    }

    if (resp.message) {
        logger.error("Error creating user");
        logger.error(resp.message);
        return [Outcome.ERROR, resp.message, null];
    }
    const {userId, state, role, organisation} = resp

    const cookie = new CookieModel(req);
    cookie.setUserEmail(email);
    cookie.setUserFirstName(firstName);
    cookie.setUserLastName(lastName);
    cookie.setUserDbId(userId);
    cookie.setUserVerified(state === 'verified');
    cookie.setUserRole(role.name);
    cookie.setOrganisationId(organisation?.organisationId);

    try {
      await sendEmail.send(
        config.NOTIFY_ONELOGIN_NEW_USER_REGISTERED_EMAIL_TEMPLATE_ID,
        email,
        {
          user: `${firstName}`,
        }
      );
    } catch (error) {
        logger.error("Exception when creating user");
        logger.error(error);
        return [Outcome.ERROR, error.message || 'Error creating user', null];
    }

    return [Outcome.SUCCESS, {}, null];

}

function handleCompleteSubmission(req, res) {
    delete req.session.access_token;
    delete req.session.step;
    delete req.session.step_data;

    delete req.cookies.state;
    delete req.cookies.nonce;


    return [Outcome.SUCCESS, null, '/home'] ;
}


const stepHandlerMapping = {
    [PHASE_GIVEN_NAME]: handleGivenNameSubmission,
    [PHASE_CONFIRM_NAME]: handleConfirmNameSubmission,
    [PHASE_REGISTRATION_COMPLETE]: handleCompleteSubmission
}

function nextStep(currentStep) {
    const index = WORKFLOW_STEPS.indexOf(currentStep);
    return WORKFLOW_STEPS[index + 1];
}


module.exports = async (req, res) => {
  if (!req.session?.step) {
    return res.redirect('error/404');
  }

  let stepValue = req.session.step;

  if (!WORKFLOW_STEPS.includes(stepValue)) {
    return res.redirect('error/404');
  }
  const  [outCome, data, redirect] = await stepHandlerMapping[req.session.step](req, res);

  switch (outCome) {
    case Outcome.SUCCESS:
      stepValue = nextStep(stepValue);
      req.session.step = stepValue;
      req.session.step_data = data;
      req.session.save();

      if (redirect === "/home" ) {
        delete req.session.step_data;
        delete req.session.step;
        return res.redirect(redirect);
      }
      break;
    case Outcome.VALIDATION_FAILED:
      return res.render('app/user/onelogin/index', {step: `app/user/onelogin/partials/${stepValue}.njk`, ...data});
    case Outcome.DECLARATION_NOT_CHECKED:
      logger.info('Declaration not checked in confirmation flow');
      return res.redirect('/onelogin/register');
    case Outcome.ERROR:
      logger.error('Error in onelogin flow: ' + data);
      return res.redirect('error/404')
  }

  return res.redirect('/onelogin/register');
};

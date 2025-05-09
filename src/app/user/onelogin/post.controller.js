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

const Outcome = {
    SUCCESS: 'success',
    VALIDATION_FAILED: 'validation_failed',
    ERROR: 'error'
}

/**
 *
 * @param req
 * @param res
 * @returns {Promise<[string,{firstName: *, lastName: *, email: *}]>}
 */
async function handleGivenNameSubmission(req, res) {
    const {userFname: firstName, userLname: lastName} = req.body;

    const fnameChain = [
      new ValidationRule(validator.notEmpty, 'userFname', firstName, 'Please enter your given name'),
      new ValidationRule(validator.validName, 'userFname', firstName, 'Please enter a valid given name'),
      new ValidationRule(validator.validFirstNameLength, 'userFname', firstName, `Please enter a given name of at most ${USER_GIVEN_NAME_CHARACTER_COUNT} characters`),
    ];
    const lnameChain = [
      new ValidationRule(validator.notEmpty, 'userLname', lastName, 'Please enter your family name'),
      new ValidationRule(validator.validName, 'userLname', lastName, 'Please enter a valid family name'),
      new ValidationRule(validator.validSurnameLength, 'userLname', lastName, `Please enter a family name of at most ${USER_SURNAME_CHARACTER_COUNT} characters`),
    ];

    let errors = [];

    try {
      await validator.validateChains([fnameChain, lnameChain])

      const {access_token: accessToken} = req.cookies;
      const {email, sub} = await oneLoginApi.getUserInfoFromOneLogin(accessToken)

      const step_data = {
        firstName,
        lastName,
        email,
        sub,
      }

      logger.info("Validating user Given Name submission");

      return [Outcome.SUCCESS, step_data, null]
    } catch (e) {
      errors = e
      logger.error("Error creating user");
      logger.error(e);
    }

    return [Outcome.VALIDATION_FAILED, {firstName, lastName, errors}, null];
}

async function handleConfirmNameSubmission(req, res) {
    if (!req.body.nameConfirmDeclaration) {
        return Outcome.ERROR;
    }
    const {email, firstName, lastName, sub} = req.session.step_data;
    const resp = await userApi.createUser(email, firstName, lastName, sub, 'verified');

    if (resp.message) {
        return [Outcome.ERROR, resp.message, null];
    }

    const cookie = new CookieModel(req);
    cookie.setUserEmail(email);
    cookie.setUserFirstName(firstName);
    cookie.setUserLastName(lastName);
    cookie.setUserDbId(resp.userId);
    cookie.setUserVerified(resp.state === 'verified');
    cookie.setUserRole(resp.role.name);

    return [Outcome.SUCCESS, {}, null];
}

function handleCompleteSubmission(req, res) {
    delete req.session.id_token;
    delete req.session.access_token;
    delete req.session.state;
    delete req.session.nonce;
    delete req.session.step;
    delete req.session.step_data;
    req.session.save();

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
      }

      return res.redirect(redirect);
    case Outcome.VALIDATION_FAILED:
      return res.render('app/user/onelogin/index', {step: `app/user/onelogin/partials/${stepValue}.njk`, ...data});
  }

  return res.redirect('/onelogin/register');
};

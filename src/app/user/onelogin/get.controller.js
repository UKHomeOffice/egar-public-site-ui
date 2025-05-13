const navUtil = require('../../../common/utils/nav');
const {PHASE_GIVEN_NAME, WORKFLOW_STEPS}  = require('./constants');
const logger = require('../../../common/utils/logger')(__filename);



module.exports = (req, res) => {
  let stepValue = req.session.step || PHASE_GIVEN_NAME;

  if (!WORKFLOW_STEPS.includes(stepValue)) {
    return res.redirect('error/404');
  }

  if (req.query.action === 'change-name') {
    stepValue = PHASE_GIVEN_NAME;
  }

  req.session.step = stepValue;

  return req.session.save((err) => {
    if (err) {
      logger.error(`Failed to save session: ${err}`);
      return res.redirect('error/404');
    }

    const stepData = req.session?.step_data;
    return res.render('app/user/onelogin/index', {step: `app/user/onelogin/partials/${stepValue}.njk`, ...stepData});
  });
};

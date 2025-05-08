const navUtil = require('../../../common/utils/nav');
const {PHASE_GIVEN_NAME, WORKFLOW_STEPS}  = require('./constants');



module.exports = (req, res) => {
  let stepValue = req.session.step || PHASE_GIVEN_NAME;

  if (req.query.action === 'change-name') {
    stepValue = PHASE_GIVEN_NAME;
  }


  if (!WORKFLOW_STEPS.includes(stepValue)) {
    return res.redirect('error/404');
  }
  req.session.step = stepValue;
  const stepData = req.session?.step_data;
  console.log(stepData);
  req.session.save();
  return res.render('app/user/onelogin/index', {step: `app/user/onelogin/partials/${stepValue}.njk`, ...stepData});
};

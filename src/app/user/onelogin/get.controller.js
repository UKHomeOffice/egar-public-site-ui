const { PHASE_GIVEN_NAME, WORKFLOW_STEPS } = require('./constants');

const checkKeys = (obj, ...keys) => {
  if (!obj) return false;
  return keys.every((key) => Object.prototype.hasOwnProperty.call(obj, key));
};

module.exports = (req, res) => {
  if (
    !checkKeys(req.cookies, 'state', 'id_token', 'nonce') ||
    req.headers.referer === null ||
    !req.session?.access_token
  ) {
    return res.redirect('/');
  }

  let stepValue = req.session.step || PHASE_GIVEN_NAME;

  if (!WORKFLOW_STEPS.includes(stepValue)) {
    return res.redirect('error/404');
  }

  if (req.query.action === 'change-name') {
    stepValue = PHASE_GIVEN_NAME;
  }

  req.session.step = stepValue;
  const stepData = req.session?.step_data;
  return res.render('app/user/onelogin/index', {
    step: `app/user/onelogin/partials/${stepValue}.njk`,
    ...stepData,
  });
};

import navUtil from '../../common/utils/nav.js';
import availability from '../../common/config/availability.js';

export default (req, res) => {
  if (availability.ENABLE_UNAVAILABLE_PAGE.toLowerCase() === 'false') {
    res.redirect('/welcome/index')
  } else {
    navUtil.simpleGetRender(req, res, 'app/unavailable/index');
  };
};
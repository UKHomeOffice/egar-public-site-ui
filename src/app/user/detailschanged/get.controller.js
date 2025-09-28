import navUtil from '../../../common/utils/nav.js';

export default (req, res) => {
  navUtil.simpleGetRender(req, res, 'app/user/detailschanged/index');
};

import nav from '../../../common/utils/nav.js';

import getController from './get.controller.js';

import postController from './post.controller.js';

export default nav.buildRouterAndPathsNoUserCheck('/login', getController, postController);

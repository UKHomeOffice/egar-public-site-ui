import index from './index/index.js';

import healthcheck from './api/healthcheck/index.js';

import uploadfile from './api/uploadfile/index.js';
import uploadgar from './api/uploadgar/index.js';

import welcome from './welcome/index.js';

import usersignin from './user/login/index.js';

import postusersignin from './home/index.js';
import userregister from './user/register/index.js';
import registermsg from './user/regmsg/index.js';
import oneloginRegister from './user/onelogin/index.js';

import aircraft from './aircraft/index.js';

import userDetails from './user/viewDetails/index.js';
import manageUserDetails from './user/manageuserdetail/index.js';
import logout from './user/logout/index.js';
import detailschanged from './user/detailschanged/index.js';
import usersavedcraftedit from './aircraft/edit/index.js';
import usersavedcraftadd from './aircraft/add/index.js';
import userSavedCraftDelete from './aircraft/delete/index.js';
import userDelete from './user/deleteAccount/index.js';
import userDeleteConfirm from './user/deleteAccount/deleteAccountConfirmation/index.js';

import aircraftdetail from './garfile/craft/index.js';

import customsDetail from './garfile/customs/index.js';
import departuredetail from './garfile/departure/index.js';
import arrivaldetail from './garfile/arrival/index.js';
import garhome from './garfile/home/index.js';
import manifest from './garfile/manifest/index.js';
import addnewperson from './garfile/manifest/addnewperson/index.js';
import editPerson from './garfile/manifest/editperson/index.js';
import deletePerson from './garfile/manifest/deleteperson/index.js';
import garManage from './home/index.js';
import supportingdocuments from './garfile/supportingdocuments/index.js';
import garreview from './garfile/review/index.js';
import garupload from './garfile/garupload/index.js';
import garView from './garfile/view/index.js';
import garCancel from './garfile/cancel/index.js';
import garAmend from './garfile/amend/index.js';
import garsubmitsucess from './garfile/submit/success/index.js';
import garsubmitfailure from './garfile/submit/failure/index.js';
import printmanifest from './garfile/printmanifest/index.js';

import amgcheckin from './garfile/amg/checkin/index.js';

import people from './people/index.js';

import peopleAdd from './people/add/index.js';
import peopleEdit from './people/edit/index.js';
import peopleDelete from './people/delete/index.js';
import peopleExport from './people/export/index.js';

import resperson from './resperson/index.js';

import respersonAdd from './resperson/add/index.js';
import respersonEdit from './resperson/edit/index.js';
import respersonDelete from './resperson/delete/index.js';
import respersonDetail from './garfile/resperson/index.js';

import error from './error/index.js';

import cookies from './cookie/index.js';
import help from './help/index.js';
import unavailable from './unavailable/index.js';
import accessibility from './accessibility/index.js';

import verifyregisteruser from './verify/registeruser/index.js';

import verifytokenuser from './verify/index.js';
import verifyInvite from './verify/organisationinvite/index.js';
import verifyMfa from './verify/mfa/index.js';

import organisation from './organisation/index.js';

import createorganisation from './organisation/create/index.js';
import inviteuserorganisation from './organisation/inviteusers/index.js';
import orgcreatesuccess from './organisation/createsuccess/index.js';
import orginvitesuccess from './organisation/invitesuccess/index.js';
import editorganisation from './organisation/editorganisation/index.js';
import orgassignrole from './organisation/assignrole/index.js';
import orgEditUsers from './organisation/editusers/index.js';
import deleteUser from './organisation/delete/index.js';
import exportusers from './organisation/exportusers/index.js';
import searchUsers from './organisation/searchusers/index.js';


// Export
export default(app) => {
  app.use(healthcheck.router);
  app.use(index.router);
  app.use(welcome.router);
  app.use(usersignin.router);
  app.use(userregister.router);
  app.use(registermsg.router);
  app.use(aircraftdetail.router);
  app.use(departuredetail.router);
  app.use(arrivaldetail.router);
  app.use(verifyregisteruser.router);
  app.use(verifytokenuser.router);
  app.use(error.router);
  app.use(logout.router);
  app.use(postusersignin.router);
  app.use(organisation.router);
  app.use(createorganisation.router);
  app.use(manageUserDetails.router);
  app.use(detailschanged.router);
  app.use(orgcreatesuccess.router);
  app.use(inviteuserorganisation.router);
  app.use(orginvitesuccess.router);
  app.use(editorganisation.router);
  app.use(orgassignrole.router);
  app.use(verifyInvite.router);
  app.use(orgEditUsers.router);
  app.use(exportusers.router)
  app.use(deleteUser.router);
  app.use(searchUsers.router);
  app.use(usersavedcraftedit.router);
  app.use(userSavedCraftDelete.router);
  app.use(usersavedcraftadd.router);
  app.use(userDelete.router);
  app.use(userDeleteConfirm.router);
  app.use(customsDetail.router);
  app.use(garhome.router);
  app.use(manifest.router);
  app.use(addnewperson.router);
  app.use(editPerson.router);
  app.use(deletePerson.router);
  app.use(supportingdocuments.router);
  app.use(uploadfile.router);
  app.use(uploadgar.router);
  app.use(garreview.router);
  app.use(garupload.router);
  app.use(addnewperson.router);
  app.use(garManage.router);
  app.use(garView.router);
  app.use(garCancel.router);
  app.use(garAmend.router);
  app.use(garsubmitfailure.router);
  app.use(garsubmitsucess.router);
  app.use(verifyMfa.router);
  app.use(aircraft.router);
  app.use(userDetails.router);
  app.use(people.router);
  app.use(peopleAdd.router);
  app.use(peopleEdit.router);
  app.use(peopleDelete.router);
  app.use(peopleExport.router);
  app.use(cookies.router);
  app.use(help.router);
  app.use(accessibility.router)
  app.use(unavailable.router);
  app.use(printmanifest.router);
  app.use(resperson.router);
  app.use(respersonAdd.router);
  app.use(respersonDelete.router);
  app.use(respersonEdit.router);
  app.use(respersonDetail.router);
  app.use(amgcheckin.router);
  app.use(oneloginRegister.router);
};

const index = require('./index');
// Local dependencies
const healthcheck = require('./api/healthcheck');
const uploadfile = require('./api/uploadfile');
const uploadgar = require('./api/uploadgar');

// Welcome dependencies
const welcome = require('./welcome');

// Register dependencies
const usersignin = require('./user/login');
const postusersignin = require('./home');
const userregister = require('./user/register');
const registermsg = require('./user/regmsg');

// User dependencies
const aircraft = require('./aircraft');
const userDetails = require('./user/viewDetails');
const manageUserDetails = require('./user/manageuserdetail');
const logout = require('./register/logout');
const detailschanged = require('./user/detailschanged');
const usersavedcraftedit = require('./aircraft/edit');
const usersavedcraftadd = require('./aircraft/add');
const userSavedCraftDelete = require('./aircraft/delete');
const userDelete = require('./user/deleteAccount');

// GAR dependencies
const aircraftdetail = require('./garfile/craft');
const responsiblepersondetail = require('./garfile/responsibleperson');
const customsDetail = require('./garfile/customs');
const departuredetail = require('./garfile/departure');
const arrivaldetail = require('./garfile/arrival');
const garhome = require('./garfile/home');
const manifest = require('./garfile/manifest');
const addnewperson = require('./garfile/manifest/addnewperson');
const editPerson = require('./garfile/manifest/editperson');
const deletePerson = require('./garfile/manifest/deleteperson');
const garManage = require('./home');
const supportingdocuments = require('./garfile/supportingdocuments');
const garreview = require('./garfile/review');
const garupload = require('./garfile/garupload');
const garView = require('./garfile/view');
const garCancel = require('./garfile/cancel');
const garsubmitsucess = require('./garfile/submit/success');
const garsubmitfailure = require('./garfile/submit/failure');

// Saved entities
const people = require('./people');
const peopleAdd = require('./people/add');
const peopleEdit = require('./people/edit');
const peopleDelete = require('./people/delete');

// Misc dependency
const error = require('./error');
const cookies = require('./cookie');
const help = require('./help');
const unavailable = require('./unavailable');

// veirfy registeruser
const verifyregisteruser = require('./verify/registeruser');
const verifytokenuser = require('./verify');
const verifyInvite = require('./verify/organisationinvite');
const verifyMfa = require('./verify/mfa');

// organisation
const organisation = require('./organisation');
const createorganisation = require('./organisation/create');
const inviteuserorganisation = require('./organisation/inviteusers');
const orgcreatesuccess = require('./organisation/createsuccess');
const orginvitesuccess = require('./organisation/invitesuccess');
const editorganisation = require('./organisation/editorganisation');
const orgassignrole = require('./organisation/assignrole');
const orgEditUsers = require('./organisation/editusers');

// Export
module.exports.bind = (app) => {
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
  app.use(usersavedcraftedit.router);
  app.use(userSavedCraftDelete.router);
  app.use(usersavedcraftadd.router);
  app.use(userDelete.router);
  app.use(responsiblepersondetail.router);
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
  app.use(garsubmitfailure.router);
  app.use(garsubmitsucess.router);
  app.use(verifyMfa.router);
  app.use(aircraft.router);
  app.use(userDetails.router);
  app.use(people.router);
  app.use(peopleAdd.router);
  app.use(peopleEdit.router);
  app.use(peopleDelete.router);
  app.use(cookies.router);
  app.use(help.router);
  app.use(unavailable.router);
};

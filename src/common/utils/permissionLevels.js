const permissionLevels = {
  User: 0,
  Manager: 1,
  Admin: 2,
};

/**
 * Restrict user from accessing some pages such as Organisation, assingrole, editorganisation
 * @param {*} res 
 * @param {*} userRole 
 * @returns 
 */
const checkAccessToPage = (res, userRole) => {
 if (userRole === 'User') 
  return res.redirect('/home');
}

module.exports = {
  permissionLevels,
  checkAccessToPage,
};
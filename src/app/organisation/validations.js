const ValidationRule = require('../../common/models/ValidationRule.class');
const validator = require('../../common/utils/validator');
const { MAX_ORGANISATION_NAME_LENGTH } = require('../../common/config/index');

module.exports.validations = (req) => {
  const { orgName } = req.body;

  return [
    [
      new ValidationRule(validator.notEmpty, 'orgName', orgName, 'Enter the name of the organisation'),
      new ValidationRule(
        validator.isValidOrganisationNameLength,
        'orgName',
        orgName,
        `Organisation name must be ${MAX_ORGANISATION_NAME_LENGTH} characters or less`
      ),
      new ValidationRule(
        validator.isValidOrganisationName,
        'orgName',
        orgName,
        `Organisation name must not contain special characters`
      ),
    ],
  ];
};

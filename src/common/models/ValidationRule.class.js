/**
 @class ValidationRule
 * @property {string}
 */
class ValidationRule {
  constructor(validator, identifier, value, message) {
    this.validator = validator;
    this.identifier = identifier;
    this.value = value;
    this.message = message;
  }
}

module.exports = ValidationRule;

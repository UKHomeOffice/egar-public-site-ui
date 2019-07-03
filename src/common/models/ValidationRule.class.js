/**
 * Representation of a validation rule used through sGAR.
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

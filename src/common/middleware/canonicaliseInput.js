/**
 * 1. .normalize('NFC') converts visually identical Unicode text into a consistent representation.
 * For example, é can be encoded as one character or as e plus a combining accent; NFC standardizes both to the same form.
 */

function canonicalise(value) {
  if (typeof value === 'string') {
    const canonicalisedValue = value.normalize('NFC').trim();
    return canonicalisedValue;
  }

  if (Array.isArray(value)) {
    return value.map(canonicalise);
  }

  if (value && typeof value === 'object') {
    for (const key of Object.keys(value)) {
      value[key] = canonicalise(value[key]);
    }
  }

  return value;
}

module.exports = function canonicaliseInput(req, _res, next) {
  req.body = canonicalise(req.body);
  next();
};

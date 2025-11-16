const uncamelCase = (value) => {
  if (typeof value !== 'string') return '';

  let uncamelStr = value.replace(/([A-Z])/g, ' $1');
  uncamelStr = uncamelStr[1].toUpperCase() + uncamelStr.slice(2).toLowerCase();

  return uncamelStr;
};
/*
 * Check if there is an error in 'errors' whose identifier matches 'value'.
 * If not, return false, if so return message in a format govuk macros recognise.
 * */
const containsError = (array, value) => {
  if (array === undefined || value === undefined) return false;

  const result = array.filter((element) => element.identifier === value);
  return result.length > 0 && { text: result[0].message };
};

exports.uncamelCase = uncamelCase;
exports.containsError = containsError;

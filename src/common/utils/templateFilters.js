const uncamelCase = (value) => {
  if (typeof value !== 'string') return '';

  let uncamelStr = value.replace(/([A-Z])/g, ' $1');
  uncamelStr = uncamelStr[1].toUpperCase() + uncamelStr.slice(2).toLowerCase();

  return uncamelStr;
};

const containsError = (array, value) => {
  if (array === undefined || value === undefined) return false;

  const result = array.filter((element) => element.identifier === value);
  return result.length > 0;
};

const expiryDate = () => {
  checkDate = new Date();
  checkDateExpiry = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  return checkDateExpiry;
};

exports.uncamelCase = uncamelCase;
exports.containsError = containsError;
exports.expiryDate = expiryDate;

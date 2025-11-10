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

const filterArray = (arr, propertyName, propertyValue) => {
  return (arr || []).filter((e) => e[propertyName] === propertyValue);
};
const transform = (o, mapping) => {
  const returnValue = {};
  if (!o) {
    return false;
  }
  for (const key in mapping) {
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      returnValue[mapping[key]] = o[key];
    }
  }
  return returnValue;
};

exports.uncamelCase = uncamelCase;
exports.containsError = containsError;
exports.expiryDate = expiryDate;
exports.filterArray = filterArray;
exports.transform = transform;

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

const expiryDate = () => {
  const today = new Date();
  return today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
};

const formatGdsDate = (dateValue, formatType) => {
  if (!dateValue) {
    return dateValue;
  }

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  const day = date.getUTCDate();
  const month = date.toLocaleString('en-GB', { month: formatType, timeZone: 'UTC' });
  const year = date.getUTCFullYear();

  return `${day} ${month} ${year}`;
};

exports.uncamelCase = uncamelCase;
exports.containsError = containsError;
exports.expiryDate = expiryDate;
exports.formatGdsDate = formatGdsDate;

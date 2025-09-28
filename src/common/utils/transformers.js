function transformPerson(personObj) {
  const copyPersonObj = personObj;
  if (Object.prototype.hasOwnProperty.call(personObj, 'peopleType')) {
    copyPersonObj.peopleType = personObj.peopleType.name;
  }
  return copyPersonObj;
}

/**
 * Convert a string to Title Case
 * @param {String} str input string
 * @returns {String} Undefined if undefined input else the string title case'd
 */
function titleCase(str) {
  if (typeof str !== "string") {
    return str;
  }
  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
    .join(' ');
}

function upperCamelCase(str) {
  if (typeof str !== "string") {
    return str;
  }

  return str.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase())
    .join('');
}

function numToString(num) {
  if (num === undefined) return num;
  return num.toString();
}

/**
 * Convert a string filesize to integer representing byte size
 * @param {String} strSize String filesize ending in one of: [B, KB, MB, GB]
 * @returns {Int} Size in bytes
 */
function strToBytes(strSize) {
  let numBytes = 0;
  if (strSize.match(/\dGB$/)) {
    numBytes = (1024 ** 3) * parseFloat(strSize);
  }
  if (strSize.match(/\dMB$/)) {
    numBytes = (1024 ** 2) * parseFloat(strSize);
  }
  if (strSize.match(/\dKB$/)) {
    numBytes = 1024 * parseFloat(strSize);
  }
  if (strSize.match(/\dB$/)) {
    numBytes = parseFloat(strSize);
  }
  return numBytes;
}

/**
 * GAR excel sheet instructs users to use 'Unknown' as a gender type
 * external systems expect 'Unspecified' to be used.
 * Convert Unknown to Unspecified
 * @param {String} aGender a given gender
 * @returns {String}
 */
function unknownToUnspecified(aGender) {
  return aGender === 'Unknown' ? 'Unspecified' : aGender;
}

function toUpper(aStr) {
  return typeof aStr !== "string" ? aStr : aStr.toUpperCase();
}

function trimWhitespace(aStr) {
  return typeof aStr !== "string" ? aStr : aStr.trim();
}

export default {
  transformPerson,
  titleCase,
  upperCamelCase,
  numToString,
  strToBytes,
  unknownToUnspecified,
  toUpper,
  trimWhitespace
};

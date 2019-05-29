const uncamelCase = value => {
  if (typeof value !== 'string') return ''
  let uncamelStr = value.replace(/([A-Z])/g, " $1");
  uncamelStr = uncamelStr[1].toUpperCase() + uncamelStr.slice(2).toLowerCase();
  return uncamelStr;
}

exports.uncamelCase = uncamelCase

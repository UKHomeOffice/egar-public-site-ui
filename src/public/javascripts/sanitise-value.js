function sanitiseValue(input, type) {
  const regex = (type === 'year') ? '[0-9]{1,4}' : '[0-9]{1,2}';

  return ((input.match(regex) === null) ? '' : input.match(regex)[0]);
}

module.exports = sanitiseValue;

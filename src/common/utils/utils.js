function trimToDecimalPlaces(input, places) {

    input ||= '';
    input = input.trim();

    const parts = input.split('.');
    if (parts.length == 2) {
        parts[1] = parts[1].slice(0, places);
    }

    return parts.join('.')
}


module.exports = {
    trimToDecimalPlaces
}
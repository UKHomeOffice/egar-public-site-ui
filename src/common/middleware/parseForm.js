const bodyParser = require ('body-parser');
module.exports = (req, res, next) => {
let parseForm = bodyParser.urlencoded({ extended: false })
next();
}
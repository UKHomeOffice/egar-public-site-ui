import bodyParser from 'body-parser';

export default (req, res, next) => {
  bodyParser.urlencoded({ extended: false });
  next();
};

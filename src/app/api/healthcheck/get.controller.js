module.exports = (req, res) => {
  const data = {
    ping: {
      healthy: true,
    },
  };

  if (req.session) {
    data.cookie = req.session;
  }

  res.setHeader('Content-Type', 'application/json');
  res.json(data);
};

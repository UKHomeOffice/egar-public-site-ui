function getApiErrorBody(error) {
  if (error?.type !== 'http_error' || typeof error.body?.message !== 'string') {
    return undefined;
  }

  return error.body;
}

module.exports = { getApiErrorBody };

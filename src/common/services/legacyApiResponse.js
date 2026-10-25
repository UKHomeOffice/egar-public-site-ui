function unwrapResponse(response) {
  if (response && typeof response === 'object' && !Array.isArray(response) && 'ok' in response) {
    const body = { ...response };
    delete body.ok;
    return body;
  }
  return response;
}

function parseJsonResponse(response) {
  const body = unwrapResponse(response);
  return typeof body === 'string' ? JSON.parse(body) : body;
}

function serializeResponse(response) {
  if (typeof response === 'string') {
    return response;
  }

  if (response === null || response === undefined) {
    return '';
  }

  if (response && typeof response === 'object' && !Array.isArray(response) && 'ok' in response) {
    const body = { ...response };
    delete body.ok;
    return JSON.stringify(body);
  }

  return JSON.stringify(response);
}

async function callConfiguredApi(api, method, args, logger, errorMessage) {
  try {
    return serializeResponse(await api[method](...args));
  } catch (error) {
    if (error?.type === 'http_error') {
      return serializeResponse(error.body);
    }

    logger.error(errorMessage, {
      operation: method,
      errorMessage: error?.message,
      status: error?.status,
    });
    throw error;
  }
}

function apiPath(endpoint) {
  const url = new URL(endpoint);
  return url.href;
}

module.exports = { apiPath, callConfiguredApi, parseJsonResponse, serializeResponse, unwrapResponse };

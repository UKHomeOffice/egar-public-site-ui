function createClientError(name, type, message, metadata = {}, cause) {
  const error = new Error(message, cause ? { cause } : undefined);
  error.name = name;
  error.type = type;
  Object.assign(error, metadata);
  return error;
}

function getHeaderName(headers, name) {
  return Object.keys(headers).find((header) => header.toLowerCase() === name.toLowerCase());
}

function setHeader(headers, name, value) {
  const existingName = getHeaderName(headers, name);
  headers[existingName || name] = value;
}

function mergeHeaders(...headerSets) {
  const merged = {};
  headerSets.forEach((headers) => {
    if (Array.isArray(headers)) {
      headers.forEach(([name, value]) => setHeader(merged, name, value));
    } else if (headers && typeof headers.forEach === 'function') {
      headers.forEach((value, name) => setHeader(merged, name, value));
    } else {
      Object.entries(headers || {}).forEach(([name, value]) => setHeader(merged, name, value));
    }
  });
  return merged;
}

function deleteHeader(headers, name) {
  const existingName = getHeaderName(headers, name);
  if (existingName) {
    delete headers[existingName];
  }
}

function isFormData(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

function isUrlSearchParams(body) {
  return body instanceof URLSearchParams;
}

function isNativeBody(body) {
  return (
    typeof body === 'string' ||
    isFormData(body) ||
    isUrlSearchParams(body) ||
    (typeof Blob !== 'undefined' && body instanceof Blob) ||
    body instanceof ArrayBuffer ||
    ArrayBuffer.isView(body)
  );
}

function decodeResponseBody(response) {
  if (response.status === 204 || response.status === 205) {
    return null;
  }

  return response.text().then((text) => {
    if (text === '') {
      return null;
    }

    const contentType = response.headers?.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
    if (contentType === 'application/json' || contentType?.endsWith('+json')) {
      try {
        return JSON.parse(text);
      } catch {
        return text;
      }
    }

    return text;
  });
}

class HttpClient {
  constructor({ baseUrl, defaultHeaders = {}, timeout } = {}) {
    let parsedBaseUrl;
    try {
      parsedBaseUrl = new URL(baseUrl);
    } catch (cause) {
      throw new TypeError(`HttpClient requires an absolute HTTP(S) baseUrl: ${cause.message}`, { cause });
    }

    if (!['http:', 'https:'].includes(parsedBaseUrl.protocol)) {
      throw new TypeError('HttpClient baseUrl must use HTTP or HTTPS');
    }

    this.baseUrl = parsedBaseUrl.href.replace(/\/+$/, '');
    this.origin = parsedBaseUrl.origin;
    this.defaultHeaders = mergeHeaders(
      {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      defaultHeaders
    );
    this.timeout = timeout;
    this.#validateTimeout(timeout);
  }

  #validateTimeout(timeout) {
    if (timeout !== undefined && timeout !== null && (!Number.isFinite(timeout) || timeout < 0)) {
      throw new TypeError('timeout must be a non-negative finite number or null');
    }
  }

  #buildUrl(path, query) {
    if (typeof path !== 'string' || path.length === 0) {
      throw new TypeError('Request path must be a non-empty string');
    }

    let url;
    if (/^[a-z][a-z\d+.-]*:/i.test(path)) {
      url = new URL(path);
    } else {
      if (!path.startsWith('/') || path.startsWith('//')) {
        throw new TypeError('Request path must start with "/" or be an absolute URL');
      }
      url = new URL(`${this.baseUrl}${path}`);
    }

    if (!['http:', 'https:'].includes(url.protocol)) {
      throw new TypeError('Request URL must use HTTP or HTTPS');
    }

    if (url.origin !== this.origin) {
      throw new TypeError(`Request URL origin ${url.origin} does not match configured origin ${this.origin}`);
    }

    if (query instanceof URLSearchParams) {
      query.forEach((value, key) => url.searchParams.append(key, value));
    } else if (query && typeof query === 'object') {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    return url;
  }

  async #request(path, { method = 'GET', headers = {}, body, query, timeout, signal } = {}) {
    const url = this.#buildUrl(path, query);
    const timeoutMs = timeout === undefined ? this.timeout : timeout;
    this.#validateTimeout(timeoutMs);

    const requestHeaders = mergeHeaders(this.defaultHeaders, headers);

    if (body !== undefined) {
      if (isFormData(body)) {
        deleteHeader(requestHeaders, 'Content-Type');
      } else if (isUrlSearchParams(body)) {
        setHeader(requestHeaders, 'Content-Type', 'application/x-www-form-urlencoded;charset=UTF-8');
      }
    }

    const { getCorrelationId } = require('../utils/correlationContext');
    const correlationId = getCorrelationId();
    if (correlationId) {
      setHeader(requestHeaders, 'X-Correlation-ID', correlationId);
    }

    const requestOptions = {
      method,
      headers: requestHeaders,
    };

    if (body !== undefined) {
      requestOptions.body = isUrlSearchParams(body)
        ? body.toString()
        : isNativeBody(body)
          ? body
          : JSON.stringify(body);
    }

    const controller = timeoutMs === undefined || timeoutMs === null ? null : new AbortController();
    let timedOut = false;
    let timeoutId;
    let abortFromCaller;

    if (controller) {
      requestOptions.signal = controller.signal;
      if (signal) {
        abortFromCaller = () => controller.abort(signal.reason);
        if (signal.aborted) {
          abortFromCaller();
        } else {
          signal.addEventListener('abort', abortFromCaller, { once: true });
        }
      }
      timeoutId = setTimeout(() => {
        timedOut = true;
        controller.abort();
      }, timeoutMs);
    } else if (signal) {
      requestOptions.signal = signal;
    }

    try {
      let response;
      try {
        response = await fetch(url, requestOptions);
      } catch (cause) {
        const metadata = { url: url.toString(), method };
        if (timedOut) {
          throw createClientError(
            'TimeoutError',
            'timeout_error',
            `Request timed out after ${timeoutMs}ms`,
            metadata,
            cause
          );
        }
        if (signal?.aborted) {
          throw createClientError('AbortError', 'abort_error', 'Request was aborted', metadata, cause);
        }
        throw createClientError('NetworkError', 'network_error', cause?.message || String(cause), metadata, cause);
      }

      let data;
      try {
        data = await decodeResponseBody(response);
      } catch (cause) {
        const metadata = { url: url.toString(), method };
        if (timedOut) {
          throw createClientError(
            'TimeoutError',
            'timeout_error',
            `Request timed out after ${timeoutMs}ms`,
            metadata,
            cause
          );
        }
        throw createClientError('NetworkError', 'network_error', cause?.message || String(cause), metadata, cause);
      }

      if (!response.ok) {
        const message = data && typeof data === 'object' && data.message ? data.message : response.statusText;
        throw createClientError('HttpError', 'http_error', message || `HTTP ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          url: url.toString(),
          method,
          body: data,
        });
      }

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        return { ok: response.ok, ...data };
      }
      return data;
    } finally {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      if (signal && abortFromCaller) {
        signal.removeEventListener('abort', abortFromCaller);
      }
    }
  }

  get(path, options = {}) {
    return this.#request(path, { ...options, method: 'GET' });
  }

  post(path, body, options = {}) {
    return this.#request(path, { ...options, method: 'POST', body });
  }

  put(path, body, options = {}) {
    return this.#request(path, { ...options, method: 'PUT', body });
  }

  patch(path, body, options = {}) {
    return this.#request(path, { ...options, method: 'PATCH', body });
  }

  delete(path, options = {}) {
    return this.#request(path, { ...options, method: 'DELETE' });
  }
}

module.exports = {
  HttpClient,
};

class ApiClient {
  constructor({ baseUrl, defaultHeaders = {}, timeout = 10000 }) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };

    this.timeout = timeout;
  }

  async request(path, { method = 'GET', headers = {}, body, query } = {}) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), this.timeout);

    const url = new URL(`${this.baseUrl}${path}`);

    if (query && typeof query === 'object') {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const options = {
      method,
      headers: { ...this.defaultHeaders, ...headers },
      signal: controller.signal,
    };

    if (body !== undefined) {
      options.body = JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(url, options);
    } catch (err) {
      clearTimeout(id);
      throw {
        type: 'network_error',
        message: err.message,
        url: url.toString(),
        method,
      };
    }

    clearTimeout(id);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw {
        ok: response.ok,
        type: 'http_error',
        status: response.status,
        statusMessage: response.statusText,
        message: data?.message || response.statusText,
        url: url.toString(),
        method,
        body: data,
      };
    }

    return { ok: response.ok, ...data };
  }

  get(path, options = {}) {
    return this.request(path, { ...options, method: 'GET' });
  }

  post(path, body, options = {}) {
    return this.request(path, { ...options, method: 'POST', body });
  }

  put(path, body, options = {}) {
    return this.request(path, { ...options, method: 'PUT', body });
  }
  patch(path, body, options = {}) {
    return this.request(path, { ...options, method: 'PATCH', body });
  }

  delete(path, options = {}) {
    return this.request(path, { ...options, method: 'DELETE' });
  }
}

module.exports = ApiClient;

class HttpClient {
  baseUrl?: string;
  defaultOpts: RequestInit;

  constructor(opts: { baseUrl?: string; defaultOpts?: RequestInit }) {
    let optsBaseUrl = opts.baseUrl ?? process.env.NEXT_PUBLIC_API_BASE_URL;
    if (optsBaseUrl) {
      // Strip trailing '/' from base URL
      this.baseUrl =
        opts.baseUrl.slice(-1) === "/"
          ? opts.baseUrl.slice(0, -1)
          : opts.baseUrl;
    }
    this.defaultOpts = opts.defaultOpts ?? {};
  }

  fetch(resource: string, opts?: RequestInit) {
    const path = resource.startsWith("/") ? resource : `/${resource}`;
    const url = this.baseUrl ? `${this.baseUrl}${path}` : path;
    return fetch(url, { ...this.defaultOpts, ...opts });
  }

  get(resource: string, opts?: RequestInit) {
    return this.fetch(resource, { method: "GET", ...opts });
  }

  post(resource: string, opts?: RequestInit) {
    return this.fetch(resource, { method: "POST", ...opts });
  }
}

export default HttpClient;

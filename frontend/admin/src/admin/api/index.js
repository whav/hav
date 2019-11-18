const replace_slashes_regexp = /\/+/g;

class API {
  constructor(base_url = `/api/v1/`) {
    this.base_url = base_url;
  }

  build_url = path => {
    const url = `${this.base_url}/${path}`;
    return url.replace(replace_slashes_regexp, "/");
  };
}

export default API;

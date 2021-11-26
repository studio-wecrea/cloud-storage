import fetch from "node-fetch";
import HttpResponseError from "../exceptions/HttpResponseError.js";
import Tools from "./Tools.js";

export default class HttpRequest {
  constructor(context) {
    this.context = context;
    this.headers = {
      "X-Auth-Token": this.context.token ?? "",
    };
    this.checkResponseStatus = true;
  }

  addHeaders(headers) {
    this.headers = Object.assign(headers, this.headers);
  }

  checkResponse(response) {
    if (this.checkResponseStatus === false) {
      return response;
    }

    if (response.ok) {
      return response;
    }

    throw new HttpResponseError(response);
  }

  disabledCheckResponseStatus() {
    this.checkResponseStatus = false;
  }

  enabledCheckResponseStatus() {
    this.checkResponseStatus = true;
  }

  head(path) {
    return this.call("HEAD", path);
  }

  get(path) {
    return this.call("GET", path);
  }

  post(path, data = {}) {
    return this.call("POST", path, data);
  }

  put(path, data = {}) {
    return this.call("PUT", path, data);
  }

  delete(path) {
    return this.call("DELETE", path);
  }

  async uploadStream(path, data) {
    let params = {
      method: "PUT",
      headers: this.headers,
      body: data,
    };

    const baseUrl = this.context.endpoint?.url ?? this.context.host;
    const result = await fetch(encodeURI(baseUrl + path), params);
    return this.checkResponse(result);
  }

  async download(path) {
    let params = {
      method: "GET",
      headers: this.headers,
    };

    const baseUrl = this.context.endpoint?.url ?? this.context.host;
    return await fetch(encodeURI(baseUrl + path), params);
  }

  async call(method, path, data) {
    this.addHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    let params = {
      method: method.toUpperCase(),
      headers: this.headers,
    };

    if (!Tools.isEmpty(data)) {
      params.body = JSON.stringify(data);
    }

    const baseUrl = this.context.endpoint?.url ?? this.context.host;

    const response = await fetch(encodeURI(baseUrl + path), params);

    return this.checkResponse(response);
  }
}

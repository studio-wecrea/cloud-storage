import HttpRequest from "../libs/HttpRequest.js";
import OvhError from "../exceptions/OvhError.js";
import Tools from "../libs/Tools.js";

export default class AccountMeta {
  constructor(context) {
    this.context = context;
  }

  verifyKey(key) {
    if (Tools.isUndefined(key)) {
      throw new OvhError("Key parameter is expected.");
    }

    if (!Tools.isString(key)) {
      throw new OvhError("Key parameter is not a string.");
    }

    if (Tools.contains(key, "/") || Tools.contains(key, " ")) {
      throw new OvhError("Key parameter contains special chars.");
    }
  }

  verifyValue(value) {
    if (Tools.isUndefined(value)) {
      throw new OvhError("Value parameter is expected.");
    }

    if (!Tools.isString(value)) {
      throw new OvhError("Value parameter is not a string.");
    }
  }

  async create(key, value) {
    this.verifyKey(key);
    this.verifyValue(value);

    let header = {};
    let headerName = Tools.toSlug(key.toLowerCase());
    header["x-account-meta-" + headerName] = value;

    let req = new HttpRequest(this.context);
    req.addHeaders(header);

    let response = await req.post("/");

    return response.headers.raw();
  }

  async update(key, value) {
    return await this.create(key, value);
  }

  async delete(key) {
    this.verifyKey(key);

    let header = {};
    let headerName = Tools.toSlug(key.toLowerCase());
    header["x-remove-account-meta-" + headerName] = "x";

    let req = new HttpRequest(this.context);
    req.addHeaders(header);

    let response = await req.post("/");

    return response.headers.raw();
  }

  async get(key) {
    this.verifyKey(key);

    const headerName = "x-account-meta-" + Tools.toSlug(key.toLowerCase());

    let req = new HttpRequest(this.context);
    let response = await req.head("/");

    return response.headers.get(headerName);
  }

  async has(key) {
    let result = await this.get(key);
    return !Tools.isEmpty(result);
  }

  async all(complete = false) {
    let req = new HttpRequest(this.context);
    let response = await req.head("/");

    let headers = response.headers.raw();
    if (complete === true) {
      return headers;
    }

    let result = Object.entries(headers).filter(([key, value]) => {
      return key.indexOf("x-account-meta") === 0;
    });

    return Object.fromEntries(result);
  }
}

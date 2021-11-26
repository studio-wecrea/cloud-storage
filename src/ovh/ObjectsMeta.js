import Tools from "../libs/Tools.js";
import HttpRequest from "../libs/HttpRequest.js";
import OvhError from "../exceptions/OvhError.js";
import moment from "moment";

export default class ObjectsMeta {
  constructor(context, path, headers) {
    this.context = context;
    this.path = path;
    this.headers = headers;
  }

  verifyKey(key) {
    if (Tools.isUndefined(key)) {
      throw new OvhError("Key parameter is expected.");
    }
    if (!Tools.isString(key)) {
      throw new OvhError("Key parameter must be a string.");
    }
    if (Tools.contains(key, "/") || Tools.contains(key, " ")) {
      throw new OvhError("Key parameter contains slash or space.");
    }
  }

  verifyValue(value) {
    if (Tools.isUndefined(value)) {
      throw new OvhError("Value parameter is expected.");
    }
    if (!Tools.isString(value)) {
      throw new OvhError("Value parameter must be a string.");
    }
  }

  saveCurrentHeaders() {
    let headersToSave = {};
    if (this.headers) {
      Object.entries(this.headers).forEach((header) => {
        if (
          Tools.contains(header[0], "x-object-meta-") ||
          Tools.contains(header[0], "x-delete-")
        ) {
          headersToSave[header[0]] = header[1];
        }
      });
    }
    return headersToSave;
  }

  makeHeaderMetaName(str, remove = false) {
    const final = Tools.toSlug(str.toLowerCase());
    return (
      (remove === true ? "x-remove-object-meta-" : "x-object-meta-") + final
    );
  }

  makeHeaderDeleteName(type = "at") {
    if (type !== "at" && type !== "after") {
      throw new OvhError(
        "Object Meta Delete : type must be in list (at, after)"
      );
    }

    return "x-delete-" + type;
  }

  async create(key, value) {
    this.verifyKey(key);
    this.verifyValue(value);

    let headersToSend = this.saveCurrentHeaders();

    const headerName = this.makeHeaderMetaName(key);
    headersToSend[headerName] = value;

    let req = new HttpRequest(this.context);
    req.addHeaders(headersToSend);

    let response = await req.post("/" + this.path);
    return response.headers.raw();
  }

  async createMany(metas) {
    if (Tools.isUndefined(metas)) {
      throw new OvhError("Metas parameter is expected.");
    }
    if (Tools.isObject(metas)) {
      throw new OvhError("Metas parameter must be an object.");
    }

    let headersToSend = this.saveCurrentHeaders();

    Object.entries(metas).forEach(([key, value]) => {
      this.verifyKey(key);
      this.verifyValue(value);
      const headerName = this.makeHeaderMetaName(key);
      headersToSend[headerName] = value;
    });

    let req = new HttpRequest(this.context);
    req.addHeaders(headersToSend);

    let response = await req.post("/" + this.path);
    return response.headers.raw();
  }

  async update(key, value) {
    return await this.create(key, value);
  }

  async delete(key) {
    this.verifyKey(key);

    let header = {};
    const headerName = this.makeHeaderMetaName(key, true);
    header[headerName] = "x";

    let req = new HttpRequest(this.context);
    req.addHeaders(header);

    let response = await req.post("/" + this.path);
    return response.headers.raw();
  }

  async deleteAt(date) {
    let headersToSend = this.saveCurrentHeaders();

    date = !moment.isMoment(date) ? moment(date) : date;

    const headerName = this.makeHeaderDeleteName("at");
    headersToSend[headerName] = Math.round(date.toDate().getTime() / 1000);

    let req = new HttpRequest(this.context);
    req.addHeaders(headersToSend);

    let response = await req.post("/" + this.path);
    return response.headers.raw();
  }

  async deleteAfter(seconds) {
    let headersToSend = this.saveCurrentHeaders();

    const headerName = this.makeHeaderDeleteName("after");
    headersToSend[headerName] = parseInt(seconds);

    let req = new HttpRequest(this.context);
    req.addHeaders(headersToSend);

    let response = await req.post("/" + this.path);
    return response.headers.raw();
  }

  async getExpiration() {
    const headersFound = Object.entries(this.headers).filter((header) => {
      return Tools.contains(header[0], "x-delete-");
    });
    if (headersFound.length > 0) {
      return headersFound[0];
    }
    return null;
  }

  get(key, defaultValue = null) {
    if (this.has(key) === false) {
      return defaultValue;
    }

    const headersFound = Object.entries(this.headers).filter((header) => {
      return header[0] === headerName;
    });

    return headersFound[0][1];
  }

  has(key) {
    this.verifyKey(key);
    const headerName = makeHeaderMetaName(key);
    const headersFound = Object.entries(this.headers).filter((header) => {
      return header[0] === headerName;
    });
    return headersFound.length > 0;
  }

  all(complete = false) {
    if (complete === true) {
      return this.headers;
    }

    let result = Object.entries(this.headers).filter(([key, value]) => {
      return key.indexOf("x-object-meta") === 0;
    });

    return Object.fromEntries(result);
  }
}

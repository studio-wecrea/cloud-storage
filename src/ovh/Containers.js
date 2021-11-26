import Tools from "../libs/Tools.js";
import HttpRequest from "../libs/HttpRequest.js";
import OvhError from "../exceptions/OvhError.js";
import ContainersMeta from "./ContainersMeta.js";
import Objects from "./Objects.js";

export default class Containers {
  constructor(context) {
    this.context = context;
    this.container = null;
  }

  verifyContainerName(container) {
    if (Tools.isUndefined(container)) {
      throw new OvhError("Container name is expected.");
    }

    if (Tools.isEmpty(container)) {
      throw new OvhError("Container name is expected.");
    }

    if (!Tools.isString(container)) {
      throw new OvhError("Container name must be a string.");
    }

    if (Tools.contains(container, "/") || Tools.contains(container, " ")) {
      throw new OvhError("Container name contains slash or space.");
    }

    return Tools.toSlug(container);
  }

  use(container) {
    this.container = this.verifyContainerName(container);
    return this;
  }

  createHeaders(type, web_content_pages = {}) {
    let headers = {};
    switch (type) {
      case "public":
      default:
        headers["x-container-read"] = ".r:*,.rlistings";
        break;
      case "private":
        break;
      case "static":
        headers["x-container-meta-web-listings"] = "true";
        headers["x-container-read"] = ",.r:*,.rlistings";
        headers["x-container-meta-web-error"] = "error.html";
        headers["x-container-meta-web-listings-css"] = "listing.css";
        headers["x-container-meta-web-index"] = "index.html";

        if (Tools.isObject(web_content_pages)) {
          if (!Tools.isUndefined(web_content_pages.error)) {
            headers["x-container-meta-web-error"] = web_content_pages.error;
          }
          if (!Tools.isUndefined(web_content_pages.css)) {
            headers["x-container-meta-web-listings-css"] =
              web_content_pages.css;
          }
          if (!Tools.isUndefined(web_content_pages.index)) {
            headers["x-container-meta-web-index"] = web_content_pages.index;
          }
        }
        break;
    }

    return headers;
  }

  verifyContainerExists() {
    if (
      Tools.isUndefined(this.container) ||
      Tools.isEmpty(this.container) ||
      this.container === null
    ) {
      throw new OvhError("You must add container name with use() method.");
    }
  }

  async create(type = "public", web_content_pages = {}) {
    this.verifyContainerExists();

    const req = new HttpRequest(this.context);
    const headers = this.createHeaders(type, web_content_pages);
    req.addHeaders(headers);

    const response = await req.put("/" + this.container);

    return response.headers.raw();
  }

  async exist() {
    this.verifyContainerExists();

    const req = new HttpRequest(this.context);
    req.disabledCheckResponseStatus();

    const response = await req.get("/" + this.container);

    if (response.status === 404) {
      return false;
    }

    return true;
  }

  async info() {
    this.verifyContainerExists();

    const containerExists = await this.exist();
    if (containerExists === false) {
      throw new OvhError("Container does not exist");
    }

    const req = new HttpRequest(this.context);
    const response = await req.head("/" + this.container);

    return response.headers.raw();
  }

  async list() {
    this.verifyContainerExists();

    const containerExists = await this.exist();
    if (containerExists === false) {
      throw new OvhError("Container does not exist.");
    }

    const req = new HttpRequest(this.context);
    const response = await req.get("/" + this.container);
    const body = await response.json();

    return body;
  }

  async delete(force = false) {
    this.verifyContainerExists();

    let deleteResult = {
      files: [],
      container: null,
    };
    const files = await this.list();

    if (files.length > 0) {
      if (force === false) {
        throw new OvhError(
          "Container has files, use force to delete container with files or delete files before."
        );
      }

      deleteResult.files = await this.deleteObjects(files);
    }

    const req = new HttpRequest(this.context);
    const response = await req.delete("/" + this.container);

    deleteResult.container = response.headers.raw();

    return deleteResult;
  }

  async deleteObjects(files = null) {
    this.verifyContainerExists();
    let deleteResult = [];

    if (files === null) {
      const files = await this.list();
    }

    if (!Array.isArray(files)) {
      throw new OvhError(
        "Container.deleteObjects() : Files must be an Array, " +
          typeof files +
          " given"
      );
    }

    if (files.length > 0) {
      files.forEach(async (file) => {
        let deleteFileResult = await this.context
          .objects()
          .delete(this.container + "/" + file);
        deleteResult.push(deleteFileResult);
      });
    }

    return deleteResult;
  }

  async metas() {
    this.verifyContainerExists();
    const headers = await this.info();
    return new ContainersMeta(this.context, this.container, headers);
  }

  objects() {
    this.verifyContainerExists();
    return new Objects(this.context, this.container);
  }
}

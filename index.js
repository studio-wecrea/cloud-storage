"use strict";

import Tools from "./src/libs/Tools.js";
import LibError from "./src/exceptions/LibError.js";
import OvhStorage from "./src/ovh/OvhStorage.js";
import S3Storage from "./src/s3/S3Storage.js";

export class CloudStorage {
  constructor(config) {
    if (Tools.isUndefined(config.type) || Tools.isEmpty(config.type)) {
      throw new LibError(`You must provide a "type" entry in your config`);
    }
    if (Tools.isUndefined(config.host) || Tools.isEmpty(config.host)) {
      throw new LibError(`You must provide a "host" entry in your config`);
    }
    if (Tools.isUndefined(config.access) || Tools.isEmpty(config.access)) {
      throw new LibError(`You must provide a "access" entry in your config`);
    }
    if (Tools.isUndefined(config.secret) || Tools.isEmpty(config.secret)) {
      throw new LibError(`You must provide a "access" entry in your config`);
    }
    if (Tools.isUndefined(config.region) || Tools.isEmpty(config.region)) {
      throw new LibError(`You must provide a "access" entry in your config`);
    }
    this.config = config;

    if (Tools.isUndefined(this.config.debug)) {
      this.config.debug = false;
    }
  }
  async connect() {
    try {
      let Proxy =
        this.config.type.toLowerCase() === "ovh"
          ? new OvhStorage(this.config)
          : new S3Storage(this.config);

      this.proxy = await Proxy.connect();
      return this.proxy;
    } catch (e) {
      throw new Error(e);
    }
  }

  getDetails() {
    return this.proxy.getDetails();
  }

  transferTo(proxyTo) {
    return true;
  }
}

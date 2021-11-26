import OvhError from "../exceptions/OvhError.js";
import Tools from "../libs/Tools.js";
import HttpRequest from "../libs/HttpRequest.js";
import moment from "moment";

import Account from "./Account.js";
import Containers from "./Containers.js";
// import Objects from "./Objects.js";

export default class OvhStorage {
  constructor(config) {
    if (Tools.isUndefined(config.project) || Tools.isEmpty(config.project)) {
      throw new OvhError(
        `You must provide a "project" entry in your config to call OVH API`
      );
    }
    this.config = config;
  }

  async connect() {
    const req = new HttpRequest(this.config);
    const authData = {
      auth: {
        identity: {
          methods: ["password"],
          password: {
            user: {
              name: this.config.access,
              domain: {
                name: "Default",
              },
              password: this.config.secret,
            },
          },
        },
      },
    };
    let response = await req.post("/tokens", authData);
    const body = await response.json();

    this.token = response.headers.get("x-subject-token");

    const serviceCatalog = Tools.findInObject(
      body.token.catalog,
      {
        index: "type",
        value: "object-store",
      },
      true
    );
    const endpoint = Tools.findInObject(
      serviceCatalog.endpoints,
      {
        index: "region_id",
        value: this.config.region,
      },
      true
    );

    this.endpoint = endpoint;
    this.connected_at = new moment();

    return this;
  }

  getDetails() {
    return {
      type: "ovh",
      token: this.token,
      endpoint: this.endpoint,
      connected_at: this.connected_at.format("YYYY-MM-DD HH:mm:ss"),
    };
  }

  account() {
    return new Account(this);
  }

  containers() {
    return new Containers(this);
  }
}

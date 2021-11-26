import HttpRequest from "../libs/HttpRequest.js";
import OvhError from "../exceptions/OvhError.js";
import AccountMeta from "./AccountMeta.js";

export default class Account {
  constructor(context) {
    this.context = context;
  }

  async all() {
    try {
      let request = new HttpRequest(this.context);
      let response = await request.get("/");
      const containers = await response.json();

      return {
        account: response.headers.raw(),
        containers: containers,
      };
    } catch (e) {
      throw new OvhError(e);
    }
  }

  async details() {
    try {
      let a = await this.context.account().all();
      return a["account"];
    } catch (e) {
      throw new OvhError(e);
    }
  }

  async containers() {
    try {
      let a = await this.context.account().all();
      return a["containers"];
    } catch (e) {
      throw new OvhError(e);
    }
  }

  metas() {
    return new AccountMeta(this.context);
  }
}

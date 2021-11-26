import moment from "moment";

export default class S3Storage {
  constructor(config) {
    this.config = config;
  }

  connect() {
    this.token = null;
    this.endpoint = null;
    this.connected_at = new moment();
    return this;
  }

  getDetails() {
    return {
      type: "s3",
      token: this.token,
      endpoint: this.endpoint,
      connected_at: this.connected_at.format("YYYY-MM-DD HH:mm:ss"),
    };
  }
}

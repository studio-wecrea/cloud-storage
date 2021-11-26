export default class S3Error extends Error {
  constructor(message, ...args) {
    super(`S3 Error: ${message}`, ...args);
  }
}

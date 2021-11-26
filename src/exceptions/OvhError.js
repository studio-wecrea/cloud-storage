export default class OvhError extends Error {
  constructor(message, ...args) {
    super(`OVH Error: ${message}`, ...args);
  }
}

export default class LibError extends Error {
  constructor(message, ...args) {
    super(`CloudStorage Global Error: ${message}`, ...args);
  }
}

export default class VinError extends Error {
  constructor() {
    super();
    this.message = 'VIN not supplied';
  }
}

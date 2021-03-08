export default class VinError extends Error {
  constructor() {
    super();
    this.message = 'VIN is in incorrect format';
  }
}

export default class PlateSerialNumberError extends Error {
  constructor() {
    super();
    this.message = 'Plate serial number is in incorrect format';
  }
}

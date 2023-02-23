export default class SystemNumberError extends Error {
  constructor() {
    super();
    this.message = 'System number is in incorrect format';
  }
}

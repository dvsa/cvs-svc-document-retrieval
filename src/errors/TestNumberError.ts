export default class TestNumberError extends Error {
  constructor() {
    super();
    this.message = 'Test number is in incorrect format';
  }
}

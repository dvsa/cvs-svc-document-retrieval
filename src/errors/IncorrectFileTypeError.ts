export default class IncorrectFileTypeError extends Error {
  constructor() {
    super();
    this.message = 'File stored is not a PDF';
  }
}

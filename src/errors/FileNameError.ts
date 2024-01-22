export default class FileNameError extends Error {
    constructor() {
      super();
      this.message = 'File name is missing or incorrect';
    }
  }
  
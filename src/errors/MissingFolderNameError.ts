export default class MissingFolderNameError extends Error {
  constructor() {
    super();
    this.message = 'The folder name is not in an environment variable';
  }
}

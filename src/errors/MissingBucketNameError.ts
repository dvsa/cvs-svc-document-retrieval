export default class MissingBucketNameError extends Error {
  constructor() {
    super();
    this.message = 'The bucket name is not in an environment variable';
  }
}

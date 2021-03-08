export default class NoBodyError extends Error {
  constructor() {
    super();
    this.message = 'No body in S3 response';
  }
}
